# One server, an isolated stack per environment, one image for both

Staging and prod run on one VPS. Each environment is its own Docker Compose project, with its own `api`, `web`, Postgres, Redis, volumes, networks and `.env` file. Staging and prod never share a database, a Redis or a storage bucket. One Nginx container in front, on a shared `edge` network, sends each request to the right stack by its host name: `staging.loopra.cc` to staging, and later `loopra.cc` to prod. Only Nginx publishes ports on the host.

Each app has one production `Dockerfile`. GitHub Actions builds the image once, tags it with the commit SHA and pushes it to GHCR. Staging runs that image, and prod later runs **the same image**, with no rebuild. Everything that differs between the environments comes from the `.env` file at runtime:

- `NODE_ENV=production` in both. The API uses it for `secure` cookies and the production CORS rule, so staging must have it too.
- `APP_ENV=staging` or `APP_ENV=production` says which environment it is: the staging banner, and anything else that must differ.
- No environment value is baked into the web build. A `NEXT_PUBLIC_*` value is fixed at build time, so the MapTiler key is read on the Next.js server at runtime instead, and the Google login link is a relative path.

The reasons:

- **Cost.** Loopra is a CV project with few riders. One small VPS is enough for both environments, and the second stack costs only RAM.
- **Staging tests what prod runs.** If each environment built its own image, a difference between the builds would show up only in prod. Promoting one image makes "it worked on staging" mean something.
- **Moving prod out stays cheap.** Because the stacks share nothing but Nginx, prod can move to its own server later, and only the Nginx config changes.

## Considered options

A server per environment was rejected for now. It doubles the cost and the server setup, and the risk it removes (a broken staging slowing prod down) is small at Loopra's size.

An image per environment (`Dockerfile.staging`, `Dockerfile.production`) was rejected for the second reason above.

One compose file for both environments, started with a different project name, was considered. Two full files, `docker-compose-staging.yml` and `docker-compose-production.yml`, were chosen so that each environment is visible by name in the repo. The price is duplicated content.

## Consequences

- A change to one production compose file must be made in the other one in the same pull request. Otherwise prod drifts from what staging tested.
- The compose files set no `container_name`, because the names would clash between the two stacks. On the shared `edge` network each service has an alias that names its environment (for example `staging-api`), because both stacks have a service called `api`.
- A bad staging deploy that eats memory or disk can slow down prod on the same machine. Docker log rotation and resource limits keep this small.
- A web feature that needs an environment value in the browser must get it from the server at runtime, never from `NEXT_PUBLIC_*`.
- `TRUSTED_PROXIES` for each `api` lists the pinned `edge` subnet and the stack's own internal subnet, and nothing wider.
