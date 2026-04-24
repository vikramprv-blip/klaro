-- Update retention settings
-- Default: 7-day trial, 7-day grace period after expiry

UPDATE public.retention_config
SET
  trial_days = 7,
  grace_days = 7
WHERE id = 1;

SELECT * FROM public.retention_config;
