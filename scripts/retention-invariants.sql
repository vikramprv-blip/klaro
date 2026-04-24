-- Enforce retention invariants at DB level

-- 1) data_delete_at must be >= access_expires_at when both present
ALTER TABLE public.user_billing
  DROP CONSTRAINT IF EXISTS chk_retention_order;

ALTER TABLE public.user_billing
  ADD CONSTRAINT chk_retention_order
  CHECK (
    access_expires_at IS NULL
    OR data_delete_at IS NULL
    OR data_delete_at >= access_expires_at
  );

-- 2) ensure timestamps are sane (no absurd past values)
ALTER TABLE public.user_billing
  DROP CONSTRAINT IF EXISTS chk_retention_sane;

ALTER TABLE public.user_billing
  ADD CONSTRAINT chk_retention_sane
  CHECK (
    (access_expires_at IS NULL OR access_expires_at > '2000-01-01'::timestamptz)
    AND
    (data_delete_at IS NULL OR data_delete_at > '2000-01-01'::timestamptz)
  );

-- Verify
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.user_billing'::regclass
  AND conname IN ('chk_retention_order','chk_retention_sane');
