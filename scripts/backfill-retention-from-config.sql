-- Backfill existing rows using retention_config

WITH cfg AS (
  SELECT trial_days, grace_days FROM public.retention_config LIMIT 1
)

UPDATE public.user_billing b
SET
  access_expires_at = COALESCE(b.paid_until, b.trial_ends_at),
  data_delete_at =
    COALESCE(b.paid_until, b.trial_ends_at) + (cfg.grace_days || ' days')::interval
FROM cfg
WHERE b.access_expires_at IS NULL
   OR b.data_delete_at IS NULL;

-- verify
SELECT
  COUNT(*) FILTER (WHERE access_expires_at IS NULL) AS missing_access_expires,
  COUNT(*) FILTER (WHERE data_delete_at IS NULL) AS missing_data_delete
FROM public.user_billing;
