-- Estimated LTV (simple): total revenue / total users
-- change 999 to your monthly price

WITH paid AS (
  SELECT COUNT(*) AS paid_users
  FROM public.user_billing
  WHERE payment_status = 'PAID'
),
users AS (
  SELECT COUNT(*) AS total_users FROM auth.users
)

SELECT
  u.total_users,
  p.paid_users,
  (p.paid_users * 999) AS total_revenue_estimate,
  ROUND((p.paid_users * 999)::decimal / NULLIF(u.total_users,0), 2) AS estimated_ltv_inr
FROM users u, paid p;
