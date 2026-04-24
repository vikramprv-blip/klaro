-- users whose last payment attempt failed or missing (simulate follow-up list)

SELECT
  u.email,
  b.payment_status,
  b.paid_until,
  MAX(p.created_at) AS last_payment_at
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
LEFT JOIN public.payments_log p ON p.user_id = u.id
WHERE b.payment_status IN ('FREE','PAST_DUE')
GROUP BY u.email, b.payment_status, b.paid_until
ORDER BY last_payment_at NULLS FIRST;
