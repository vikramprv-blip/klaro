-- WhatsApp campaign health dashboard

SELECT
  c.name,
  c.template,
  c.status,
  COUNT(o.id) FILTER (WHERE o.status = 'PENDING') AS pending,
  COUNT(o.id) FILTER (WHERE o.status = 'IN_PROGRESS') AS in_progress,
  COUNT(o.id) FILTER (WHERE o.status = 'SENT') AS sent,
  COUNT(o.id) FILTER (WHERE o.status = 'FAILED') AS failed,
  MAX(o.last_attempt_at) AS last_attempt_at
FROM public.whatsapp_campaigns c
LEFT JOIN public.whatsapp_outbox o ON o.campaign_id = c.id
GROUP BY c.name, c.template, c.status
ORDER BY c.created_at DESC;
