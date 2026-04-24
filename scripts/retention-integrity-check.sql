-- Deep integrity check before running destructive jobs

-- 1) users marked FREE but still within access window
SELECT
  u.email,
  b.payment_status,
  b.access_expires_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status = 'FREE'
  AND b.access_expires_at IS NOT NULL
  AND b.access_expires_at > now();

-- 2) users missing billing rows (should be zero ideally)
SELECT
  u.email
FROM auth.users u
LEFT JOIN public.user_billing b ON b.user_id = u.id
WHERE b.user_id IS NULL;

-- 3) users with overlapping states
SELECT
  u.email,
  b.payment_status,
  b.paid_until,
  b.trial_ends_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE
  (b.payment_status = 'PAID' AND b.trial_ends_at IS NOT NULL)
  OR
  (b.payment_status = 'TRIAL' AND b.paid_until IS NOT NULL);

