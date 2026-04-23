#!/usr/bin/env bash
set -euo pipefail
rg -n "search\(|similarity|cosine|embedding|embed|vector|semantic|ai search|hybrid search|retriev" . \
  --glob '!node_modules' --glob '!.git' --glob '!dist' --glob '!build' --glob '!.next'
