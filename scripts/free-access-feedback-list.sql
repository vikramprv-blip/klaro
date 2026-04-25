-- Free/test/promo/internal users to contact for product feedback

SELECT
  u.email,
  b.access_type,
  b.payment_status,
  b.paid_until,
  b.trial_ends_at,
  b.created_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.access_type IN ('FREE_TEST','PROMO','INTERNAL')
ORDER BY b.created_at DESC;
