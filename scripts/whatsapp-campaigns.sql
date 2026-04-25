-- Campaign management for WhatsApp

CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  template TEXT,
  status TEXT DEFAULT 'DRAFT', -- DRAFT / ACTIVE / PAUSED
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assign messages to campaigns
ALTER TABLE public.whatsapp_outbox
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.whatsapp_campaigns(id);

-- Example: create a campaign
INSERT INTO public.whatsapp_campaigns (name, template, status)
VALUES ('Trial Expiry Push', 'trial_expiry_24h', 'ACTIVE');

-- View campaign performance
SELECT
  c.name,
  COUNT(o.id) FILTER (WHERE o.status = 'SENT') AS sent,
  COUNT(o.id) FILTER (WHERE o.status = 'FAILED') AS failed
FROM public.whatsapp_campaigns c
LEFT JOIN public.whatsapp_outbox o ON o.campaign_id = c.id
GROUP BY c.name;
