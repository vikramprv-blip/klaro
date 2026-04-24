-- recent payments (last 7 days)

SELECT
  u.email,
  p.amount,
  p.method,
  p.reference,
  p.created_at
FROM public.payments_log p
JOIN auth.users u ON u.id = p.user_id
WHERE p.created_at > now() - interval '7 days'
ORDER BY p.created_at DESC;
