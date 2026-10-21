# AGENTS.md

This file provides guidance to coding agents working in this repository.
It is the single source: `CLAUDE.md` imports it, so edit this file, not that one.

## Project Overview

**Loopra** is a global cycling community platform for organizing trips and trainings, and finding local riders to ride with. Core features: ride creation, group clubs, nearby rider discovery, and route sharing.

**Build order**: API first → Web (Next.js) → Mobile (Expo, last).

## Tech Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| Monorepo | pnpm workspaces                                  |
| API      | Fastify + TypeScript                             |
| Web      | Next.js (App Router)                             |
| Database | PostgreSQL + PostGIS                             |
| ORM      | Drizzle ORM                                      |
| Auth     | JWT (access + refresh tokens) via `@fastify/jwt` |
| Cache    | Redis                                            |
| Storage  | S3-compatible (GPX files, avatars)               |
| Schemas  | Zod, through `fastify-type-provider-zod`         |

Planned, not installed: Expo mobile app, `@fastify/websocket` for real-time, `@fastify/swagger` for API docs.

## Docker & Local Development

The compose file is named **`docker-compose-dev.yml`**, not `docker-compose.yml`. Bare `docker compose` commands fail with `no configuration file provided` — always pass `-f`.

Four services run: `api`, `web`, `loopra-postgres`, `loopra-redis`. Host ports: api `8080`, web `3000`, Postgres `5433`, Redis `6380`. A healthy api answers `404` on `/` (it has no root route); a healthy web answers `307` (next-intl locale redirect). Neither is an error. `GET /health` answers `200` when Postgres and Redis both answer, and `503` with the failed service marked `error` otherwise.

**The `api` and `web` containers do not start the dev servers.** Both use `command: "tail -f /dev/null"` and idle. Exec in and start them by hand — this is also how tests are run:

```bash
docker exec -it api sh    # then: pnpm api:dev
docker exec -it web sh    # then: pnpm web:dev
```

**Host and container `node_modules` are separate trees.** After adding a dependency or a workspace package, run `pnpm install` twice — once on the host, once via `docker exec api sh -c 'cd /app && pnpm install'`. Skipping the second one leaves the container resolving the old tree, and `@loopra/*` imports fail there while working on the host.

A `.env` file at the repo root configures connection strings pointing at the Docker services.

A new dev database is filled with `docker exec api sh -c 'cd /app/apps/api && pnpm db:migrate && pnpm db:seed'`. The seed adds four verified riders (`dev`, `anna`, `bartek`, `kasia` `@loopra.test`, password `Loopra-dev-123`) and rides around Kraków dated from today. It refuses a database that already has users, and refuses `NODE_ENV=production`.

The **staging seed** (`src/db/stagingSeed.ts`) keeps about 10 future demo Rides around Kraków. It creates 10 verified organisers (`@seed.loopra.cc`, a domain with no mail server, no password) once and reuses them. When fewer than 10 of their Rides are in the future, it adds Rides from a fixed list of templates, two days apart after the latest one, with the GPX routes from `src/db/staging-routes/` uploaded to S3. A seed Ride is one whose organiser is a seed account; past ones are kept. It is re-runnable and refuses any `APP_ENV` except `staging` and `development`:

```bash
docker exec api sh -c 'cd /app/apps/api && pnpm db:seed:staging'          # dev, after db:seed if you want both
docker exec loopra-staging-api-1 node dist/db/runStagingSeed.js           # staging VPS; a daily cron there must call this
```

Run `db:seed` first: it refuses a database with users, so it fails after the staging seed. The prod image gets the GPX files through a `COPY` in `apps/api/Dockerfile`.

## Testing

Two ways to run the suite, both supported. Inside the container:

```bash
docker exec api sh -c 'cd /app && pnpm --filter api test'
docker exec api sh -c 'cd /app/apps/api && pnpm exec vitest run test/modules/users/me.test.ts'   # single file
```

Or on the host, against the test stack — this is what CI does:

```bash
docker compose -f docker-compose-test.yml up -d --wait
pnpm --filter api test
```

`docker-compose-test.yml` runs Postgres+PostGIS and Redis only, on **5434** and **6381**, under its own compose project name so it never touches the dev stack. Both stacks can run at once. It declares `name: loopra-test` for that reason — without it compose derives the project from the directory and reconciles against the dev stack, recreating its containers.

`pnpm --filter api test -- <path>` does **not** filter — the argument never reaches vitest and the whole suite runs. Call `vitest` directly for one file.

`packages/gpx` has its own Vitest suite with no database or Docker: `pnpm --filter @loopra/gpx test`, on the host or in the container.

Vitest clones a template database per worker, so tests never touch the dev database. All external services are mocked or unreachable — the suite passes with entirely dummy `RESEND_API_KEY`, `GOOGLE_*` and `S3_*` values.

Those dummies live in `apps/api/.env.test`, committed through a `.gitignore` negation and loaded by `vitest.config.ts`. It is the one env file in this repo that is **tracked**, so never paste a real credential into it, even briefly — `git add -A` would commit it. To experiment locally, `git update-index --skip-worktree apps/api/.env.test` first. The load **does not override** variables already set, which is what keeps the container flow working: compose injects the real connection strings there, and they win over the file's host-facing `localhost:5434`.

### Web

Web has no automated tests, by choice. Verify web changes live in the browser and through console logs, and do not add a unit test runner to `apps/web`.

## CI

`.github/workflows/ci.yml` runs on every pull request and every push to `master`, cancelling superseded runs for the same ref. Two jobs in parallel:

| job        | runs                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `checks`   | `pnpm -r typecheck`, `pnpm -r lint`, `pnpm -r format:check`, `pnpm --filter @loopra/gpx test`, `pnpm --filter web build` |
| `api-test` | `docker compose -f docker-compose-test.yml up -d --wait`, then `pnpm --filter api test`                                  |

**The workflow holds no logic of its own** — every step invokes a workspace script you can run yourself. So "will CI pass" is answerable locally by running those six commands; there is no CI-only path to reason about. Keep it that way: put new logic in a script, not in the YAML.

`.github/dependabot.yml` opens weekly upgrade PRs for the pnpm workspace, the GitHub Actions and the images in the compose files: one grouped PR of minor and patch upgrades per ecosystem, and a separate PR for each major. Security updates stay outside the group. These are ordinary pull requests, so CI tests them with no extra workflow.

`checks` runs `next typegen` before typechecking. `apps/web/next-env.d.ts` and `.next/types/` are gitignored build output, and `tsc` needs them to resolve `.svg` imports and route types — so `pnpm -r typecheck` passes on a machine that has built the app and fails on a fresh clone until something generates them. `next typegen` does that without a full build.

The web build gets a placeholder `API_URL`. It needs it — some routes are SSG and prerender at build time, so an undefined base URL fails the build.

Node comes from `.nvmrc`, pnpm from the root `packageManager` field, and install is `--frozen-lockfile`, which also builds `packages/domain` and `packages/gpx` through their `prepare` scripts.

`pnpm -r` skips the workspace **root**, so the root `format`/`format:check` scripts run the recursive pass and then a second, glob-scoped prettier over the files no project owns: root `*.{json,md,yml,yaml}`, `docs/**/*.md`, and `.github/**`. Without that second pass this file, the README, the compose files and the workflow itself would be in no formatter's scope. YAML keeps double quotes via an override in the root `.prettierrc`, so formatting never rewrites compose port mappings.

Nothing is enforced yet: `master` has no branch protection, so a red run blocks nothing. Not checked by CI: migration drift (`drizzle-kit generate` reporting "No schema changes"), which is still a manual step.

## Package Manager

Always use **pnpm 10.28.0**. Root `package.json` holds the shortcuts (`api:dev`, `web:dev`, `api:test`, …); `pnpm -r typecheck` covers all four projects, and `pnpm -r lint` covers `web` alone, which is the only project with a `lint` script.

`packages/domain` and `packages/gpx` both declare `"prepare": "tsc"`, so a plain `pnpm install` builds them. Their `dist/` is gitignored and nothing else builds it — an install is what makes a fresh clone runnable.

## Monorepo Structure

```
apps/
  api/          # Fastify REST API — the core, serves web and mobile
  web/          # Next.js website
packages/
  domain/       # Shared vocabulary: enums, bounds, error codes, DTOs, Zod schemas
  gpx/          # GPX parsing, elevation profiles, simplified map paths
docs/           # Architecture and design documents
pnpm-workspace.yaml
```

### `packages/domain` — the shared contract

Everything the API and web must agree on lives here, and nowhere else: slug enums, numeric bounds, wire error codes, response DTOs. Neither app declares its own copy.

Two entry points, and the split is load-bearing:

| import                   | holds                                     | dependencies |
| ------------------------ | ----------------------------------------- | ------------ |
| `@loopra/domain`         | enums, bounds, error codes, DTO **types** | none         |
| `@loopra/domain/schemas` | Zod **schemas** shared by API and web     | `zod` (peer) |

Error codes come in two sets in `errors.ts`. `ERROR_TYPES` are the wire `type` of an error response. `VALIDATION_ERROR_TYPES` (`REQUIRED`, `INVALID_EMAIL`, `PASSWORD_TOO_SHORT`, …) are the Zod messages of the shared schemas. `APP_ERROR_TYPES` is both sets together — what web can translate. `isErrorType` and `isAppErrorType` check a value against them.

The main barrel has no path to `schemas/`, so importing a constant never loads Zod or every schema. `dto/*.ts` reaches its schemas through `import type` only (`z.output<typeof XResponseSchema>`), so the emitted JS is `export {}`. **Adding a `schemas/` re-export to `src/index.ts` would ship every schema to any browser code that imports a constant** — no error, no failing test.

Inside `packages/domain`, import Zod as `import { z } from 'zod'`. The default import (`import z from 'zod'`, also with `import type`) compiles, but the web reads the emitted `.d.ts` differently and every DTO type becomes `any` there — silently, since `skipLibCheck` is on. Quick check in web: `const x: SomeDto = 5` must be a type error.

## API Architecture (`apps/api`)

Key structure:

```
apps/api/src/
  index.ts          # Entry: starts server
  app.ts            # Fastify app factory
  config/           # Zod-validated env config
  plugins/          # Infrastructure (auth, cors, database, redis, storage, mailer, multipart, oauth, globalErrorHandler)
  modules/          # Feature modules — each is a Fastify plugin: auth, users, rides, routes, health
  db/
    schema.ts       # Drizzle table definitions, single file
  utils/            # errors (AppError), s3
drizzle/            # Generated migrations + snapshots
```

### Module Convention

`modules/users/` is the reference:

```
<module>/
  index.ts      # Registers the Fastify plugin + mounts routes
  routes.ts     # Route definitions: schema + service call + send
  schema.ts     # API-only Zod request schemas, if the module has any
  errors.ts     # Domain error classes, each extending AppError
  services/     # One file per operation, no Fastify imports
```

### Requests in, responses out

Zod is the only schema library ([ADR-0005](docs/adr/0005-zod-is-the-only-schema-library.md)). `buildApp` in `app.ts` sets the `fastify-type-provider-zod` validator and serializer compilers once, and every module's routes plugin is typed `FastifyPluginAsyncZod`. A route declares `schema: { body, querystring, params, response: { 200: XResponseSchema } }`, and the handler reads `request.body` / `request.query` / `request.params` already parsed and typed — no cast, no hand-written parse.

The one hand-written parse is in the Google callback (`GET /auth/google/callback`): `EmailSchema.safeParse(userinfo.email)`. It checks external data — the userinfo Google returns — not the request, so no route schema can do it. A failure answers `InvalidInputError` (`400 INVALID_INPUT`).

A response schema is the **only** thing filtering the database row — handlers send rows straight from Drizzle, and the serializer strips keys the schema does not list. An endpoint without one leaks every column, `password_hash` included. Add the schema with the route, and assert the exact key set in a test. A missing required field is not a dropped field: the serializer fails, the error is logged, and the endpoint answers **500**. Narrowing a query's columns without narrowing its schema breaks the endpoint outright.

**Where a schema lives.** In `packages/domain/src/schemas/` only when both API and web use it — one file per resource (`auth`, `user`, `location`, `route`, `ride`) plus `common.ts` for building blocks (`EmailSchema`, `PasswordSchema`, `UsernameSchema`, the `IsoDateTime` codec). API-only schemas go in the module's `schema.ts`; web-only ones stay in the web feature. A web form that needs more fields `.extend`s the shared schema; a really different form gets its own.

**Writing one.**

- Names: `<Thing>BodySchema`, `<Thing>QuerySchema`, `<Thing>ParamsSchema`, `<Thing>ResponseSchema`. DTO types are `z.output<typeof …>` through `import type`.
- `z.object` always, never `z.strictObject` / `z.looseObject`. Share fields by spreading `.shape` (`...SelectedLocationSchema.shape`).
- A shared schema uses an error code from `packages/domain` as its Zod message, so web can translate it. An API-only schema may keep Zod's default text.
- A date field is `IsoDateTime`: an ISO string on the wire, a `Date` in the API and in web. Do not convert response dates by hand.
- A params id is `z.object({ id: z.uuid(ERROR_TYPES.RIDE_NOT_FOUND) })` — the resource's not-found code as the message.

**What a bad request gets.** `plugins/globalErrorHandler.ts` turns the first Zod issue into the usual wire shape: body or query → `400 { type: INVALID_INPUT, message: <issue message>, field }`; params whose message is an error code → `404` with that code as `type`. Validation runs **before** `preHandler` hooks, so an unverified rider with a bad body or a malformed id gets `400`/`404`, not the `403` of `requireVerifiedEmail`.

**The exception:** the multipart GPX upload (`POST /routes`) has no body schema. The file is checked by `@loopra/gpx` and the multipart limits. Its response still has a Zod schema.

**Web side.** `publicRequest` / `protectedRequest` / `cookieRequest` in `apps/web/src/lib/api.ts` require the route's response `schema`, and the data type comes from it. `cookieRequest` sends a cookie the caller chooses (the refresh token for `/auth/refresh`, both tokens for `/auth/logout`). Do not call the raw `apiRequest` / `apiRequestWithCookie` outside `lib/api.ts`. Pass the real response schema even when the caller ignores the body. A reply that does not parse is logged with its issues and returned as `{ ok: false, errorType: UNKNOWN }`. The parse runs on the Next.js server only.

**Checks**, run from the repo root. Each must print nothing, except the last:

```bash
grep -rnE "request\.(body|query|params) as" apps/api/src         # no casts of request data
grep -L FastifyPluginAsyncZod apps/api/src/modules/*/routes.ts    # every routes file is typed for Zod
grep -rnE "import (type )?z from 'zod'" packages/domain/src       # named import only in domain
grep -rli typebox apps/*/src apps/*/package.json packages/*/src packages/*/package.json
grep -rlE "apiRequest(WithCookie)?\(" apps/web/src | grep -v lib/api.ts   # web parses every reply
realpath apps/api/node_modules/zod apps/web/node_modules/zod packages/domain/node_modules/zod | sort -u
```

The last one must print **one** path, a `zod@4.x` one: API, web and `packages/domain` share a single Zod copy, which the type provider and the shared schemas need. `pnpm why zod -r` also lists `zod 3.25.76`, but only under `shadcn` (and its `@modelcontextprotocol/sdk`). Web uses shadcn only for its CLI and the `shadcn/tailwind.css` import, never its JS at runtime, so that copy never meets our schemas. Ignore it, and do not change shadcn to remove it.

### Errors

Each module's `errors.ts` holds error classes extending `AppError`, and each carries its own status, wire type and message:

```ts
export class RideNotFoundError extends AppError {
  constructor() {
    super(404, ERROR_TYPES.RIDE_NOT_FOUND, 'Ride not found');
  }
}
```

Services throw them; controllers let them fall through to `plugins/globalErrorHandler.ts`, which is the only place that turns an error into a response. **No controller translates errors** — a `try/catch` in a controller means that endpoint performs a side effect on failure (both surviving ones clear auth cookies), never boilerplate.

`ERROR_TYPES` in `packages/domain` is the wire vocabulary shared with web. A validation code from `VALIDATION_ERROR_TYPES` goes on the wire too: as the `message` of a `400 INVALID_INPUT`, next to `field`, so web can show the same error its own form check would show. Name an error class for the **response it produces**, not the cause: login answers `InvalidCredentialsError` for an unknown email, a wrong password and a Google-only account (no `password_hash`), so the anti-enumeration behaviour is visible in the name rather than discoverable. Register does the same with `UserAlreadyExistsError` for every taken email. `OAUTH_ONLY_ACCOUNT` is answered only by `POST /auth/change-password`, which requires login — no unauthenticated endpoint may reveal how an account signs in.

A unique value is checked by the insert itself, never by a `select` first: `insert ... onConflictDoNothing({ target })`, then throw the module's error when no row came back. `registerUser` has no lookup before its insert for this reason — a `select` followed by an `insert` is a race condition, and the request that loses it gets a raw Postgres `23505`, which the handler answers as `500`. When the request that loses has a right to the result, do not throw: run the lookup again. `findOrCreateOAuthUser` does this — two Google logins of one rider must both end logged in, so an insert that returns no row starts the service again, at most three times.

### Client IP

The web calls the API from the Next.js server, so the socket address the API sees is the web server, not the rider. Two halves fix that, and each is unsafe without the other:

- **Web forwards.** `apiRequest` and `apiRequestWithCookie` in `apps/web/src/lib/api.ts` copy the incoming `X-Forwarded-For` header to the API request unchanged. The web parses nothing and decides nothing.
- **API trusts a list.** `TRUSTED_PROXIES` in `config/env.ts` goes to Fastify `trustProxy`. Unset means nothing is trusted and `request.ip` is the socket address.

**Never `trustProxy: true`.** Fastify would then take the leftmost address in the header, which the client writes. With a trust list it reads right to left and stops at the first address that is not trusted, so a value a client adds is ignored. `test/modules/auth/rateLimitClientIp.test.ts` holds this.

The auth rate limits and the request log both read `request.ip`. In production a reverse proxy must stand in front of the web and write the header, because the web forwards whatever arrives. The API port must not be published on the host — a direct caller from a trusted range could then set its own address. Conditions are tracked in #131.

Dev trusts `loopback,uniquelocal`: `uniquelocal` covers the `web` container, and `loopback` is there for the tests. Compose values win over `apps/api/.env.test` inside the container, and `app.inject` sends from `127.0.0.1`.

### Key Architectural Decisions

- **PostGIS** for all geospatial queries. Rides filter by a `bbox` with `&&` against `ST_MakeEnvelope`, so the GiST index serves it; the box's maximum size is `SEARCH_AREA_MAX_KM` in `packages/domain`
- **Drizzle ORM** — schema-as-code in `db/schema.ts`, migrations via `drizzle-kit` into `apps/api/drizzle/`
- **SQL-like queries only** — `db.select()` with joins, never `db.query` / `with:`. `db/schema.ts` declares no `relations()` and `drizzle()` gets no `schema`, so the relational API does not compile. A new table needs `.references()` and nothing more. A nested result is built in the service from two queries — `getRide` is the reference. With `leftJoin`, Drizzle nulls a nested object when its **first** key is `null`, so that key must be a `notNull` column (`route.id`)
- A **Ride** is the core domain object; `ride_type` (`casual`, `coffee_ride`, `sightseeing`, `training`) says what kind. See `CONTEXT.md` for the glossary
- Enum declaration order is UI display order, and the default value comes first. `drizzle-kit generate` reporting **"No schema changes"** is the check that `db/schema.ts` and `packages/domain/src/enums.ts` still agree
- All routes are registered as Fastify plugins for clean encapsulation
- `packages/domain` is the contract between API, web, and mobile

## Web Architecture (`apps/web`)

Code is grouped by feature, not by the URL that renders it:

```
apps/web/src/
  app/          # Routing files only: pages, layouts, error/not-found, route handlers
  features/     # All feature code: auth, landing, legal, locations, onboarding, rides/{browse,create,components}, settings, shell
  components/   # Feature-free only: ui/ (shadcn), icons/, providers/
  hooks/        # Hooks used by more than one feature
  lib/          # Shared helpers: api, cookies, errors, locale, user, cn
  i18n/         # next-intl routing and request config (messages live in apps/web/messages/)
```

A page reads params, fetches, and composes components from `features/`. **No `_components` or `_actions` folders inside `app/`** — Server Actions live in `features/<name>/actions/`, one action per file, named after the action (`login` → `login.ts`). A helper shared by several actions goes in a plain module outside `actions/` (`locations/to-location-body.ts`), because a `'use server'` file may only export async functions. A hook or helper with one user lives next to that user (`use-map.ts` sits in the create-ride location picker), and moves to `hooks/` or `lib/` only when a second feature needs it.

**Import rule:** `app` → `features` → `components` / `lib` / `hooks`. A feature may import another feature (the shell uses auth's logout). `components`, `lib` and `hooks` never import from `features`. Nothing enforces this, so check it with `grep -rn '@/features' apps/web/src/{components,lib,hooks}`. Imports across folders use the `@/` alias.

**Feature parts:** a big feature may be split into parts, each with the usual shape (`actions/`, `components/`, helper files): `rides/browse` is the `/rides` page with its list and map views, `rides/create` is the create-ride page. Parts share code through `<feature>/components/` (`rides/components/ride-card/`), and never import each other in both directions — if two parts do, they are one part.

**File naming rule:** a file is named after its main export, in kebab-case (`RidesMap` → `rides-map.tsx`). **No `index.tsx` files** — they hide the component's name from Ctrl+P and editor tabs. A component with private subcomponents, hooks or helpers gets a folder, and its main file repeats the folder name: `ride-card/ride-card.tsx`, imported as `@/features/rides/components/ride-card/ride-card`. Do not shorten that with an `index.ts` re-export. A folder holding a single file is flattened to that file. A folder may also be a plain group with no main file (`create/components/form/`, `location-modal/`). Check it with `find apps/web/src -name 'index.ts*'`, which should print nothing.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `MMaciej0/loopra`, operated via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.
