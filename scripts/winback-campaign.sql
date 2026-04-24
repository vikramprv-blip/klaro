-- users to win back (recently canceled or downgraded from paid)

SELECT
  u.email,
  b.payment_status,
  b.paid_until,
  b.trial_ends_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE
  (b.payment_status = 'CANCELED')
  OR
  (
    b.payment_status = 'FREE'
    AND b.paid_until IS NOT NULL
    AND b.paid_until > now() - interval '30 days'
  )
ORDER BY COALESCE(b.paid_until, b.trial_ends_at) DESC;
