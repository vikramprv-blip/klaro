-- Create WhatsApp outbox queue

CREATE TABLE IF NOT EXISTS public.whatsapp_outbox (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  template TEXT,
  payload JSONB,
  status TEXT DEFAULT 'PENDING', -- PENDING / SENT / FAILED
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_outbox_status ON public.whatsapp_outbox (status);
CREATE INDEX IF NOT EXISTS idx_wa_outbox_user ON public.whatsapp_outbox (user_id);

-- Enqueue from sendable view (idempotent via dedupe)
INSERT INTO public.whatsapp_outbox (user_id, phone, template, payload)
SELECT
  s.user_id,
  s.phone,
  s.template,
  jsonb_build_object('template', s.template)
FROM public.whatsapp_sendable s
ON CONFLICT DO NOTHING;
