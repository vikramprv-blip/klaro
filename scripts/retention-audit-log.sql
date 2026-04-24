-- create audit log table
CREATE TABLE IF NOT EXISTS public.data_deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT
);

-- log users about to be deleted
INSERT INTO public.data_deletion_log (user_id, reason)
SELECT user_id, 'AUTO_RETENTION_7_DAYS'
FROM public.user_billing
WHERE data_delete_at IS NOT NULL
  AND data_delete_at < now()
  AND payment_status = 'FREE';
