-- Backup user data before deletion (simple safety net)

CREATE TABLE IF NOT EXISTS public.deleted_users_backup AS
SELECT * FROM public.user_billing WHERE 1=0;

INSERT INTO public.deleted_users_backup
SELECT *
FROM public.user_billing
WHERE data_delete_at IS NOT NULL
  AND data_delete_at < now()
  AND payment_status = 'FREE';
