-- SAFE VERSION:
-- only deletes Klaro app data for users whose data_delete_at passed.
-- does NOT delete auth.users.

WITH expired_users AS (
  SELECT user_id
  FROM public.user_billing
  WHERE data_delete_at IS NOT NULL
    AND data_delete_at < now()
    AND payment_status = 'FREE'
)

DELETE FROM public."WorkItem"
WHERE "userId" IN (SELECT user_id FROM expired_users);
