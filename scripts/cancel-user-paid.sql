-- Replace email before running
UPDATE public.user_billing b
SET
  payment_status = 'CANCELED',
  paid_until = now()
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com';
