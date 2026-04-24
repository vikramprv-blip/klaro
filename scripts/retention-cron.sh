#!/usr/bin/env bash
set -euo pipefail

# Daily retention cron (run via cron or manually)

export DIRECT_URL="${DIRECT_URL:?DIRECT_URL not set}"

echo "[$(date)] Running Klaro retention job..."

./scripts/retention-run.sh

echo "[$(date)] Retention job completed"
