-- Retention system health check (detect inconsistencies)

SELECT
  COUNT(*) FILTER (
    WHERE payment_status IN ('PAID','TRIAL')
      AND (access_expires_at IS NOT NULL OR data_delete_at IS NOT NULL)
  ) AS active_users_with_retention_flags,

  COUNT(*) FILTER (
    WHERE payment_status = 'FREE'
      AND data_delete_at IS NULL
  ) AS free_users_missing_deletion_date,

  COUNT(*) FILTER (
    WHERE access_expires_at IS NOT NULL
      AND data_delete_at IS NOT NULL
      AND data_delete_at < access_expires_at
  ) AS invalid_retention_order,

  COUNT(*) FILTER (
    WHERE payment_status = 'TRIAL'
      AND trial_ends_at IS NULL
  ) AS broken_trials

FROM public.user_billing;
