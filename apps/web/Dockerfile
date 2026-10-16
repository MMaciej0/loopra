ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS build

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

RUN corepack enable

COPY apps/web/package.json apps/web/
COPY packages/domain/package.json packages/domain/

RUN pnpm install --frozen-lockfile --filter web... --ignore-scripts

COPY apps/web apps/web
COPY packages/domain packages/domain

RUN pnpm --filter @loopra/domain build
RUN API_URL=http://localhost:8080 pnpm --filter web build

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static apps/web/.next/static

USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
