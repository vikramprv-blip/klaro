#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${1:-data/product_geo.db}"

sqlite3 "$DB_PATH" < sql/patches/007_professional_suites.sql

echo
echo "=== products ==="
sqlite3 -header -column "$DB_PATH" "
select id, product_key, product_name, product_surface
from products
where product_key in ('ca-suite', 'lawyer-suite')
order by product_key;
"

echo
echo "=== region_products ==="
sqlite3 -header -column "$DB_PATH" "
select p.product_key, rp.region_code, rp.legal_entity_code, rp.price_book_key, rp.policy_pack_key, rp.status
from region_products rp
join products p on p.id = rp.product_id
where p.product_key in ('ca-suite', 'lawyer-suite')
order by p.product_key, rp.region_code;
"

echo
echo "=== feature defaults ==="
sqlite3 -header -column "$DB_PATH" "
select p.product_key, pfd.feature_key, pfd.enabled, pfd.config_json
from product_feature_defaults pfd
join products p on p.id = pfd.product_id
where p.product_key in ('ca-suite', 'lawyer-suite')
order by p.product_key, pfd.feature_key;
"
