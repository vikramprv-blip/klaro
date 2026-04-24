-- Users who hit a feature gate and later converted to PAID

WITH blocked_users AS (
  SELECT DISTINCT user_id
  FROM public.feature_usage_log
  WHERE status = 'BLOCKED'
),
converted AS (
  SELECT b.user_id
  FROM blocked_users b
  JOIN public.user_billing ub ON ub.user_id = b.user_id
  WHERE ub.payment_status = 'PAID'
)

SELECT
  COUNT(*) AS blocked_users,
  (SELECT COUNT(*) FROM converted) AS converted_users,
  ROUND(
    (SELECT COUNT(*) FROM converted)::decimal / NULLIF(COUNT(*),0) * 100,
    2
  ) AS conversion_pct
FROM blocked_users;
