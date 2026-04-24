-- Restore user billing data from backup (if needed)
-- Replace email before running

INSERT INTO public.user_billing (
  user_id,
  payment_status,
  paid_until,
  trial_ends_at,
  access_expires_at,
  data_delete_at
)
SELECT
  u.id,
  b.payment_status,
  b.paid_until,
  b.trial_ends_at,
  b.access_expires_at,
  b.data_delete_at
FROM public.deleted_users_backup b
JOIN auth.users u ON u.id = b.user_id
WHERE u.email = 'customer@example.com'
ON CONFLICT (user_id) DO UPDATE
SET
  payment_status = EXCLUDED.payment_status,
  paid_until = EXCLUDED.paid_until,
  trial_ends_at = EXCLUDED.trial_ends_at,
  access_expires_at = EXCLUDED.access_expires_at,
  data_delete_at = EXCLUDED.data_delete_at;
