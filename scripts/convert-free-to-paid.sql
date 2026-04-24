-- Convert free/test users to real paid users after they pay
-- Replace email before running

UPDATE public.user_billing b
SET
  access_type = 'PAID',
  payment_status = 'PAID',
  paid_until = now() + interval '30 days'
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com'
  AND b.access_type IN ('FREE_TEST','PROMO','INTERNAL');

-- Optional: log payment
INSERT INTO public.payments_log (user_id, amount, method, reference)
SELECT
  u.id,
  999,
  'UPI',
  'MANUAL_CONVERSION'
FROM auth.users u
WHERE u.email = 'customer@example.com';
