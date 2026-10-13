# Loopra

[![CI](https://github.com/MMaciej0/loopra/actions/workflows/ci.yml/badge.svg)](https://github.com/MMaciej0/loopra/actions/workflows/ci.yml)

Loopra is a platform for cyclists. A rider creates a ride, other riders join it, and everyone can find rides near them on a map.

Strava is good at tracking a ride. Facebook groups are good at talking. Neither is good at the question "who can I ride with this Saturday?". Loopra is built to answer that question.

> **Status:** work in progress. The API and the website work. The mobile app is planned.

## Contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- How it is built, and why
  - [Authentication](#authentication)
  - [Rides](#rides)
  - [Finding rides](#finding-rides)
  - [Across the whole project](#across-the-whole-project)
- [Getting started](#getting-started)
- [Testing and CI](#testing-and-ci)
- [Roadmap](#roadmap)
- [More documentation](#more-documentation)

## Screenshots

**Rides on a map.** The map loads the rides for the area you are looking at.

![Rides map with a ride preview](docs/screenshots/rides-map.jpg)

**Rides as a list.** The same rides, ordered by start time, with filters.

![Rides list](docs/screenshots/rides-list.jpg)

**Ride page.** The ride contract, the stats and the join card.

![Ride page](docs/screenshots/ride-page.jpg)

**Create a ride.** The preview on the right changes while you type.

![Create-ride form with a live preview](docs/screenshots/create-ride.jpg)

## Features

What works today:

- **Accounts** — register with email and password, or log in with Google. Email verification and password reset by email.
- **Rides** — create a ride with a start point on a map, a date, a bike type, a ride type and a maximum number of riders.
- **Ride contract** — the organiser says how the group will ride: who waits for slow riders, who sets the pace, how the group rides on the road, and what experience is expected.
- **Find rides** — a list of rides near your location, and a map that loads rides for the area you are looking at.
- **Join and leave** — a ride has a real headcount. A full ride cannot be joined.
- **Routes** — upload a GPX file. The API calculates distance, ascent, descent and an elevation profile. The ride page draws the route on the map.
- **Locations** — save up to five favourite locations and pick one as the start for your search.
- **Two languages** — English and Polish. Light and dark theme.

## Tech stack

| Layer      | Technology                        | Why                                                         |
| ---------- | --------------------------------- | ----------------------------------------------------------- |
| Monorepo   | pnpm workspaces                   | API and web share one package with types and rules          |
| API        | Fastify + TypeScript              | Fast, and every feature is a small plugin                   |
| Database   | PostgreSQL + PostGIS              | PostGIS answers "which rides are in this area?" in SQL      |
| ORM        | Drizzle ORM                       | The schema is TypeScript code, and migrations are plain SQL |
| Cache      | Redis                             | Stores refresh tokens and rate limit counters               |
| Auth       | JWT access token + refresh token  | Short-lived access token, long-lived refresh token          |
| Storage    | S3-compatible storage             | Keeps the uploaded GPX files                                |
| Validation | Zod (requests), TypeBox (replies) | See [Across the whole project](#across-the-whole-project)   |
| Web        | Next.js (App Router) + React 19   | Server Components and Server Actions                        |
| UI         | Tailwind CSS + shadcn/ui          | Accessible components that I own and can change             |
| Maps       | MapLibre + MapTiler               | Map display and place search                                |
| Tests      | Vitest                            | Runs against a real Postgres, not a mock                    |
| CI         | GitHub Actions                    | Typecheck, lint, format, tests and build on every push      |

## Architecture

```
apps/
  api/        Fastify REST API. The core of the project.
  web/        Next.js website.
packages/
  domain/     The shared contract: enums, limits, error codes, response types and schemas.
  gpx/        GPX parsing, elevation profile, simplified path for the map.
docs/         Design documents and decision records.
```

How one request travels:

1. The browser calls a **Server Action** in `apps/web`.
2. The Server Action calls the **API** with the rider's JWT.
3. A **route** in the API validates the input with Zod and calls a **service**.
4. The service talks to PostgreSQL through Drizzle and returns a row.
5. A **response schema** from `packages/domain` decides which fields leave the API.

The API is split into modules (`auth`, `users`, `rides`, `routes`). Every module has the same shape: `routes.ts`, `schema.ts`, `errors.ts` and a `services/` folder with one file per operation. Services do not import Fastify, so they are easy to test and reuse.

## Authentication

A rider logs in with email and password, or with Google. After that, two tokens keep the rider logged in. Both tokens live in `httpOnly` cookies.

### How it works

| Token         | What it is                    | Lifetime   | Where it is stored                            |
| ------------- | ----------------------------- | ---------- | --------------------------------------------- |
| Access token  | A signed JWT with the user id | 15 minutes | Only in the cookie                            |
| Refresh token | A random 32-byte value        | 30 days    | In the cookie, and as a SHA-256 hash in Redis |

1. **Login.** The API checks the password and creates a **token family** in Redis. One family is one login on one device. The API then sets both cookies.
2. **A normal request.** The request carries the access token. The API checks only the signature, so it asks no database and no Redis.
3. **The access token expires.** The web sends the refresh token to `POST /auth/refresh`.
4. **Rotation.** The API compares the token with the hash in Redis. If they match, it gives a new access token and a new refresh token. The old refresh token stops working.
5. **Logout.** The API deletes the family, so its refresh token can never be used again.

### Refresh tokens live in Redis

**Problem:** a JWT cannot be taken back. Once it is signed, it works until it expires. A refresh token lives for 30 days, so the API needs a way to cancel it.

**Decision:** the refresh token is not a JWT. It is a random value, and Redis holds the record that makes it valid. Redis fits this job well:

- **Expiry is built in.** Each family is saved with a 30-day `EX`, so old sessions disappear by themselves. There is no cleanup job.
- **"Log out everywhere" is one delete.** A Redis set (`user:families:<id>`) lists all families of one user. A password change and a password reset delete all of them.
- **Only a hash is stored.** If someone reads Redis, they get no token they can use.
- **The data is disposable.** If Redis loses everything, riders log in again. Nothing else is lost, so this data does not need to be in PostgreSQL.

Redis also holds the rate limit counters: five login attempts per 15 minutes for one IP address and for one email, and three emails per hour.

### A stolen refresh token logs everyone out

**Problem:** if someone steals a refresh token, they can keep a session alive for 30 days.

**Decision:** every refresh gives a new refresh token and makes the old one invalid. This is **refresh token rotation**. If an old token is used again, either the rider or the thief has a token that was already replaced. The API cannot know which one, so it deletes all families of that user and everyone must log in again.

### Tokens live in `httpOnly` cookies

**Problem:** a token in `localStorage` can be read by any script on the page. One **XSS** bug (an attacker's script running on the site) is enough to steal it.

**Decision:** both tokens are `httpOnly` cookies, so JavaScript cannot read them. `sameSite: 'lax'` stops the browser from sending them on a `POST` from another site, which protects against **CSRF** (another site sending a request in the rider's name). In production the cookies are also `secure`, so they travel only over HTTPS.

### What the cookies cost in Next.js

`httpOnly` is safe, but it makes the web harder to build. The browser's JavaScript cannot read the token, so it cannot call the API by itself. Every API call goes through the Next.js server, in a Server Component or a Server Action. This brings four problems:

- **The Next.js server is not a browser.** It does not store cookies and send them back by itself. For each call, the web reads the rider's cookies and writes the `Cookie` header by hand. After a login or a refresh, it reads `Set-Cookie` from the API reply and writes the same cookies to the rider's browser. This code is in `apps/web/src/lib/cookies.ts`.
- **A Server Component cannot write cookies.** It can only read them. So a page cannot refresh the session while it renders. `apps/web/src/proxy.ts` runs before the page and does the refresh there. It puts the new tokens on the request, so the page sees them, and on the response, so the browser saves them.
- **One page makes many API calls.** If each of them refreshed the session, the second call would send a refresh token that the first call already replaced. Rotation would read this as theft and log the rider out. The refresh function is wrapped in React `cache()`, so one render does only one refresh.
- **Google login takes a different path.** Google sends the browser to the API, not to the web. So here the API sets the cookies itself and then redirects to the web.

### Login does not leak information

**Problem:** if login says "this email does not exist", an attacker can test which emails have accounts. This is called **user enumeration**.

**Decision:** login gives one answer, `InvalidCredentialsError`, for an unknown email, a wrong password and a Google-only account. The error class is named after the response, not the cause, so this rule is visible in the code. "Forgot password" and "resend verification email" always answer `200` for the same reason.

### No race condition on a taken email

A **race condition** is a bug where two requests arrive at the same time and the result depends on which one is first.

**Problem:** the usual way to check a taken email is "`select`, and if nothing is found, `insert`". Two register requests with the same email can both pass the `select`. One of them then fails in the database, and the user gets a `500` error.

**Decision:** the `insert` does the check itself, with `onConflictDoNothing`. If no row comes back, the email is taken and the API answers `409`. There is no gap between the check and the write.

### Unverified accounts are disposable

**Problem:** anyone can register with an email they do not own.

**Decision:** when the real owner later logs in with Google, the unverified account is deleted, so the stranger's password never opens the owner's account. See [ADR-0002](docs/adr/0002-unverified-account-is-disposable.md).

### Known limits

- **An access token cannot be cancelled.** After a logout, a copied access token still works until it expires, at most 15 minutes later. This is the price of not asking Redis on every request.
- **`email_verified` is inside the JWT.** After a rider verifies the email, the old access token still says "not verified" until the next refresh.
- **Rotation is not atomic.** The API reads the hash from Redis and then writes the new one, in two steps. Two refreshes at the same moment, for example from two browser tabs, can both pass. One of the tabs then holds a replaced token, and its next refresh logs the rider out everywhere.
- **Google login needs one host.** The API sets the cookies in the Google flow. This works on `localhost`, because cookies do not look at the port. In production the API and the web must share a host, or the cookies need a `Domain`.

## Rides

### Two riders cannot take the last seat

**Problem:** a ride has a maximum number of riders. Two riders can press "Join" at the same moment when one seat is left. If both requests read the headcount before either of them writes, both get in.

**Decision:** joining a ride locks the ride row (`SELECT ... FOR UPDATE`) inside a transaction. The second request waits for the first one to finish, and then sees a full ride.

## Finding rides

### Map search with PostGIS

**Problem:** the map must show rides for the visible area, and it must stay fast when there are many rides.

**Decision:** the web sends the map's bounding box (`bbox` — the four edges of the visible area). The API compares it with the ride's start point using the PostGIS `&&` operator, which can use a **GiST index** (an index made for geometry). The box has a maximum size of 100 km, so nobody can ask for the whole world in one request.

## Across the whole project

These decisions do not belong to one feature.

### One shared contract for API and web

**Problem:** the API and the website must agree on many things: the list of bike types, the maximum ride size, the error codes. If each app keeps its own copy, the copies drift apart.

**Decision:** everything both sides must agree on lives in `packages/domain`, and nowhere else. The package has two entry points. `@loopra/domain` has only types and constants. `@loopra/domain/schemas` has the TypeBox schemas. This split keeps TypeBox out of the browser bundle.

### A response schema on every endpoint

**Problem:** handlers send database rows straight to the client. A row from the `users` table includes `password_hash`.

**Decision:** every route declares a response schema. Fastify uses it to serialize the reply, and any field that is not in the schema is removed. The tests check the exact list of keys in each reply, so a leak fails a test.

### Tests against a real database

**Problem:** a mocked database cannot catch a wrong query or a missing constraint. A shared real database makes tests break each other.

**Decision:** before the tests start, the setup builds one template database with all migrations. Each Vitest worker then gets its own copy of that template. Tests run in parallel, each worker is isolated, and the development database is never touched.

## Getting started

You need **Docker**, **Node 22** and **pnpm 10.28.0**.

```bash
git clone git@github.com:MMaciej0/loopra.git
cd loopra
pnpm install
```

Create a `.env` file in the repo root. The API checks these variables at startup and stops with a clear error if one is missing:

```bash
# API
JWT_ACCESS_SECRET=          # at least 32 characters
APP_URL=http://localhost:3000
RESEND_API_KEY=             # email sending
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# Web
API_URL=http://api:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPTILER_KEY=
```

Start the services. The compose file is named `docker-compose-dev.yml`, so the `-f` flag is required:

```bash
docker compose -f docker-compose-dev.yml up -d --build
docker exec api sh -c 'cd /app && pnpm api:db:migrate'
```

The `api` and `web` containers do not start the dev servers by themselves. Start each one in its own terminal:

```bash
docker exec -it api sh -c 'cd /app && pnpm api:dev'   # http://localhost:8080
docker exec -it web sh -c 'cd /app && pnpm web:dev'   # http://localhost:3000
```

## Testing and CI

```bash
docker compose -f docker-compose-test.yml up -d --wait   # Postgres and Redis for tests
pnpm --filter api test                                   # API tests
pnpm --filter @loopra/gpx test                           # GPX package tests, no database needed
```

The API has more than 200 tests. They call real endpoints against a real PostgreSQL. External services (email, Google, storage) are mocked or never called, so the tests need no real keys.

The website has no automated tests. This is a choice: the UI still changes often, so I check web changes in the browser. The rules that must not break live in the API, and the API is tested.

CI runs on every pull request and every push to `master`:

| Job        | What it runs                                        |
| ---------- | --------------------------------------------------- |
| `checks`   | typecheck, lint, format check, GPX tests, web build |
| `api-test` | starts Postgres and Redis, then runs the API tests  |

The workflow has no logic of its own. Every step is a script that you can run on your own machine.

## Roadmap

- [ ] Chat for each ride
- [ ] Recurring rides ("every Sunday at 8:00")
- [ ] Clubs: a group of riders that publishes rides together
- [ ] Mobile app (Expo)

## More documentation

- [`CONTEXT.md`](CONTEXT.md) — the glossary. One word for one thing, used in the database, the API and the UI.
- [`docs/backend-design.md`](docs/backend-design.md) — the API design in detail.
- [`docs/adr/`](docs/adr) — decision records: a hard decision, the options, and why one was chosen.
- [`docs/product-vision.md`](docs/product-vision.md) and [`docs/features.md`](docs/features.md) — the product idea and the full feature plan.
