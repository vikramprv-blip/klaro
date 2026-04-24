-- Restore access within 7-day grace window (user pays late)
-- Replace email before running

UPDATE public.user_billing b
SET
  payment_status = 'PAID',
  paid_until = now() + interval '30 days',
  access_expires_at = NULL,
  data_delete_at = NULL
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com'
  AND b.payment_status = 'FREE'
  AND b.data_delete_at IS NOT NULL
  AND b.data_delete_at > now();
