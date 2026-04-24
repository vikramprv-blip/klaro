-- Preview users whose Klaro app data is eligible for deletion.
-- Run this before delete-expired-user-data-safe.sql.

SELECT
  u.email,
  b.payment_status,
  b.access_expires_at,
  b.data_delete_at,
  COUNT(w.*) AS work_items_to_delete
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
LEFT JOIN public."WorkItem" w ON w."userId" = b.user_id
WHERE b.data_delete_at IS NOT NULL
  AND b.data_delete_at < now()
  AND b.payment_status = 'FREE'
GROUP BY
  u.email,
  b.payment_status,
  b.access_expires_at,
  b.data_delete_at
ORDER BY b.data_delete_at ASC;
