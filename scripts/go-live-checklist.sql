-- FINAL GO-LIVE CHECKLIST (run before opening to users)

-- 1) retention config
SELECT * FROM public.retention_config;

-- 2) billing coverage
SELECT COUNT(*) AS users_missing_billing
FROM auth.users u
LEFT JOIN public.user_billing b ON b.user_id = u.id
WHERE b.user_id IS NULL;

-- 3) safety: no active users flagged for deletion
SELECT COUNT(*) AS invalid_state
FROM public.user_billing
WHERE payment_status IN ('PAID','TRIAL')
  AND data_delete_at IS NOT NULL;

-- 4) trial creation working (recent users)
SELECT
  u.email,
  b.payment_status,
  b.trial_ends_at
FROM auth.users u
JOIN public.user_billing b ON b.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 5) system summary
SELECT
  COUNT(*) FILTER (WHERE payment_status='FREE') AS free,
  COUNT(*) FILTER (WHERE payment_status='TRIAL') AS trial,
  COUNT(*) FILTER (WHERE payment_status='PAID') AS paid
FROM public.user_billing;
