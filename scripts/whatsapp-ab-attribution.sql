-- Attribute conversions to WhatsApp A/B variants (last-touch within 48h)

-- 1) ensure log has variant + campaign_id
ALTER TABLE public.whatsapp_log
  ADD COLUMN IF NOT EXISTS variant TEXT,
  ADD COLUMN IF NOT EXISTS campaign_id UUID;

-- 2) last touch per user (within 48h before conversion)
WITH last_touch AS (
  SELECT DISTINCT ON (w.user_id)
    w.user_id,
    w.variant,
    w.campaign_id,
    w.created_at AS sent_at
  FROM public.whatsapp_log w
  WHERE w.status = 'SENT'
  ORDER BY w.user_id, w.created_at DESC
),
conversions AS (
  SELECT
    ub.user_id,
    ub.created_at AS converted_at
  FROM public.user_billing ub
  WHERE ub.payment_status = 'PAID'
)

SELECT
  lt.variant,
  COUNT(*) AS conversions,
  COUNT(*) FILTER (
    WHERE c.converted_at <= lt.sent_at + interval '48 hours'
      AND c.converted_at >= lt.sent_at
  ) AS attributed_conversions,
  ROUND(
    COUNT(*) FILTER (
      WHERE c.converted_at <= lt.sent_at + interval '48 hours'
        AND c.converted_at >= lt.sent_at
    )::decimal / NULLIF(COUNT(*),0) * 100,
    2
  ) AS attribution_rate_pct
FROM last_touch lt
JOIN conversions c ON c.user_id = lt.user_id
GROUP BY lt.variant
ORDER BY attributed_conversions DESC;
