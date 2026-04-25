-- A/B testing for WhatsApp templates

CREATE TABLE IF NOT EXISTS public.whatsapp_ab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.whatsapp_campaigns(id),
  variant TEXT, -- A / B
  template TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assign users randomly to A/B variants
CREATE OR REPLACE VIEW public.whatsapp_ab_assignment AS
SELECT
  u.id AS user_id,
  CASE WHEN random() < 0.5 THEN 'A' ELSE 'B' END AS variant
FROM auth.users u;

-- Join assignment with templates
CREATE OR REPLACE VIEW public.whatsapp_ab_sendable AS
SELECT
  a.user_id,
  u.phone,
  t.template,
  a.variant
FROM public.whatsapp_ab_assignment a
JOIN auth.users u ON u.id = a.user_id
JOIN public.whatsapp_ab_tests t ON t.variant = a.variant;

-- Performance by variant
SELECT
  template,
  COUNT(*) FILTER (WHERE status = 'SENT') AS sent,
  COUNT(*) FILTER (WHERE status = 'FAILED') AS failed
FROM public.whatsapp_log
GROUP BY template;
