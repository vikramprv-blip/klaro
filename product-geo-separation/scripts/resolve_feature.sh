#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${1:-data/product_geo.db}"
PRODUCT_KEY="${2:?product_key required}"
REGION_CODE="${3:?region_code required}"
ORG_ID="${4:-}"
FEATURE_KEY="${5:?feature_key required}"

sqlite3 -header -column "$DB_PATH" "
WITH product_ref AS (
  SELECT id AS product_id FROM products WHERE product_key = '$PRODUCT_KEY'
),
base AS (
  SELECT enabled, config_json
  FROM product_feature_defaults
  WHERE product_id = (SELECT product_id FROM product_ref)
    AND feature_key = '$FEATURE_KEY'
),
regional AS (
  SELECT enabled, config_json
  FROM region_feature_overrides
  WHERE product_id = (SELECT product_id FROM product_ref)
    AND region_code = '$REGION_CODE'
    AND feature_key = '$FEATURE_KEY'
),
org_override AS (
  SELECT enabled, config_json
  FROM org_feature_overrides
  WHERE org_id = '$ORG_ID'
    AND product_id = (SELECT product_id FROM product_ref)
    AND region_code = '$REGION_CODE'
    AND feature_key = '$FEATURE_KEY'
)
SELECT
  '$PRODUCT_KEY' AS product_key,
  '$REGION_CODE' AS region_code,
  '$ORG_ID' AS org_id,
  '$FEATURE_KEY' AS feature_key,
  COALESCE(
    (SELECT enabled FROM org_override),
    (SELECT enabled FROM regional),
    (SELECT enabled FROM base),
    0
  ) AS enabled,
  COALESCE(
    (SELECT config_json FROM org_override),
    (SELECT config_json FROM regional),
    (SELECT config_json FROM base),
    '{}'
  ) AS effective_config;
"
