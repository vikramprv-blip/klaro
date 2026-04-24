-- expire trials
UPDATE public.user_billing
SET
  payment_status = 'FREE',
  access_expires_at = trial_ends_at,
  data_delete_at = trial_ends_at + interval '7 days'
WHERE payment_status = 'TRIAL'
  AND trial_ends_at IS NOT NULL
  AND trial_ends_at < now();

-- expire paid users
UPDATE public.user_billing
SET
  payment_status = 'FREE',
  access_expires_at = paid_until,
  data_delete_at = paid_until + interval '7 days'
WHERE payment_status = 'PAID'
  AND paid_until IS NOT NULL
  AND paid_until < now();

-- HARD DELETE placeholder (customize tables before using)
-- Example:
-- DELETE FROM public."WorkItem"
-- WHERE "userId" IN (
--   SELECT user_id FROM public.user_billing
--   WHERE data_delete_at < now()
-- );
