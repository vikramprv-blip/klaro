-- FULL DELETE (app data only, NOT auth.users)
-- ⚠️ Add/remove tables based on your schema

WITH expired_users AS (
  SELECT user_id
  FROM public.user_billing
  WHERE data_delete_at IS NOT NULL
    AND data_delete_at < now()
    AND payment_status = 'FREE'
)

-- delete dependent data first
DELETE FROM public."WorkItem"
WHERE "userId" IN (SELECT user_id FROM expired_users);

-- add more tables below as needed:
-- DELETE FROM public."Client" WHERE "userId" IN (SELECT user_id FROM expired_users);
-- DELETE FROM public."Document" WHERE "userId" IN (SELECT user_id FROM expired_users);

-- finally, delete billing row (optional, or keep for analytics)
-- DELETE FROM public.user_billing WHERE user_id IN (SELECT user_id FROM expired_users);

