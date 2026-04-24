-- LTV by signup cohort (monthly)
-- change 999 to your monthly price

WITH cohort AS (
  SELECT
    u.id,
    date_trunc('month', u.created_at) AS signup_month
  FROM auth.users u
),
paid AS (
  SELECT
    user_id,
    COUNT(*) * 999 AS revenue
  FROM public.payments_log
  GROUP BY user_id
)

SELECT
  c.signup_month,
  COUNT(*) AS total_users,
  COALESCE(SUM(p.revenue),0) AS total_revenue,
  ROUND(COALESCE(SUM(p.revenue),0)::decimal / NULLIF(COUNT(*),0), 2) AS ltv_per_user
FROM cohort c
LEFT JOIN paid p ON p.user_id = c.id
GROUP BY c.signup_month
ORDER BY c.signup_month DESC;
