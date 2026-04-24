-- Top clients by payment status and recency
SELECT
  u.email,
  b.payment_status,
  b.paid_until,
  b.trial_ends_at,
  b.created_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status IN ('PAID','TRIAL')
ORDER BY
  (CASE WHEN b.payment_status = 'PAID' THEN 1 ELSE 2 END),
  COALESCE(b.paid_until, b.trial_ends_at) DESC;
