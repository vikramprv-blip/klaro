-- Create WhatsApp send log table

CREATE TABLE IF NOT EXISTS public.whatsapp_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  message TEXT,
  status TEXT, -- SENT / FAILED
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_user ON public.whatsapp_log (user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status ON public.whatsapp_log (status);
