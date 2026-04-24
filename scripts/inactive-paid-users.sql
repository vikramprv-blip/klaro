-- paid users who haven't paid recently (potential churn risk)

SELECT
  u.email,
  b.payment_status,
  b.paid_until,
  MAX(p.created_at) AS last_payment_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
LEFT JOIN public.payments_log p ON p.user_id = u.id
WHERE b.payment_status = 'PAID'
GROUP BY u.email, b.payment_status, b.paid_until
HAVING MAX(p.created_at) IS NULL OR MAX(p.created_at) < now() - interval '30 days'
ORDER BY last_payment_at NULLS FIRST;
