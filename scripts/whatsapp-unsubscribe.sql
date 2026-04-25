-- Allow users to unsubscribe from WhatsApp messages

-- Add unsubscribe flag
ALTER TABLE public.user_billing
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out BOOLEAN DEFAULT false;

-- Mark user as unsubscribed (replace email)
UPDATE public.user_billing b
SET whatsapp_opt_out = true
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email = 'customer@example.com';

-- Update clean sendable view to respect opt-out
CREATE OR REPLACE VIEW public.whatsapp_sendable_clean AS
SELECT s.*
FROM public.whatsapp_sendable s
JOIN public.user_billing b ON b.user_id = s.user_id
LEFT JOIN public.whatsapp_blacklist bl ON bl.user_id = s.user_id
WHERE bl.user_id IS NULL
  AND COALESCE(b.whatsapp_opt_out, false) = false;
