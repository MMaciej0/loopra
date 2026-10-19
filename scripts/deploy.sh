#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:?usage: deploy.sh <staging|production> <tag>}"
TAG="${2:?usage: deploy.sh <staging|production> <tag>}"

case "$ENVIRONMENT" in
  staging | production) ;;
  *)
    echo "unknown environment: $ENVIRONMENT" >&2
    exit 1
    ;;
esac

cd "/srv/loopra/$ENVIRONMENT"

export IMAGE_TAG="$TAG"
compose=(docker compose -f "docker-compose-$ENVIRONMENT.yml")

"${compose[@]}" pull api web
"${compose[@]}" run --rm api node dist/migrate.js
"${compose[@]}" up -d --wait
echo "deployed $TAG to $ENVIRONMENT"
