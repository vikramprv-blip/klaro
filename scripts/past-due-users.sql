-- users whose paid plan has expired but not yet handled

SELECT
  u.email,
  b.paid_until,
  b.payment_status
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status = 'PAID'
  AND b.paid_until IS NOT NULL
  AND b.paid_until < now()
ORDER BY b.paid_until ASC;
