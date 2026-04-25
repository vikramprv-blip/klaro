-- De-duplicate WhatsApp sends: do not send same template within 24h

-- Add template + dedupe hash
ALTER TABLE public.whatsapp_log
  ADD COLUMN IF NOT EXISTS template TEXT,
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

-- Backfill dedupe_key if missing
UPDATE public.whatsapp_log
SET dedupe_key = md5(COALESCE(user_id::text,'') || '|' || COALESCE(template,'') || '|' || date_trunc('day', created_at)::text)
WHERE dedupe_key IS NULL;

-- Unique index to prevent duplicates per day per template per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_whatsapp_dedupe
ON public.whatsapp_log (user_id, template, date_trunc('day', created_at));

-- View: who can be sent (no send in last 24h for template)
CREATE OR REPLACE VIEW public.whatsapp_sendable AS
SELECT
  u.id AS user_id,
  u.phone,
  'trial_expiry_24h'::text AS template
FROM auth.users u
JOIN public.user_billing b ON b.user_id = u.id
WHERE b.payment_status = 'TRIAL'
  AND b.trial_ends_at IS NOT NULL
  AND b.trial_ends_at < now() + interval '24 hours'
  AND b.trial_ends_at > now()
  AND NOT EXISTS (
    SELECT 1
    FROM public.whatsapp_log w
    WHERE w.user_id = u.id
      AND w.template = 'trial_expiry_24h'
      AND w.created_at > now() - interval '24 hours'
  );
