#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
chflags nouchg .env .env.local 2>/dev/null || true
chmod 600 .env .env.local 2>/dev/null || true
echo "Env files unlocked for editing."
