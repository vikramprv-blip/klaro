-- Users to send WhatsApp follow-ups (high intent users)

SELECT
  u.phone,
  u.email,
  b.access_type,
  b.payment_status,
  COUNT(f.*) FILTER (WHERE f.status = 'BLOCKED') AS blocked_attempts,
  MAX(f.created_at) AS last_activity
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
LEFT JOIN public.feature_usage_log f ON f.user_id = b.user_id
WHERE
  b.access_type IN ('FREE_TEST','PROMO','TRIAL')
GROUP BY u.phone, u.email, b.access_type, b.payment_status
HAVING COUNT(f.*) FILTER (WHERE f.status = 'BLOCKED') > 0
ORDER BY blocked_attempts DESC, last_activity DESC;
