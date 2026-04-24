-- Users inside 7-day grace window where data should NOT be deleted yet

SELECT
  u.email,
  b.payment_status,
  b.access_expires_at,
  b.data_delete_at,
  EXTRACT(day FROM (b.data_delete_at - now())) AS days_left_before_deletion
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status = 'FREE'
  AND b.data_delete_at IS NOT NULL
  AND b.data_delete_at > now()
ORDER BY b.data_delete_at ASC;
