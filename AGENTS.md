# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**Loopra** is a global cycling community platform for organizing trips and trainings, and finding local riders to ride with. Core features: event/trip creation, group clubs, nearby rider discovery, and route sharing.

**Build order**: API first → Web (Next.js) → Mobile (Expo, last).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces |
| API | Fastify + TypeScript |
| Web | Next.js (App Router) |
| Mobile | Expo (React Native) |
| Database | PostgreSQL + PostGIS |
| ORM | Drizzle ORM |
| Auth | JWT (access + refresh tokens) via `@fastify/jwt` |
| Real-time | `@fastify/websocket` |
| Cache | Redis |
| Storage | S3-compatible (GPX files, avatars) |
| Validation | Zod |
| API Docs | `@fastify/swagger` + `@fastify/swagger-ui` |

## Docker & Local Development

The entire project runs in Docker. **All services are managed via Docker Compose.**

```bash
docker compose up           # Start all services (API, PostgreSQL, Redis)
docker compose up --build   # Rebuild images and start
docker compose down         # Stop all services
docker compose logs -f api  # Tail API logs
```

Local development still uses `pnpm --filter api dev` (with hot reload via tsx watch), but the database and Redis always run in Docker. A `.env` file (see `.env.example`) configures connection strings pointing to the local Docker services.

## CI/CD — GitHub Actions

CI runs on every push and pull request to `main`. **No deployment actions** — servers are not provisioned yet. Pipeline:

1. **Test** — runs `pnpm --filter api test` against a test database spun up in the workflow
2. **Lint + Typecheck** — `pnpm -r lint && pnpm -r typecheck`

Deployment actions will be added when servers are available.

## Package Manager

Always use **pnpm 10.28.0**.

```bash
pnpm install                              # Install all workspace deps
pnpm --filter api dev                     # Run API in dev mode
pnpm --filter api test                    # Run API tests
pnpm --filter api test -- --testPathPattern=auth  # Run single test file
pnpm --filter api db:migrate              # Run DB migrations
pnpm --filter api db:generate            # Generate Drizzle migrations
pnpm --filter api db:studio              # Open Drizzle Studio
pnpm --filter web dev                    # Run web in dev mode
pnpm -r build                            # Build all packages
pnpm -r lint                             # Lint all packages
pnpm -r typecheck                        # Type-check all packages
```

## Monorepo Structure

```
apps/
  api/          # Fastify REST API — the core, serves web and mobile
  web/          # Next.js website
  mobile/       # Expo app (built last)
packages/
  types/        # Shared TypeScript types (API contracts, domain models)
  config/       # Shared env/config schemas (Zod-validated)
docs/           # Architecture and design documents
pnpm-workspace.yaml
```

## API Architecture (`apps/api`)

See `docs/backend-design.md` for full design. Key structure:

```
apps/api/src/
  index.ts          # Entry: starts server
  app.ts            # Fastify app factory
  config/           # Zod-validated env config
  plugins/          # Infrastructure plugins (db, auth, redis, storage, cors, swagger)
  modules/          # Feature modules — each is a Fastify plugin
    auth/
    users/
    events/         # Trips + trainings unified
    groups/
    routes/         # GPX cycling routes
    discovery/      # Nearby riders/events/groups
    notifications/
  db/
    schema/         # Drizzle table definitions
    migrations/
  lib/              # Shared helpers (errors, pagination, geo, gpx)
```

### Module Convention

Each module under `modules/` follows this pattern:
```
<module>/
  index.ts      # Registers the Fastify plugin + mounts routes
  routes.ts     # Route definitions with schemas
  schema.ts     # Zod schemas for request/response
  service.ts    # Business logic (no Fastify deps)
```

### Key Architectural Decisions

- **PostGIS** for all geospatial queries (nearby riders/events/groups use `ST_DWithin`)
- **Drizzle ORM** — schema-as-code in `db/schema/`, migrations via `drizzle-kit`
- Events model unifies "trips" and "trainings" via a `type` discriminator field
- All routes are registered as Fastify plugins for clean encapsulation
- Shared types in `packages/types` are the contract between API, web, and mobile
