-- extend users whose paid plan expires in next 3 days
UPDATE public.user_billing
SET paid_until = paid_until + interval '1 month'
WHERE payment_status = 'PAID'
  AND paid_until IS NOT NULL
  AND paid_until < now() + interval '3 days';
