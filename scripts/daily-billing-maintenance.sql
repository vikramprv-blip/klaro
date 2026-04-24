-- 1) expire trials
UPDATE public.user_billing
SET payment_status = 'FREE'
WHERE payment_status = 'TRIAL'
  AND trial_ends_at IS NOT NULL
  AND trial_ends_at < now();

-- 2) downgrade expired paid users
UPDATE public.user_billing
SET payment_status = 'FREE'
WHERE payment_status = 'PAID'
  AND paid_until IS NOT NULL
  AND paid_until < now();
