-- Enforce quiet hours (e.g., no sends between 9 PM and 9 AM IST)

-- View: allowed sending hours (IST)
CREATE OR REPLACE VIEW public.whatsapp_allowed_time AS
SELECT
  now() AT TIME ZONE 'Asia/Kolkata' AS current_time_ist,
  EXTRACT(HOUR FROM now() AT TIME ZONE 'Asia/Kolkata') AS hour_ist;

-- Update sendable view to respect quiet hours
CREATE OR REPLACE VIEW public.whatsapp_sendable_clean AS
SELECT s.*
FROM public.whatsapp_sendable s
JOIN public.user_billing b ON b.user_id = s.user_id
JOIN public.whatsapp_under_cap cap ON cap.user_id = s.user_id
LEFT JOIN public.whatsapp_blacklist bl ON bl.user_id = s.user_id,
public.whatsapp_allowed_time t
WHERE bl.user_id IS NULL
  AND COALESCE(b.whatsapp_opt_out, false) = false
  AND COALESCE(b.whatsapp_opt_in, false) = true
  AND t.hour_ist >= 9
  AND t.hour_ist < 21;
