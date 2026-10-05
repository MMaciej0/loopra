# AGENTS.md

This file provides guidance to coding agents working in this repository.
It is the single source: `CLAUDE.md` imports it, so edit this file, not that one.

## Project Overview

**Loopra** is a global cycling community platform for organizing trips and trainings, and finding local riders to ride with. Core features: ride creation, group clubs, nearby rider discovery, and route sharing.

**Build order**: API first → Web (Next.js) → Mobile (Expo, last).

## Tech Stack

| Layer              | Technology                                       |
| ------------------ | ------------------------------------------------ |
| Monorepo           | pnpm workspaces                                  |
| API                | Fastify + TypeScript                             |
| Web                | Next.js (App Router)                             |
| Database           | PostgreSQL + PostGIS                             |
| ORM                | Drizzle ORM                                      |
| Auth               | JWT (access + refresh tokens) via `@fastify/jwt` |
| Cache              | Redis                                            |
| Storage            | S3-compatible (GPX files, avatars)               |
| Request validation | Zod                                              |
| Response schemas   | TypeBox, in `packages/domain`                    |

Planned, not installed: Expo mobile app, `@fastify/websocket` for real-time, `@fastify/swagger` for API docs.

## Docker & Local Development

The compose file is named **`docker-compose-dev.yml`**, not `docker-compose.yml`. Bare `docker compose` commands fail with `no configuration file provided` — always pass `-f`.

Four services run: `api`, `web`, `loopra-postgres`, `loopra-redis`. Host ports: api `8080`, web `3000`, Postgres `5433`, Redis `6380`. A healthy api answers `404` on `/` (it has no root route); a healthy web answers `307` (next-intl locale redirect). Neither is an error.

**The `api` and `web` containers do not start the dev servers.** Both use `command: "tail -f /dev/null"` and idle. Exec in and start them by hand — this is also how tests are run:

```bash
docker exec -it api sh    # then: pnpm api:dev
docker exec -it web sh    # then: pnpm web:dev
```

**Host and container `node_modules` are separate trees.** After adding a dependency or a workspace package, run `pnpm install` twice — once on the host, once via `docker exec api sh -c 'cd /app && pnpm install'`. Skipping the second one leaves the container resolving the old tree, and `@loopra/*` imports fail there while working on the host.

A `.env` file at the repo root configures connection strings pointing at the Docker services.

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

Vitest clones a template database per worker, so tests never touch the dev database. All external services are mocked or unreachable — the suite passes with entirely dummy `RESEND_API_KEY`, `GOOGLE_*` and `S3_*` values.

Those dummies live in `apps/api/.env.test`, committed through a `.gitignore` negation and loaded by `vitest.config.ts`. It is the one env file in this repo that is **tracked**, so never paste a real credential into it, even briefly — `git add -A` would commit it. To experiment locally, `git update-index --skip-worktree apps/api/.env.test` first. The load **does not override** variables already set, which is what keeps the container flow working: compose injects the real connection strings there, and they win over the file's host-facing `localhost:5434`.

### Web

Web has no automated tests, by choice. Verify web changes live in the browser and through console logs, and do not add a unit test runner to `apps/web`.

## CI

`.github/workflows/ci.yml` runs on every pull request and every push to `master`, cancelling superseded runs for the same ref. Two jobs in parallel:

| job        | runs                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| `checks`   | `pnpm -r typecheck`, `pnpm -r lint`, `pnpm -r format:check`, `pnpm --filter web build`  |
| `api-test` | `docker compose -f docker-compose-test.yml up -d --wait`, then `pnpm --filter api test` |

**The workflow holds no logic of its own** — every step invokes a workspace script you can run yourself. So "will CI pass" is answerable locally by running those five commands; there is no CI-only path to reason about. Keep it that way: put new logic in a script, not in the YAML.

`checks` runs `next typegen` before typechecking. `apps/web/next-env.d.ts` and `.next/types/` are gitignored build output, and `tsc` needs them to resolve `.svg` imports and route types — so `pnpm -r typecheck` passes on a machine that has built the app and fails on a fresh clone until something generates them. `next typegen` does that without a full build.

The web build gets placeholder `API_URL`, `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAPTILER_KEY`. It needs them — some routes are SSG and prerender at build time, so an undefined base URL fails the build.

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
  domain/       # Shared vocabulary: enums, bounds, error codes, DTOs, TypeBox schemas
  gpx/          # GPX parsing, elevation profiles
docs/           # Architecture and design documents
pnpm-workspace.yaml
```

### `packages/domain` — the shared contract

Everything the API and web must agree on lives here, and nowhere else: slug enums, numeric bounds, wire error codes, response DTOs. Neither app declares its own copy.

Two entry points, and the split is load-bearing:

| import                   | holds                                     | dependencies |
| ------------------------ | ----------------------------------------- | ------------ |
| `@loopra/domain`         | enums, bounds, error codes, DTO **types** | none         |
| `@loopra/domain/schemas` | TypeBox response **schemas**              | typebox      |

The main barrel has no path to `schemas/`, which is what keeps TypeBox out of the web bundle. `dto/*.ts` reaches its schemas through `import type` only, so the emitted JS is `export {}`. **Adding a `schemas/` re-export to `src/index.ts` would ship TypeBox to the browser silently** — no error, no failing test.

## API Architecture (`apps/api`)

See `docs/backend-design.md` for full design. Key structure:

```
apps/api/src/
  index.ts          # Entry: starts server
  app.ts            # Fastify app factory
  config/           # Zod-validated env config
  plugins/          # Infrastructure (auth, cors, database, redis, storage, mailer, multipart, oauth, globalErrorHandler)
  modules/          # Feature modules — each is a Fastify plugin: auth, users, rides, routes
  db/
    schema.ts       # Drizzle table definitions, single file
  utils/            # errors (AppError), validation (parseBody/parseSearchParams), s3
drizzle/            # Generated migrations + snapshots
```

### Module Convention

`modules/users/` is the reference:

```
<module>/
  index.ts      # Registers the Fastify plugin + mounts routes
  routes.ts     # Route definitions: schema + service call + send
  schema.ts     # Zod schemas for requests
  errors.ts     # Domain error classes, each extending AppError
  services/     # One file per operation, no Fastify imports
```

### Requests in, responses out

Two schema systems, split by direction:

- **Requests** are Zod, parsed explicitly in the controller with `parseBody` / `parseSearchParams`. Zod is used because the input side needs coercion (`z.coerce.date()`) and transforms (`distance_km` → string for Drizzle's `numeric`) that JSON Schema cannot express.
- **Responses** are TypeBox schemas from `@loopra/domain/schemas`, declared as `schema: { response: { 200: XResponseSchema } }` on every route.

A response schema is the **only** thing filtering the database row — handlers send rows straight from Drizzle, so an endpoint without one leaks every column, `password_hash` included. Add the schema with the route, and assert the exact key set in a test.

Two schema gotchas, both load-bearing:

- TypeBox v1 has no `Type.Composite`, and `Type.Intersect` emits `allOf`, which `fast-json-stringify` handles poorly. Compose by spreading shared **property maps** into `Type.Object` so every schema stays a flat `type: object`.
- A missing required field is not a dropped field: `fast-json-stringify` throws and the endpoint returns **500**. Narrowing a query's columns without narrowing its schema breaks the endpoint outright.

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

`ERROR_TYPES` in `packages/domain` is the wire vocabulary shared with web. Name an error class for the **response it produces**, not the cause: login answers `InvalidCredentialsError` for both an unknown email and a wrong password, so the anti-enumeration behaviour is visible in the name rather than discoverable.

### Key Architectural Decisions

- **PostGIS** for all geospatial queries. Rides filter by a `bbox` with `&&` against `ST_MakeEnvelope`, so the GiST index serves it; the box's maximum size is `SEARCH_AREA_MAX_KM` in `packages/domain`
- **Drizzle ORM** — schema-as-code in `db/schema.ts`, migrations via `drizzle-kit` into `apps/api/drizzle/`
- A **Ride** is the core domain object; `ride_type` (`casual`, `coffee_ride`, `sightseeing`, `training`) says what kind. See `CONTEXT.md` for the glossary
- Enum declaration order is UI display order, and the default value comes first. `drizzle-kit generate` reporting **"No schema changes"** is the check that `db/schema.ts` and `packages/domain/src/enums.ts` still agree
- All routes are registered as Fastify plugins for clean encapsulation
- `packages/domain` is the contract between API, web, and mobile

## Web Architecture (`apps/web`)

Code is grouped by feature, not by the URL that renders it:

```
apps/web/src/
  app/          # Routing files only: pages, layouts, error/not-found, @topnav slot, route handlers
  features/     # All feature code: auth, locations, shell, rides/{list,map,create,ride-card}
  components/   # Feature-free only: ui/ (shadcn), icons/, providers/
  hooks/        # Hooks used by more than one feature
  lib/          # Shared helpers: api, cookies, errors, locale, user, cn
  i18n/         # next-intl routing and request config (messages live in apps/web/messages/)
```

A page reads params, fetches, and composes components from `features/`. **No `_components` or `_actions` folders inside `app/`** — Server Actions live in `features/<name>/actions/`. A hook or helper with one user lives next to that user (`use-map.ts` sits in the create-ride location picker), and moves to `hooks/` or `lib/` only when a second feature needs it.

**Import rule:** `app` → `features` → `components` / `lib` / `hooks`. A feature may import another feature (the shell uses auth's logout). `components`, `lib` and `hooks` never import from `features`. Nothing enforces this, so check it with `grep -rn '@/features' apps/web/src/{components,lib,hooks}`. Imports across folders use the `@/` alias.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `MMaciej0/loopra`, operated via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.
