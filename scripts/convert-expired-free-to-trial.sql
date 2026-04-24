-- When free/test access expires, optionally move them into TRIAL for conversion push
-- Replace email if running manually, or run as batch

UPDATE public.user_billing
SET
  access_type = 'TRIAL',
  payment_status = 'TRIAL',
  trial_ends_at = now() + interval '7 days',
  paid_until = NULL
WHERE access_type IN ('FREE_TEST','PROMO','INTERNAL')
  AND paid_until IS NOT NULL
  AND paid_until < now();
