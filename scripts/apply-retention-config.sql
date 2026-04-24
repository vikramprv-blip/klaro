-- Apply retention_config dynamically (no hardcoded 7 days)

WITH cfg AS (
  SELECT trial_days, grace_days FROM public.retention_config LIMIT 1
)

-- expire trials using config
UPDATE public.user_billing b
SET
  payment_status = 'FREE',
  access_expires_at = b.trial_ends_at,
  data_delete_at = b.trial_ends_at + (cfg.grace_days || ' days')::interval
FROM cfg
WHERE b.payment_status = 'TRIAL'
  AND b.trial_ends_at IS NOT NULL
  AND b.trial_ends_at < now();

-- expire paid using config
UPDATE public.user_billing b
SET
  payment_status = 'FREE',
  access_expires_at = b.paid_until,
  data_delete_at = b.paid_until + (cfg.grace_days || ' days')::interval
FROM cfg
WHERE b.payment_status = 'PAID'
  AND b.paid_until IS NOT NULL
  AND b.paid_until < now();
