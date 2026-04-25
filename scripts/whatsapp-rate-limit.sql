-- Global rate limit: cap total sends per minute (e.g., 60/min)

-- Track sends per minute
CREATE OR REPLACE VIEW public.whatsapp_sends_last_minute AS
SELECT COUNT(*) AS sent_last_minute
FROM public.whatsapp_log
WHERE created_at > now() - interval '1 minute';

-- Gate: allow sending only if under cap
CREATE OR REPLACE VIEW public.whatsapp_global_under_cap AS
SELECT 1 AS ok
FROM public.whatsapp_sends_last_minute
WHERE sent_last_minute < 60;

-- Final sendable view combining all constraints
CREATE OR REPLACE VIEW public.whatsapp_sendable_clean AS
SELECT s.*
FROM public.whatsapp_sendable s
JOIN public.user_billing b ON b.user_id = s.user_id
JOIN public.whatsapp_under_cap cap ON cap.user_id = s.user_id
JOIN public.whatsapp_global_under_cap g ON true
LEFT JOIN public.whatsapp_blacklist bl ON bl.user_id = s.user_id,
public.whatsapp_allowed_time t
WHERE bl.user_id IS NULL
  AND COALESCE(b.whatsapp_opt_out, false) = false
  AND COALESCE(b.whatsapp_opt_in, false) = true
  AND t.hour_ist >= 9
  AND t.hour_ist < 21;
