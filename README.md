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

A rider logs in with email and password, or with Google. Two tokens keep the rider logged in, and both live in `httpOnly` cookies.

| Token         | What it is                    | Lifetime   | Where it is stored                            |
| ------------- | ----------------------------- | ---------- | --------------------------------------------- |
| Access token  | A signed JWT with the user id | 15 minutes | Only in the cookie                            |
| Refresh token | A random 32-byte value        | 30 days    | In the cookie, and as a SHA-256 hash in Redis |

The main decisions:

- **Refresh tokens live in Redis**, so a session can be cancelled. Logout deletes one token family, and a password change deletes all of them.
- **Every refresh rotates the refresh token.** If a replaced token is used again, all sessions of the user are closed. A 10-second reuse window lets two tabs refresh at the same moment ([ADR-0004](docs/adr/0004-replaced-refresh-token-has-a-reuse-window.md)).
- **Tokens are `httpOnly` cookies**, so a script on the page cannot read them. The price: every API call goes through the Next.js server.
- **Login gives one answer for every failure**, so nobody can test which emails have accounts.
- **Unverified accounts are disposable** when the real owner logs in with Google ([ADR-0002](docs/adr/0002-unverified-account-is-disposable.md)).

Known limits: a copied access token works until it expires (at most 15 minutes), and a refresh response that never reaches the browser logs the rider out.

The full reasons, the flow step by step, and all known limits are in [`docs/authentication.md`](docs/authentication.md).

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

### No race condition on a unique value

A **race condition** is a bug where two requests arrive at the same time and the result depends on which one is first.

**Problem:** the usual way to check a taken email is "`select`, and if nothing is found, `insert`". Two register requests with the same email can both pass the `select`. One of them then fails in the database, and the user gets a `500` error.

**Decision:** the `insert` does the check itself, with `onConflictDoNothing`. If no row comes back, the email is taken and the API answers `409`. There is no gap between the check and the write.

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
- [`docs/authentication.md`](docs/authentication.md) — login, tokens and cookies: every decision with its reasons.
- [`docs/adr/`](docs/adr) — decision records: a hard decision, the options, and why one was chosen.
- [`docs/product-vision.md`](docs/product-vision.md) and [`docs/features.md`](docs/features.md) — the product idea and the full feature plan.
