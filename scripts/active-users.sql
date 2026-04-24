-- users with active access (PAID or valid TRIAL)

SELECT
  u.email,
  b.payment_status,
  b.trial_ends_at,
  b.paid_until
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE
  (b.payment_status = 'PAID' AND (b.paid_until IS NULL OR b.paid_until > now()))
  OR
  (b.payment_status = 'TRIAL' AND b.trial_ends_at IS NOT NULL AND b.trial_ends_at > now())
ORDER BY u.created_at DESC;
