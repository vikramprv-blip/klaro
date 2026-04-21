#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${1:-data/product_geo.db}"

echo "=== region_products ==="
sqlite3 -header -column "$DB_PATH" "select p.product_key, rp.region_code, rp.legal_entity_code, rp.price_book_key, rp.policy_pack_key, rp.status from region_products rp join products p on p.id = rp.product_id order by p.product_key, rp.region_code;"

echo
echo "=== regional feature overrides ==="
sqlite3 -header -column "$DB_PATH" "select p.product_key, rfo.region_code, rfo.feature_key, rfo.enabled, rfo.config_json from region_feature_overrides rfo join products p on p.id = rfo.product_id order by p.product_key, rfo.region_code, rfo.feature_key;"

echo
echo "=== LAM policies ==="
sqlite3 -header -column "$DB_PATH" "select key, region_code, version, active from lam_policies order by region_code;"
