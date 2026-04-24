#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/retention-run.sh [--dry-run]
# Requires: DIRECT_URL env var set

DRY_RUN="${1:-}"

echo "== Klaro Retention Runner =="

echo "-> Health check"
npx prisma db execute --url "$DIRECT_URL" --file scripts/retention-health-check.sql

if [[ "$DRY_RUN" == "--dry-run" ]]; then
  echo "-> DRY RUN preview"
  npx prisma db execute --url "$DIRECT_URL" --file scripts/retention-dry-run.sql
  exit 0
fi

echo "-> Safety check (must be 0)"
npx prisma db execute --url "$DIRECT_URL" --file scripts/prevent-delete-if-paid.sql

echo "-> Apply retention config (expire + set deletion dates)"
npx prisma db execute --url "$DIRECT_URL" --file scripts/apply-retention-config.sql

echo "-> Audit log"
npx prisma db execute --url "$DIRECT_URL" --file scripts/retention-audit-log.sql

echo "-> Delete app data (safe)"
npx prisma db execute --url "$DIRECT_URL" --file scripts/delete-expired-user-data-safe.sql

echo "-> Done"
