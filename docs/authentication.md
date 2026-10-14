# Authentication

A rider logs in with email and password, or with Google. After that, two tokens keep the rider logged in. Both tokens live in `httpOnly` cookies.

The README has a short summary. This file has the full reasons for each decision.

## How it works

| Token         | What it is                    | Lifetime   | Where it is stored                            |
| ------------- | ----------------------------- | ---------- | --------------------------------------------- |
| Access token  | A signed JWT with the user id | 15 minutes | Only in the cookie                            |
| Refresh token | A random 32-byte value        | 30 days    | In the cookie, and as a SHA-256 hash in Redis |

1. **Login.** The API checks the password and creates a **token family** in Redis. One family is one login on one device. The API then sets both cookies.
2. **A normal request.** The request carries the access token. The API checks only the signature, so it asks no database and no Redis.
3. **The access token expires.** The web sends the refresh token to `POST /auth/refresh`.
4. **Rotation.** The API compares the token with the hash in Redis. If they match, it gives a new access token and a new refresh token. The old refresh token stops working. The compare and the write are one Lua script, so two refreshes at the same moment cannot both rotate.
5. **Logout.** The API deletes the family, so its refresh token can never be used again.

## Refresh tokens live in Redis

**Problem:** a JWT cannot be taken back. Once it is signed, it works until it expires. A refresh token lives for 30 days, so the API needs a way to cancel it.

**Decision:** the refresh token is not a JWT. It is a random value, and Redis holds the record that makes it valid. Redis fits this job well:

- **Expiry is built in.** Each family is saved with a 30-day `EX`, so old sessions disappear by themselves. There is no cleanup job.
- **"Log out everywhere" is one delete.** A Redis set (`user:families:<id>`) lists all families of one user. A password change and a password reset delete all of them.
- **Only a hash is stored.** If someone reads Redis, they get no token they can use.
- **The data is disposable.** If Redis loses everything, riders log in again. Nothing else is lost, so this data does not need to be in PostgreSQL.

Redis also holds the rate limit counters: five login attempts per 15 minutes for one IP address and for one email, and three emails per hour.

## A stolen refresh token logs everyone out

**Problem:** if someone steals a refresh token, they can keep a session alive for 30 days.

**Decision:** every refresh gives a new refresh token and makes the old one invalid. This is **refresh token rotation**. If an old token is used again, either the rider or the thief has a token that was already replaced. The API cannot know which one, so it deletes all families of that user and everyone must log in again.

There is one exception: for 10 seconds after a rotation, the token that was just replaced still gets a new access token, but no new refresh token. Two browser tabs, or one page with several requests, often refresh at the same moment, and only one of them can win. See [ADR-0004](adr/0004-replaced-refresh-token-has-a-reuse-window.md).

## Tokens live in `httpOnly` cookies

**Problem:** a token in `localStorage` can be read by any script on the page. One **XSS** bug (an attacker's script running on the site) is enough to steal it.

**Decision:** both tokens are `httpOnly` cookies, so JavaScript cannot read them. `sameSite: 'lax'` stops the browser from sending them on a `POST` from another site, which protects against **CSRF** (another site sending a request in the rider's name). In production the cookies are also `secure`, so they travel only over HTTPS.

## What the cookies cost in Next.js

`httpOnly` is safe, but it makes the web harder to build. The browser's JavaScript cannot read the token, so it cannot call the API by itself. Every API call goes through the Next.js server, in a Server Component or a Server Action. This brings four problems:

- **The Next.js server is not a browser.** It does not store cookies and send them back by itself. For each call, the web reads the rider's cookies and writes the `Cookie` header by hand. After a login or a refresh, it reads `Set-Cookie` from the API reply and writes the same cookies to the rider's browser. This code is in `apps/web/src/lib/cookies.ts`.
- **A Server Component cannot write cookies.** It can only read them. So a page cannot refresh the session while it renders. `apps/web/src/proxy.ts` runs before the page and does the refresh there. It puts the new tokens on the request, so the page sees them, and on the response, so the browser saves them.
- **One page makes many API calls.** If each of them refreshed the session, the second call would send a refresh token that the first call already replaced. The refresh function is wrapped in React `cache()`, so one render does only one refresh.
- **Google login takes a different path.** Google sends the browser to the API, not to the web. So here the API sets the cookies itself and then redirects to the web.

## Login does not leak information

**Problem:** if login says "this email does not exist", an attacker can test which emails have accounts. This is called **user enumeration**.

**Decision:** login gives one answer, `InvalidCredentialsError`, for an unknown email, a wrong password and a Google-only account. The error class is named after the response, not the cause, so this rule is visible in the code. "Forgot password" and "resend verification email" always answer `200` for the same reason.

## Unverified accounts are disposable

**Problem:** anyone can register with an email they do not own.

**Decision:** when the real owner later logs in with Google, the unverified account is deleted, so the stranger's password never opens the owner's account. See [ADR-0002](adr/0002-unverified-account-is-disposable.md).

## Known limits

- **An access token cannot be cancelled.** After a logout, a copied access token still works until it expires, at most 15 minutes later. This is the price of not asking Redis on every request.
- **`email_verified` is inside the JWT.** After a rider verifies the email, the old access token still says "not verified" until the next refresh.
- **A lost refresh response logs the rider out.** If the response of a rotation never reaches the browser (a closed tab, a lost connection), Redis holds the new token and the browser the replaced one. Its next refresh after the 10-second window is read as theft.
- **Google login needs one host.** The API sets the cookies in the Google flow. This works on `localhost`, because cookies do not look at the port. In production the API and the web must share a host, or the cookies need a `Domain`.
