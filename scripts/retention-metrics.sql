-- Retention system health metrics

SELECT
  COUNT(*) FILTER (WHERE data_delete_at IS NOT NULL AND data_delete_at < now()) AS ready_for_deletion,
  COUNT(*) FILTER (WHERE data_delete_at IS NOT NULL AND data_delete_at > now()) AS in_grace_window,
  COUNT(*) FILTER (WHERE payment_status = 'TRIAL') AS active_trials,
  COUNT(*) FILTER (WHERE payment_status = 'PAID') AS active_paid,
  COUNT(*) FILTER (WHERE payment_status = 'FREE') AS free_users
FROM public.user_billing;
