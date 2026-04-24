-- Replace email and duration before running
-- Use this for friends, family, testers, advisors, feedback users, etc.

UPDATE public.user_billing b
SET
  payment_status = 'PAID',
  paid_until = now() + interval '90 days'
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'tester@example.com';
