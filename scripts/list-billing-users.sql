SELECT
  u.email,
  b.payment_status,
  b.trial_ends_at,
  b.paid_until,
  b.created_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
ORDER BY b.created_at DESC;
