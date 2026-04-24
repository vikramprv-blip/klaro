-- users whose trial expires in next 24 hours (for WhatsApp / email alerts)

SELECT
  u.email,
  b.trial_ends_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
WHERE b.payment_status = 'TRIAL'
  AND b.trial_ends_at IS NOT NULL
  AND b.trial_ends_at < now() + interval '24 hours'
ORDER BY b.trial_ends_at ASC;
