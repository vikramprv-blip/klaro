-- When user upgrades, clear retention timers so data is safe

UPDATE public.user_billing
SET
  access_expires_at = NULL,
  data_delete_at = NULL
WHERE payment_status = 'PAID';
