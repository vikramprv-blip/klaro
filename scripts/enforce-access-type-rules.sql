-- Enforce rules based on access_type

-- 1) INTERNAL users: always active, no expiry
UPDATE public.user_billing
SET
  payment_status = 'PAID',
  paid_until = NULL,
  trial_ends_at = NULL,
  access_expires_at = NULL,
  data_delete_at = NULL
WHERE access_type = 'INTERNAL';

-- 2) FREE_TEST / PROMO: ensure they have expiry
UPDATE public.user_billing
SET
  payment_status = 'PAID'
WHERE access_type IN ('FREE_TEST','PROMO')
  AND payment_status != 'PAID';

-- 3) REAL PAID users: ensure access_type is correct
UPDATE public.user_billing b
SET access_type = 'PAID'
WHERE b.payment_status = 'PAID'
  AND EXISTS (
    SELECT 1 FROM public.payments_log p WHERE p.user_id = b.user_id
  );

-- sanity view
SELECT access_type, payment_status, COUNT(*) 
FROM public.user_billing 
GROUP BY access_type, payment_status;
