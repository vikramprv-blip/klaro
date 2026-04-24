-- Alerts: users nearing deletion (next 24h)

SELECT
  u.email,
  b.data_delete_at,
  EXTRACT(hour FROM (b.data_delete_at - now())) AS hours_left
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status = 'FREE'
  AND b.data_delete_at IS NOT NULL
  AND b.data_delete_at < now() + interval '24 hours'
  AND b.data_delete_at > now()
ORDER BY b.data_delete_at ASC;
