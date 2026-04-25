-- Add explicit WhatsApp opt-in tracking + consent logging

-- 1) Add opt-in fields
ALTER TABLE public.user_billing
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMPTZ;

-- 2) Consent log table
CREATE TABLE IF NOT EXISTS public.whatsapp_consent_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  action TEXT, -- OPT_IN / OPT_OUT
  source TEXT, -- WEB / SUPPORT / IMPORT
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_consent_user
ON public.whatsapp_consent_log (user_id);

-- 3) Opt-in a user (replace email)
UPDATE public.user_billing b
SET
  whatsapp_opt_in = true,
  whatsapp_opt_in_at = now(),
  whatsapp_opt_out = false
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com';

INSERT INTO public.whatsapp_consent_log (user_id, phone, action, source)
SELECT u.id, u.phone, 'OPT_IN', 'SUPPORT'
FROM auth.users u
WHERE u.email = 'customer@example.com';

-- 4) Update sendable view to require opt-in
CREATE OR REPLACE VIEW public.whatsapp_sendable_clean AS
SELECT s.*
FROM public.whatsapp_sendable s
JOIN public.user_billing b ON b.user_id = s.user_id
LEFT JOIN public.whatsapp_blacklist bl ON bl.user_id = s.user_id
WHERE bl.user_id IS NULL
  AND COALESCE(b.whatsapp_opt_out, false) = false
  AND COALESCE(b.whatsapp_opt_in, false) = true;
