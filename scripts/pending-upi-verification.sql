-- users who are still FREE but recently signed up (likely awaiting payment verification)

SELECT
  u.email,
  u.created_at,
  b.payment_status,
  b.trial_ends_at
FROM auth.users u
LEFT JOIN public.user_billing b ON b.user_id = u.id
WHERE b.payment_status = 'FREE'
  AND u.created_at > now() - interval '2 days'
ORDER BY u.created_at DESC;
