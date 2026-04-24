-- Retention policy summary for audit / internal review

SELECT
  'Trial days' AS policy,
  trial_days::text AS value
FROM public.retention_config
WHERE id = 1

UNION ALL

SELECT
  'Grace days after expiry',
  grace_days::text
FROM public.retention_config
WHERE id = 1

UNION ALL

SELECT
  'Deletion rule',
  'Delete app data only after data_delete_at has passed and payment_status = FREE';
