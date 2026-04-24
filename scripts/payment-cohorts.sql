-- cohort analysis: users by signup month → how many became paid

WITH user_cohort AS (
  SELECT
    u.id,
    date_trunc('month', u.created_at) AS signup_month
  FROM auth.users u
),
paid_users AS (
  SELECT
    user_id,
    MIN(created_at) AS first_paid_at
  FROM public.user_billing
  WHERE payment_status = 'PAID'
  GROUP BY user_id
)

SELECT
  uc.signup_month,
  COUNT(*) AS total_users,
  COUNT(pu.user_id) AS paid_users,
  ROUND((COUNT(pu.user_id)::decimal / NULLIF(COUNT(*),0)) * 100, 2) AS conversion_pct
FROM user_cohort uc
LEFT JOIN paid_users pu ON pu.user_id = uc.id
GROUP BY uc.signup_month
ORDER BY uc.signup_month DESC;
