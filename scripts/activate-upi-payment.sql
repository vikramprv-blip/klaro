-- Replace email + txn_ref before running
UPDATE public.user_billing b
SET
  payment_status = 'PAID',
  paid_until = now() + interval '30 days'
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com';

-- Optional: log payment
INSERT INTO public.payments_log (user_id, amount, method, reference, created_at)
SELECT
  u.id,
  999,
  'UPI',
  'TXN_REF_123',
  now()
FROM auth.users u
WHERE u.email = 'customer@example.com';
