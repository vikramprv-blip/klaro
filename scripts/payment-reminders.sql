-- users to send payment reminders (trial expiring in 48h OR paid expiring in 3 days)

SELECT
  u.email,
  b.payment_status,
  b.trial_ends_at,
  b.paid_until
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE
  (
    b.payment_status = 'TRIAL'
    AND b.trial_ends_at IS NOT NULL
    AND b.trial_ends_at < now() + interval '48 hours'
    AND b.trial_ends_at > now()
  )
  OR
  (
    b.payment_status = 'PAID'
    AND b.paid_until IS NOT NULL
    AND b.paid_until < now() + interval '3 days'
    AND b.paid_until > now()
  )
ORDER BY COALESCE(b.trial_ends_at, b.paid_until) ASC;
