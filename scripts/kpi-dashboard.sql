-- Core SaaS KPI dashboard (simple version)

-- change 999 to your monthly price (INR)

WITH users AS (
  SELECT COUNT(*) AS total_users FROM auth.users
),
active AS (
  SELECT COUNT(*) AS active_users
  FROM public.user_billing
  WHERE
    (payment_status = 'PAID' AND (paid_until IS NULL OR paid_until > now()))
    OR
    (payment_status = 'TRIAL' AND trial_ends_at IS NOT NULL AND trial_ends_at > now())
),
paid AS (
  SELECT COUNT(*) AS paid_users
  FROM public.user_billing
  WHERE payment_status = 'PAID'
),
revenue AS (
  SELECT COUNT(*) * 999 AS mrr
  FROM public.user_billing
  WHERE payment_status = 'PAID'
)

SELECT
  u.total_users,
  a.active_users,
  p.paid_users,
  r.mrr AS estimated_mrr_inr,
  ROUND((p.paid_users::decimal / NULLIF(u.total_users,0)) * 100, 2) AS conversion_pct,
  ROUND((a.active_users::decimal / NULLIF(u.total_users,0)) * 100, 2) AS activation_pct
FROM users u, active a, paid p, revenue r;
