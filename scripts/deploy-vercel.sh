#!/usr/bin/env bash
set -euo pipefail

: "${VERCEL_DEPLOY_HOOK_URL:?Set VERCEL_DEPLOY_HOOK_URL first}"

curl -X POST "$VERCEL_DEPLOY_HOOK_URL"
echo ""
echo "Triggered Vercel deploy"
