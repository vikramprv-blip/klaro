-- Replace email before running
UPDATE public.user_billing b
SET
  payment_status = 'FREE',
  paid_until = NULL,
  trial_ends_at = NULL
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com';
