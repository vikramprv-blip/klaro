-- Identify users hitting feature gates (FREE users trying to use paid features)
-- Assumes you log feature usage attempts in future (placeholder structure)

SELECT
  u.email,
  b.payment_status,
  COUNT(*) AS blocked_attempts
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
LEFT JOIN public.feature_usage_log f ON f.user_id = u.id
WHERE b.payment_status = 'FREE'
GROUP BY u.email, b.payment_status
ORDER BY blocked_attempts DESC;
