-- Create blacklist for users who should not receive WhatsApp messages

CREATE TABLE IF NOT EXISTS public.whatsapp_blacklist (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_wa_blacklist_user
ON public.whatsapp_blacklist (user_id);

-- View: sendable users excluding blacklist
CREATE OR REPLACE VIEW public.whatsapp_sendable_clean AS
SELECT s.*
FROM public.whatsapp_sendable s
LEFT JOIN public.whatsapp_blacklist b ON b.user_id = s.user_id
WHERE b.user_id IS NULL;
