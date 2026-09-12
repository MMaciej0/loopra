# AGENTS.md

This file provides guidance to coding agents working in this repository.
It is the single source: `CLAUDE.md` imports it, so edit this file, not that one.

## Project Overview

**Loopra** is a global cycling community platform for organizing trips and trainings, and finding local riders to ride with. Core features: ride creation, group clubs, nearby rider discovery, and route sharing.

**Build order**: API first → Web (Next.js) → Mobile (Expo, last).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces |
| API | Fastify + TypeScript |
| Web | Next.js (App Router) |
| Database | PostgreSQL + PostGIS |
| ORM | Drizzle ORM |
| Auth | JWT (access + refresh tokens) via `@fastify/jwt` |
| Cache | Redis |
| Storage | S3-compatible (GPX files, avatars) |
| Request validation | Zod |
| Response schemas | TypeBox, in `packages/domain` |

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

Run the suite inside the container, never on the host:

```bash
docker exec api sh -c 'cd /app && pnpm --filter api test'
docker exec api sh -c 'cd /app/apps/api && pnpm exec vitest run test/modules/users/me.test.ts'   # single file
```

`pnpm --filter api test -- <path>` does **not** filter — the argument never reaches vitest and the whole suite runs. Call `vitest` directly for one file.

Vitest clones a template database per worker, so tests never touch the dev database. All external services are mocked or unreachable — the suite passes with entirely dummy `RESEND_API_KEY`, `GOOGLE_*` and `S3_*` values.

**There is no CI.** No `.github/` workflow exists, so the suite, `pnpm -r typecheck` and `pnpm --filter web lint` only run when you run them. A GitHub remote exists, and the tests need nothing but Postgres+PostGIS and Redis service containers, so Actions is available whenever someone writes the workflow.

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

| import | holds | dependencies |
|---|---|---|
| `@loopra/domain` | enums, bounds, error codes, DTO **types** | none |
| `@loopra/domain/schemas` | TypeBox response **schemas** | typebox |

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

- **PostGIS** for all geospatial queries (nearby riders/rides/groups use `ST_DWithin`)
- **Drizzle ORM** — schema-as-code in `db/schema.ts`, migrations via `drizzle-kit` into `apps/api/drizzle/`
- A **Ride** is the core domain object; `ride_type` (`casual`, `coffee_ride`, `sightseeing`, `training`) says what kind. See `CONTEXT.md` for the glossary
- Enum declaration order is UI display order, and the default value comes first. `drizzle-kit generate` reporting **"No schema changes"** is the check that `db/schema.ts` and `packages/domain/src/enums.ts` still agree
- All routes are registered as Fastify plugins for clean encapsulation
- `packages/domain` is the contract between API, web, and mobile
