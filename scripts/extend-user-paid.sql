-- Replace email and number of months before running
UPDATE public.user_billing b
SET
  payment_status = 'PAID',
  paid_until = greatest(coalesce(b.paid_until, now()), now()) + interval '1 month'
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com';
