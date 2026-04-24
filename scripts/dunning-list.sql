-- users to nudge for payment (trial ending soon or recently expired)

SELECT
  u.email,
  b.payment_status,
  b.trial_ends_at,
  b.paid_until
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE
  (b.payment_status = 'TRIAL' AND b.trial_ends_at IS NOT NULL AND b.trial_ends_at < now() + interval '24 hours')
  OR
  (b.payment_status = 'FREE' AND b.trial_ends_at IS NOT NULL AND b.trial_ends_at > now() - interval '2 days')
ORDER BY COALESCE(b.trial_ends_at, b.paid_until) ASC;
