-- Which features drive the most conversions (paywall priority)

WITH blocked AS (
  SELECT user_id, feature
  FROM public.feature_usage_log
  WHERE status = 'BLOCKED'
),
paid AS (
  SELECT user_id
  FROM public.user_billing
  WHERE payment_status = 'PAID'
)

SELECT
  b.feature,
  COUNT(DISTINCT b.user_id) AS users_blocked,
  COUNT(DISTINCT CASE WHEN p.user_id IS NOT NULL THEN b.user_id END) AS users_converted,
  ROUND(
    COUNT(DISTINCT CASE WHEN p.user_id IS NOT NULL THEN b.user_id END)::decimal
    / NULLIF(COUNT(DISTINCT b.user_id),0) * 100,
    2
  ) AS conversion_pct
FROM blocked b
LEFT JOIN paid p ON p.user_id = b.user_id
GROUP BY b.feature
ORDER BY conversion_pct DESC, users_blocked DESC;
