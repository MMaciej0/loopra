#!/usr/bin/env bash
set -euo pipefail

INCOMING=/srv/loopra/edge/incoming
LIVE=/srv/loopra/edge

cleanup() {
  rm -rf "$INCOMING"
}
trap cleanup EXIT

NGINX_IMAGE="$(docker compose -f "$INCOMING/docker-compose-edge.yml" config --images nginx)"

docker run --rm \
  -v "$INCOMING/edge/nginx/conf.d:/etc/nginx/conf.d:ro" \
  -v "$LIVE/edge/certbot/conf:/etc/letsencrypt:ro" \
  "$NGINX_IMAGE" nginx -t

rsync -a --inplace "$INCOMING/docker-compose-edge.yml" "$LIVE/docker-compose-edge.yml"
rsync -a --inplace --delete "$INCOMING/edge/nginx/" "$LIVE/edge/nginx/"

cd "$LIVE"
compose=(docker compose -f docker-compose-edge.yml)

"${compose[@]}" up -d
"${compose[@]}" exec -T nginx nginx -s reload
echo "edge deployed"
