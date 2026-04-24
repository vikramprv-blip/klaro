-- DRY RUN: see what WILL be deleted (no deletion happens)

WITH expired_users AS (
  SELECT user_id
  FROM public.user_billing
  WHERE data_delete_at IS NOT NULL
    AND data_delete_at < now()
    AND payment_status = 'FREE'
)

SELECT
  u.email,
  b.payment_status,
  b.data_delete_at,
  COUNT(w.*) AS work_items_to_delete
FROM expired_users eu
JOIN public.user_billing b ON b.user_id = eu.user_id
JOIN auth.users u ON u.id = eu.user_id
LEFT JOIN public."WorkItem" w ON w."userId" = eu.user_id
GROUP BY u.email, b.payment_status, b.data_delete_at
ORDER BY b.data_delete_at ASC;
