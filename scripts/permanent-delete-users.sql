-- PERMANENT DELETE: removes auth + app data after retention
-- ⚠️ irreversible. run only after retention window.

WITH to_delete AS (
  SELECT user_id
  FROM public.user_billing
  WHERE data_delete_at IS NOT NULL
    AND data_delete_at < now()
    AND payment_status = 'FREE'
)

-- delete app data first
DELETE FROM public."WorkItem"
WHERE "userId" IN (SELECT user_id FROM to_delete);

-- delete billing rows
DELETE FROM public.user_billing
WHERE user_id IN (SELECT user_id FROM to_delete);

-- delete auth users (Supabase)
DELETE FROM auth.users
WHERE id IN (SELECT user_id FROM to_delete);
