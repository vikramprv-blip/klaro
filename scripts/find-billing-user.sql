-- Replace email before running
SELECT
  u.id,
  u.email,
  b.payment_status,
  b.trial_ends_at,
  b.paid_until,
  b.created_at
FROM auth.users u
LEFT JOIN public.user_billing b ON b.user_id = u.id
WHERE u.email = 'customer@example.com';
