-- resolve region product
SELECT rp.*
FROM region_products rp
JOIN products p ON p.id = rp.product_id
WHERE p.product_key = $1
  AND rp.region_code = $2
  AND rp.status = 'active';

-- resolve effective feature
WITH base AS (
  SELECT pfd.enabled, pfd.config
  FROM product_feature_defaults pfd
  WHERE pfd.product_id = $1
    AND pfd.feature_key = $4
),
regional AS (
  SELECT rfo.enabled, rfo.config
  FROM region_feature_overrides rfo
  WHERE rfo.product_id = $1
    AND rfo.region_code = $2
    AND rfo.feature_key = $4
),
org_override AS (
  SELECT ofo.enabled, ofo.config
  FROM org_feature_overrides ofo
  WHERE ofo.org_id = $3
    AND ofo.product_id = $1
    AND ofo.region_code = $2
    AND ofo.feature_key = $4
)
SELECT COALESCE(
  (SELECT enabled FROM org_override),
  (SELECT enabled FROM regional),
  (SELECT enabled FROM base),
  false
) AS enabled;
