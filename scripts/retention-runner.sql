-- FULL SAFE RETENTION RUNNER (run in this order)

-- 1. safety check (should be 0)
WITH invalid_targets AS (
  SELECT user_id
  FROM public.user_billing
  WHERE
    payment_status IN ('PAID','TRIAL')
    OR (paid_until IS NOT NULL AND paid_until > now())
    OR (trial_ends_at IS NOT NULL AND trial_ends_at > now())
)
SELECT COUNT(*) AS risky_users FROM invalid_targets;

-- 2. audit log
INSERT INTO public.data_deletion_log (user_id, reason)
SELECT user_id, 'AUTO_RETENTION_7_DAYS'
FROM public.user_billing
WHERE data_delete_at IS NOT NULL
  AND data_delete_at < now()
  AND payment_status = 'FREE';

-- 3. delete app data
WITH expired_users AS (
  SELECT user_id
  FROM public.user_billing
  WHERE data_delete_at IS NOT NULL
    AND data_delete_at < now()
    AND payment_status = 'FREE'
)
DELETE FROM public."WorkItem"
WHERE "userId" IN (SELECT user_id FROM expired_users);

-- 4. optional: delete billing rows
-- DELETE FROM public.user_billing WHERE user_id IN (SELECT user_id FROM expired_users);
