-- Free/test/internal access expiring soon

SELECT
  u.email,
  b.access_type,
  b.payment_status,
  b.paid_until
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.access_type IN ('FREE_TEST','PROMO','INTERNAL')
  AND b.paid_until IS NOT NULL
  AND b.paid_until < now() + interval '7 days'
ORDER BY b.paid_until ASC;
