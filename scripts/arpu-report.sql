-- ARPU (Average Revenue Per User)
-- change 999 to your monthly price

WITH revenue AS (
  SELECT COUNT(*) * 999 AS total_revenue
  FROM public.user_billing
  WHERE payment_status = 'PAID'
),
users AS (
  SELECT COUNT(*) AS total_users FROM auth.users
)

SELECT
  u.total_users,
  r.total_revenue,
  ROUND((r.total_revenue::decimal / NULLIF(u.total_users,0)), 2) AS arpu_inr
FROM users u, revenue r;
