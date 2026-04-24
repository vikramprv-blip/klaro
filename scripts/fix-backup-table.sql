-- Ensure backup table has created_at for cleanup to work

ALTER TABLE public.deleted_users_backup
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Backfill existing rows
UPDATE public.deleted_users_backup
SET created_at = now()
WHERE created_at IS NULL;
