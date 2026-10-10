# An unverified account is disposable

When a Google login meets an existing account with the same email and that account has `email_verified: false`, the account is deleted and a new one is created, exactly as if the email had never been seen. Its refresh token families are removed in the same step. An account with `email_verified: true` is linked as before: same `id`, and its password keeps working.

The reason is pre-account hijacking (#125). Anyone can register with an email they do not own, set a password and wait. Before this decision the first Google login of the real owner was linked to that row and marked it verified, so the stranger's password opened the owner's account. A password on an unverified account proves nothing about who owns the mailbox, so nothing from that account may survive the moment a real owner shows up.

## Considered options

Keeping the row and setting `password_hash` to `null` was the alternative. It closes the password, and an honest person who registered, never verified and then used Google would keep their username and locations. It was rejected because the password is only one of the things a stranger can leave behind: a username, a Selected Location and Favourite Locations today, and every column added later. That option needs each future column to be judged against this attack. Deleting the row needs no such memory — the cascade on `users.id` takes everything.

Dropping the password on every first Google login, verified accounts included, was also rejected. A verified account's password was set by someone who proved the mailbox, so there is no stranger to remove, and a Google-only account has no way to set a password again: password reset answers with the "you sign in with Google" email and `POST /auth/change-password` answers `OAUTH_ONLY_ACCOUNT`.

Refusing to link was rejected because it blocks the real owner from an email that someone else squatted.

## Consequences

An unverified account can hold nothing worth keeping, and this decision depends on that. Every ride and route write sits behind `requireVerifiedEmail`, and no code sets `email_verified` back to `false`, so an unverified account never owns a ride, a route or a participation. A feature that lets an unverified account create something of value, or a flow that un-verifies an account (an email change, for example), must revisit this.

An honest person who registered with a password, never verified and then logs in with Google silently loses their username and locations, and their password stops working. No message tells them. Password reset later sends the "you sign in with Google" email, which is the only explanation they get.

The delete and the create are not wrapped in one transaction. The create is a transaction of its own (the `users` row and the `oauth_accounts` row are written together, #127), and the delete stays outside it. If the create fails after the delete, the next Google login finds no account and creates one; the unverified row being gone is the wanted state either way.

The stranger's access token is a stateless JWT and lives up to 15 minutes after the delete. It carries `email_verified: false` and points to a user that no longer exists, so `/users/me` endpoints answer it with an error. That window is accepted; a deny-list checked on every request was judged too much for it.

One path is left open on purpose (#126): the real owner clicks the stranger's verification email, the account becomes verified with the stranger's password, and a later Google login links to it as a verified account.
