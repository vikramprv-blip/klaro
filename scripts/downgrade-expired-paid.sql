-- downgrade PAID users whose paid_until has expired

UPDATE public.user_billing
SET payment_status = 'FREE'
WHERE payment_status = 'PAID'
  AND paid_until IS NOT NULL
  AND paid_until < now();
