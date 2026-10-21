#!/usr/bin/env bash
set -euo pipefail

TAG="${1:?usage: scripts/build-images.sh <tag>}"

cd "$(dirname "$0")/.."

for app in api web; do
  image="ghcr.io/mmaciej0/loopra-$app:$TAG"
  if docker manifest inspect "$image" >/dev/null 2>&1; then
    echo "$image already exists, not rebuilding"
    continue
  fi
  docker build -f "apps/$app/Dockerfile" -t "$image" .
  docker push "$image"
done
