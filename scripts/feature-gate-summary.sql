-- Summary of feature gate hits (blocked vs allowed)

SELECT
  feature,
  COUNT(*) FILTER (WHERE status = 'BLOCKED') AS blocked,
  COUNT(*) FILTER (WHERE status = 'ALLOWED') AS allowed,
  COUNT(*) AS total,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'BLOCKED')::decimal / NULLIF(COUNT(*),0)) * 100,
    2
  ) AS block_rate_pct
FROM public.feature_usage_log
GROUP BY feature
ORDER BY blocked DESC;
