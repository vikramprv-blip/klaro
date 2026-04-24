-- Users currently given free/manual access

SELECT
  u.email,
  b.payment_status,
  b.paid_until,
  b.created_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status = 'PAID'
  AND b.paid_until IS NOT NULL
ORDER BY b.paid_until DESC;
