-- simple funnel: total users → trial → paid

WITH totals AS (
  SELECT COUNT(*) AS total_users FROM auth.users
),
trial AS (
  SELECT COUNT(*) AS trial_users
  FROM public.user_billing
  WHERE payment_status = 'TRIAL'
),
paid AS (
  SELECT COUNT(*) AS paid_users
  FROM public.user_billing
  WHERE payment_status = 'PAID'
)

SELECT
  t.total_users,
  tr.trial_users,
  p.paid_users,
  ROUND((tr.trial_users::decimal / NULLIF(t.total_users,0)) * 100, 2) AS trial_rate_pct,
  ROUND((p.paid_users::decimal / NULLIF(tr.trial_users,0)) * 100, 2) AS trial_to_paid_pct
FROM totals t, trial tr, paid p;
