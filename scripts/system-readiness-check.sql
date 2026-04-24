-- SYSTEM READINESS CHECK BEFORE GOING LIVE

-- 1) billing rows vs users
SELECT
  (SELECT COUNT(*) FROM auth.users) AS total_users,
  (SELECT COUNT(*) FROM public.user_billing) AS billing_rows;

-- 2) users without billing (should be 0 if trigger works)
SELECT COUNT(*) AS users_missing_billing
FROM auth.users u
LEFT JOIN public.user_billing b ON b.user_id = u.id
WHERE b.user_id IS NULL;

-- 3) active access users
SELECT COUNT(*) AS active_access_users
FROM public.user_billing
WHERE
  (payment_status = 'PAID' AND (paid_until IS NULL OR paid_until > now()))
  OR
  (payment_status = 'TRIAL' AND trial_ends_at IS NOT NULL AND trial_ends_at > now());

-- 4) retention ready users
SELECT COUNT(*) AS ready_for_deletion
FROM public.user_billing
WHERE data_delete_at IS NOT NULL
  AND data_delete_at < now();

-- 5) safety: active users with deletion flags (should be 0)
SELECT COUNT(*) AS bad_state
FROM public.user_billing
WHERE payment_status IN ('PAID','TRIAL')
  AND data_delete_at IS NOT NULL;
