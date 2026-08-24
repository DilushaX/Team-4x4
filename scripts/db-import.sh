#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SQL_FILE="$ROOT/database/team4x4.sql"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "Missing $SQL_FILE"
  exit 1
fi

echo "Waiting for MySQL..."
for i in {1..30}; do
  if docker compose -f "$ROOT/docker-compose.yml" exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    break
  fi
  sleep 2
done

echo "Importing schema and seed data..."
docker compose -f "$ROOT/docker-compose.yml" exec -T mysql mysql -u root team4x4 < "$SQL_FILE"

echo "Done. Admin login: admin@team4x4.lk / admin"
