UPDATE public.user_billing
SET payment_status = 'FREE'
WHERE payment_status = 'TRIAL'
  AND trial_ends_at IS NOT NULL
  AND trial_ends_at < now();
