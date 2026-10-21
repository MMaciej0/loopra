ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

RUN corepack enable

COPY apps/api/package.json apps/api/
COPY packages/domain/package.json packages/domain/
COPY packages/gpx/package.json packages/gpx/

RUN pnpm install --frozen-lockfile --filter api... --ignore-scripts

COPY apps/api apps/api
COPY packages/domain packages/domain
COPY packages/gpx packages/gpx

RUN pnpm --filter api... build
RUN pnpm deploy --filter api --prod --legacy /out

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build --chown=node:node /out/package.json ./
COPY --from=build --chown=node:node /out/node_modules node_modules
COPY --from=build --chown=node:node /out/dist dist
COPY --from=build --chown=node:node /out/drizzle drizzle
COPY --from=build --chown=node:node /out/src/db/staging-routes dist/db/staging-routes

USER node

EXPOSE 8080

CMD ["node", "dist/index.js"]
