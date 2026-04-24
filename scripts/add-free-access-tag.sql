-- Add a column to explicitly tag free/tester access users

ALTER TABLE public.user_billing
  ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'PAID'; 
-- values: PAID / FREE_TEST / INTERNAL / PROMO

-- Backfill existing free-access users (no payments but PAID status)
UPDATE public.user_billing b
SET access_type = 'FREE_TEST'
WHERE b.payment_status = 'PAID'
  AND b.paid_until IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.payments_log p WHERE p.user_id = b.user_id
  );

-- View distribution
SELECT access_type, COUNT(*) FROM public.user_billing GROUP BY access_type;
