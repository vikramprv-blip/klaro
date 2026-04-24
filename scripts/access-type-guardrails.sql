-- DB guardrails for access_type consistency

-- Ensure valid values
ALTER TABLE public.user_billing
  DROP CONSTRAINT IF EXISTS chk_access_type_valid;

ALTER TABLE public.user_billing
  ADD CONSTRAINT chk_access_type_valid
  CHECK (access_type IN ('PAID','FREE_TEST','INTERNAL','PROMO','TRIAL'));

-- INTERNAL must have no expiry
ALTER TABLE public.user_billing
  DROP CONSTRAINT IF EXISTS chk_internal_no_expiry;

ALTER TABLE public.user_billing
  ADD CONSTRAINT chk_internal_no_expiry
  CHECK (
    access_type <> 'INTERNAL'
    OR (paid_until IS NULL AND trial_ends_at IS NULL)
  );

-- PAID with real payment should not be FREE_TEST/PROMO
-- (soft check via view)
CREATE OR REPLACE VIEW public.invalid_access_type AS
SELECT b.*
FROM public.user_billing b
WHERE b.access_type IN ('FREE_TEST','PROMO')
  AND EXISTS (
    SELECT 1 FROM public.payments_log p WHERE p.user_id = b.user_id
  );

-- verify constraints + view
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.user_billing'::regclass
  AND conname IN ('chk_access_type_valid','chk_internal_no_expiry');

SELECT COUNT(*) AS invalid_access_rows FROM public.invalid_access_type;
