-- Users with free/tester access who are not paying customers
-- Assumption: free access is granted as PAID with paid_until, but no payments_log entry

SELECT
  u.email,
  b.payment_status,
  b.paid_until,
  b.created_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
LEFT JOIN public.payments_log p ON p.user_id = b.user_id
WHERE b.payment_status = 'PAID'
  AND b.paid_until IS NOT NULL
  AND p.user_id IS NULL
ORDER BY b.paid_until DESC;
