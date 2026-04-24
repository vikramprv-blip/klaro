-- UPI reconciliation: payments vs activated users (last 7 days)

WITH payments AS (
  SELECT
    user_id,
    COUNT(*) AS payments_count,
    SUM(amount) AS total_paid
  FROM public.payments_log
  WHERE method = 'UPI'
    AND created_at > now() - interval '7 days'
  GROUP BY user_id
),
activated AS (
  SELECT
    user_id,
    COUNT(*) AS activations
  FROM public.user_billing
  WHERE payment_status = 'PAID'
    AND created_at > now() - interval '7 days'
  GROUP BY user_id
)

SELECT
  u.email,
  COALESCE(p.payments_count,0) AS payments_count,
  COALESCE(p.total_paid,0) AS total_paid,
  COALESCE(a.activations,0) AS activations,
  CASE
    WHEN p.payments_count IS NULL THEN 'NO_PAYMENT'
    WHEN a.activations IS NULL THEN 'PAYMENT_NOT_ACTIVATED'
    ELSE 'OK'
  END AS status
FROM auth.users u
LEFT JOIN payments p ON p.user_id = u.id
LEFT JOIN activated a ON a.user_id = u.id
WHERE (p.payments_count IS NOT NULL OR a.activations IS NOT NULL)
ORDER BY status, u.email;
