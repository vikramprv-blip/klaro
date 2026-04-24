-- users whose paid plan expires in next 48 hours (for renewal nudges)

SELECT
  u.email,
  b.paid_until
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status = 'PAID'
  AND b.paid_until IS NOT NULL
  AND b.paid_until > now()
  AND b.paid_until < now() + interval '48 hours'
ORDER BY b.paid_until ASC;
