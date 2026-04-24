-- Replace email before running
UPDATE public.user_billing b
SET
  payment_status = 'TRIAL',
  trial_ends_at = now() + interval '7 days'
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com';
