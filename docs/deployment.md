# Deployment

How Loopra runs on a server, how a new version gets there, and what the server needs. The reasons behind the design are in [ADR-0006](adr/0006-one-server-isolated-stacks-one-image.md).

Live today: **staging** at [staging.loopra.cc](https://staging.loopra.cc). Production is prepared but not launched yet — `loopra.cc` redirects to staging for now.

## The big picture

One VPS (a rented virtual server, at OVHcloud) runs everything. On it, Docker Compose runs three separate **stacks** (groups of containers that are started and stopped together):

```
                    internet
                       │  :80 / :443
              ┌────────▼─────────┐
              │  edge            │  nginx + certbot
              │  (loopra-edge)   │  the only stack with public ports
              └───┬──────────┬───┘
     shared "edge" network   │
   ┌──────────────▼───┐  ┌───▼──────────────────┐
   │ loopra-staging   │  │ loopra-production    │
   │ web, api,        │  │ web, api,            │
   │ postgres, redis  │  │ postgres, redis      │
   └──────────────────┘  └──────────────────────┘
```

- **edge** (`docker-compose-edge.yml`) — Nginx receives every request and sends it to the right stack by its host name (`staging.loopra.cc` → staging). Certbot gets and renews the TLS certificates from Let's Encrypt.
- **staging** and **production** (`docker-compose-staging.yml`, `docker-compose-production.yml`) — each has its own `web`, `api`, Postgres, Redis, volumes and `.env`. They share nothing except the edge network. Staging data can never leak into production.

Only Nginx publishes ports on the host. The `api` and the databases are reachable only inside Docker networks.

### What Nginx sends where

For `staging.loopra.cc` ([`loopra.staging.conf`](../edge/nginx/conf.d/loopra.staging.conf)):

| Path                                    | Goes to         | Why                                                                                       |
| --------------------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `/auth/google`, `/auth/google/callback` | `api`           | Google redirects the browser here, so it must reach the API directly                      |
| `/api-health`                           | `api` `/health` | check the API from outside: `curl https://staging.loopra.cc/api-health`                   |
| `/robots.txt`                           | a static file   | tells search engines not to index staging, but lets LinkedIn read pages for link previews |
| everything else                         | `web`           | the website; the web calls the API inside Docker                                          |

Nginx **overwrites** the `X-Forwarded-For` header with the real client address. The web passes it on, and the api trusts it only from the `edge` and internal subnets. This is how the rate limits see the rider's IP and not the web server's IP (see "Client IP" in [`AGENTS.md`](../AGENTS.md)).

Plain HTTP (`:80`) answers only the Let's Encrypt challenge and redirects everything else to HTTPS. A request for an unknown host name gets no answer.

### One image for both environments

GitHub Actions builds one Docker image per app (`loopra-api`, `loopra-web`), tags it with the short commit SHA, and pushes it to **GHCR** (GitHub Container Registry). Staging and production run the same image. If the image for a SHA already exists, the deploy reuses it and does not build again, so production runs exactly the bytes that staging tested.

Everything that differs between environments comes from the environment at runtime, never from the build:

| Value      | staging      | production   | What it does                                                   |
| ---------- | ------------ | ------------ | -------------------------------------------------------------- |
| `NODE_ENV` | `production` | `production` | `secure` cookies, production CORS rule                         |
| `APP_ENV`  | `staging`    | `production` | staging indicator, guest accounts, the staging seed is allowed |

There is no `NEXT_PUBLIC_*` value, because Next.js bakes those into the build. The web reads the MapTiler key on the server at runtime instead.

## Deploying a new version

Deploys are manual. In GitHub: **Actions → Deploy → Run workflow**, then choose:

- **Environment** — `staging` or `production`.
- **Ref** — a branch, a tag or a **full** commit SHA. The default is `master`.

What [`deploy.yml`](../.github/workflows/deploy.yml) does, step by step:

1. Checks out the ref and takes its short SHA as the image tag.
2. Runs [`scripts/build-images.sh`](../scripts/build-images.sh): builds and pushes the `api` and `web` images, or skips an image that is already in GHCR.
3. Copies the environment's compose file and [`scripts/deploy.sh`](../scripts/deploy.sh) to `/srv/loopra/<environment>/` over SSH.
4. Runs `deploy.sh` on the server, which:
   - pulls the new images,
   - runs the database **migrations** (`node dist/migrate.js`) in a one-off container,
   - starts the stack with `docker compose up -d --wait`. `--wait` waits until every **healthcheck** passes: the api checks `GET /health` (Postgres and Redis answer), the web checks that `/` answers. If a container stays unhealthy, the deploy fails and you see it in the Actions log.

Two deploys of the same environment never run at the same time: the second one waits.

**Rollback:** run Deploy again with the full SHA of the last good commit. Its image is still in GHCR, so nothing is rebuilt. A rollback does not undo migrations — a migration that changed or removed data needs a new migration that fixes it.

### Promoting staging to production

Deploy a SHA to staging, check it on [staging.loopra.cc](https://staging.loopra.cc), then deploy the **same full SHA** to production.

### Deploying the edge (Nginx)

A change to `edge/nginx/` or `docker-compose-edge.yml` goes out with **Actions → Deploy edge**. [`scripts/deploy-edge.sh`](../scripts/deploy-edge.sh) first runs `nginx -t` (a config test) on the new files, and only then replaces the live config and reloads Nginx. A broken config never reaches the running Nginx.

## Scheduled jobs

| Workflow                                                        | When                 | What it does                                                        |
| --------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| [`check-cert.yml`](../.github/workflows/check-cert.yml)         | every day, 06:00 UTC | fails if a TLS certificate is invalid or has less than 20 days left |
| [`cleanup-images.yml`](../.github/workflows/cleanup-images.yml) | Mondays, 03:00 UTC   | keeps the newest 20 images of each app in GHCR, deletes the rest    |

Certbot tries to renew the certificates every 12 hours, and Nginx reloads every 6 hours to pick up a new one. `check-cert.yml` is the alarm if that loop ever stops.

A rollback can use only an image that `cleanup-images.yml` has not deleted yet — the newest 20 builds.

## What the server needs

This part lives on the server, not in the repo. These are the things the compose files and scripts expect.

### Folders

```
/srv/loopra/
  edge/          docker-compose-edge.yml, edge/nginx/, edge/certbot/{conf,www}
  staging/       docker-compose-staging.yml, deploy.sh, .env, web.env
  production/    docker-compose-production.yml, deploy.sh, .env, web.env
```

The workflows connect as the user `deploy`. That user must be able to run `docker` and write to `/srv/loopra`.

### The shared network

The three stacks meet on an **external** Docker network called `edge`. Compose does not create it, so it is created once by hand. Its subnet is pinned, because each api trusts proxy headers only from this range (`TRUSTED_PROXIES`):

```bash
docker network create --subnet 10.100.0.0/24 edge
```

| Network                      | Subnet          |
| ---------------------------- | --------------- |
| `edge` (shared)              | `10.100.0.0/24` |
| `loopra-staging_internal`    | `10.100.1.0/24` |
| `loopra-production_internal` | `10.100.2.0/24` |

### Env files

Each environment folder has two files. Compose sets `NODE_ENV`, `APP_ENV`, `PORT`, `TRUSTED_PROXIES` and the web's `API_URL` itself, so they are not in these files.

- **`.env`** — read by `api` and `postgres`: `POSTGRES_PASSWORD`, `DATABASE_URL` (host `postgres`), `REDIS_URL` (host `redis`), `JWT_ACCESS_SECRET`, `APP_URL`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, and the `S3_*` values. Use a different bucket per environment.
- **`web.env`** — read by `web`: `MAPTILER_KEY`, `APP_URL` (the public address, for example `https://staging.loopra.cc`; link previews need it).

Never copy staging secrets into production. The two stacks must not share a database, a Redis, a bucket or a JWT secret.

### GitHub secrets

| Secret               | What it is                                  |
| -------------------- | ------------------------------------------- |
| `DEPLOY_HOST`        | the server address                          |
| `DEPLOY_SSH_KEY`     | the private SSH key of the `deploy` user    |
| `DEPLOY_KNOWN_HOSTS` | the server's host key, so SSH can verify it |

GHCR login uses the built-in `GITHUB_TOKEN`; no secret is needed for it.

### The staging seed cron

Staging keeps about 10 future demo Rides around Kraków, so a visitor always has something to look at. The seed adds new Rides only when it is called, so a **daily cron job on the server** must call it:

```bash
docker exec loopra-staging-api-1 node dist/db/runStagingSeed.js
```

It is safe to run many times. It refuses to run when `APP_ENV` is `production`. Without the cron, the demo Rides slowly move into the past and the staging map becomes empty.

## Guest accounts

Only on staging, the login and register pages have a **Use a guest account** button. It creates a real, verified account with no email and no password, so a visitor can try every feature in one click. `POST /auth/guest` does not exist on other environments (it answers `404`). Guests get no emails and cannot change an email or a password.

## Search engines

Staging must not show up in search results. `robots.txt` disallows everything, and every staging response also carries `X-Robots-Tag: noindex, nofollow`.
