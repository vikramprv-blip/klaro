-- Summary of users by access_type + payment_status

SELECT
  b.access_type,
  b.payment_status,
  COUNT(*) AS users,
  COUNT(*) FILTER (
    WHERE b.payment_status = 'PAID'
      AND (b.paid_until IS NULL OR b.paid_until > now())
  ) AS active_paid,
  COUNT(*) FILTER (
    WHERE b.payment_status = 'TRIAL'
      AND b.trial_ends_at IS NOT NULL
      AND b.trial_ends_at > now()
  ) AS active_trial
FROM public.user_billing b
GROUP BY b.access_type, b.payment_status
ORDER BY b.access_type, b.payment_status;
