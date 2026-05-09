#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="docker-compose.prod.yml"
COMPOSE="docker compose -f ${COMPOSE_FILE}"

cd "$APP_DIR"

git fetch origin main
git pull --ff-only origin main

$COMPOSE build --pull
$COMPOSE up -d --wait db
$COMPOSE up -d --no-deps --scale backend=2 backend
$COMPOSE exec -T backend python manage.py migrate
$COMPOSE exec -T backend python manage.py collectstatic --noinput
$COMPOSE up -d --no-deps frontend
$COMPOSE up -d --remove-orphans
$COMPOSE ps

echo "Deployment completed successfully."
