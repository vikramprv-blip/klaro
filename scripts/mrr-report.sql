-- MRR estimate for active paid users
-- change 999 to your monthly Klaro price in INR

SELECT
  COUNT(*) AS active_paid_users,
  COUNT(*) * 999 AS estimated_mrr_inr
FROM public.user_billing
WHERE payment_status = 'PAID'
  AND (paid_until IS NULL OR paid_until > now());
