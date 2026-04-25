-- WhatsApp campaign ROI estimate
-- change 999 to your monthly plan price
-- change 0.25 to estimated WhatsApp cost per message

WITH campaign_sends AS (
  SELECT
    campaign_id,
    COUNT(*) FILTER (WHERE status = 'SENT') AS sent
  FROM public.whatsapp_log
  GROUP BY campaign_id
),
campaign_conversions AS (
  SELECT
    w.campaign_id,
    COUNT(DISTINCT b.user_id) AS converted_users
  FROM public.whatsapp_log w
  JOIN public.user_billing b ON b.user_id = w.user_id
  WHERE w.status = 'SENT'
    AND b.payment_status = 'PAID'
    AND b.created_at >= w.created_at
    AND b.created_at <= w.created_at + interval '48 hours'
  GROUP BY w.campaign_id
)

SELECT
  c.name,
  COALESCE(s.sent,0) AS messages_sent,
  COALESCE(s.sent,0) * 0.25 AS estimated_message_cost_inr,
  COALESCE(cv.converted_users,0) AS converted_users,
  COALESCE(cv.converted_users,0) * 999 AS estimated_revenue_inr,
  (COALESCE(cv.converted_users,0) * 999) - (COALESCE(s.sent,0) * 0.25) AS estimated_roi_inr
FROM public.whatsapp_campaigns c
LEFT JOIN campaign_sends s ON s.campaign_id = c.id
LEFT JOIN campaign_conversions cv ON cv.campaign_id = c.id
ORDER BY estimated_roi_inr DESC;
