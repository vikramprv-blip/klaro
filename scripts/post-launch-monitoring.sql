-- POST-LAUNCH MONITORING (run daily)

-- 1) new signups (last 24h)
SELECT COUNT(*) AS new_signups_24h
FROM auth.users
WHERE created_at > now() - interval '24 hours';

-- 2) trial → paid conversions (last 24h)
SELECT COUNT(*) AS conversions_24h
FROM public.user_billing
WHERE payment_status = 'PAID'
  AND created_at > now() - interval '24 hours';

-- 3) trial drop-offs (expired trials)
SELECT COUNT(*) AS expired_trials_24h
FROM public.user_billing
WHERE payment_status = 'FREE'
  AND trial_ends_at IS NOT NULL
  AND trial_ends_at > now() - interval '24 hours'
  AND trial_ends_at < now();

-- 4) retention deletions (last 24h)
SELECT COUNT(*) AS deletions_24h
FROM public.data_deletion_log
WHERE deleted_at > now() - interval '24 hours';

-- 5) active users
SELECT COUNT(*) AS active_users
FROM public.user_billing
WHERE
  (payment_status = 'PAID' AND (paid_until IS NULL OR paid_until > now()))
  OR
  (payment_status = 'TRIAL' AND trial_ends_at IS NOT NULL AND trial_ends_at > now());
