-- users who converted from TRIAL → PAID

SELECT
  u.email,
  b.created_at AS billing_created_at,
  b.paid_until
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status = 'PAID'
  AND b.trial_ends_at IS NOT NULL
ORDER BY b.created_at DESC;
