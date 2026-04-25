#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
chmod 600 .env .env.local 2>/dev/null || true
chflags uchg .env .env.local 2>/dev/null || true
echo "Env files locked."
