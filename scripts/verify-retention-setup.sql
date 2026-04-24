-- Verify all required retention pieces exist

-- 1) Tables
SELECT 'user_billing exists' AS check, to_regclass('public.user_billing');
SELECT 'data_deletion_log exists' AS check, to_regclass('public.data_deletion_log');
SELECT 'retention_config exists' AS check, to_regclass('public.retention_config');

-- 2) Columns
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name='user_billing'
  AND column_name IN ('access_expires_at','data_delete_at');

-- 3) Config values
SELECT * FROM public.retention_config;

-- 4) Constraints
SELECT conname
FROM pg_constraint
WHERE conrelid = 'public.user_billing'::regclass;

-- 5) Sample counts
SELECT
  COUNT(*) FILTER (WHERE payment_status='PAID') AS paid,
  COUNT(*) FILTER (WHERE payment_status='TRIAL') AS trial,
  COUNT(*) FILTER (WHERE payment_status='FREE') AS free
FROM public.user_billing;
