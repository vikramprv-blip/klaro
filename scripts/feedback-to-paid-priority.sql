-- Prioritize free/test users most likely to convert (based on usage signals)

SELECT
  u.email,
  b.access_type,
  COUNT(f.*) FILTER (WHERE f.status = 'BLOCKED') AS blocked_attempts,
  COUNT(f.*) AS total_usage_events,
  MAX(f.created_at) AS last_activity
FROM public.user_billing b
JOIN auth.users u ON u.id = b.user_id
LEFT JOIN public.feature_usage_log f ON f.user_id = b.user_id
WHERE b.access_type IN ('FREE_TEST','PROMO')
GROUP BY u.email, b.access_type
ORDER BY blocked_attempts DESC, total_usage_events DESC, last_activity DESC;
