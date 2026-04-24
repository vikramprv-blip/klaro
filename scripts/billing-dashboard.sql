SELECT
  COUNT(*) FILTER (WHERE payment_status = 'FREE')      AS free_users,
  COUNT(*) FILTER (WHERE payment_status = 'TRIAL')     AS trial_users,
  COUNT(*) FILTER (WHERE payment_status = 'PAID')      AS paid_users,
  COUNT(*) FILTER (WHERE payment_status = 'PAST_DUE')  AS past_due_users,
  COUNT(*) FILTER (WHERE payment_status = 'CANCELED')  AS canceled_users
FROM public.user_billing;
