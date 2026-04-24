-- Audit users whose access_type may not match billing/payment reality

SELECT
  u.email,
  b.access_type,
  b.payment_status,
  b.paid_until,
  b.trial_ends_at,
  COUNT(p.*) AS payment_count
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
LEFT JOIN public.payments_log p ON p.user_id = b.user_id
GROUP BY
  u.email,
  b.access_type,
  b.payment_status,
  b.paid_until,
  b.trial_ends_at
HAVING
  (b.access_type = 'PAID' AND COUNT(p.*) = 0 AND b.payment_status = 'PAID')
  OR
  (b.access_type IN ('FREE_TEST','PROMO') AND COUNT(p.*) > 0)
  OR
  (b.access_type = 'TRIAL' AND b.payment_status <> 'TRIAL')
ORDER BY u.email;
