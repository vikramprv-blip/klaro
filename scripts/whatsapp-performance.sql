-- WhatsApp campaign performance

SELECT
  COUNT(*) FILTER (WHERE status = 'SENT') AS sent,
  COUNT(*) FILTER (WHERE status = 'FAILED') AS failed,
  COUNT(*) AS total,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'SENT')::decimal / NULLIF(COUNT(*),0) * 100,
    2
  ) AS success_rate_pct
FROM public.whatsapp_log;

-- Messages per day
SELECT
  date_trunc('day', created_at) AS day,
  COUNT(*) AS messages_sent
FROM public.whatsapp_log
GROUP BY 1
ORDER BY 1 DESC;
