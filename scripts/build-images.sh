#!/usr/bin/env bash
set -euo pipefail

TAG="${1:?usage: scripts/build-images.sh <tag>}"

cd "$(dirname "$0")/.."

for app in api web; do
  docker build -f "apps/$app/Dockerfile" -t "ghcr.io/mmaciej0/loopra-$app:$TAG" .
  docker push "ghcr.io/mmaciej0/loopra-$app:$TAG"
done
