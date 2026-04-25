-- Frequency cap: max 3 messages per user per 24h

-- View: users under cap (eligible to send)
CREATE OR REPLACE VIEW public.whatsapp_under_cap AS
SELECT
  u.id AS user_id,
  u.phone
FROM auth.users u
LEFT JOIN public.whatsapp_log w
  ON w.user_id = u.id
  AND w.created_at > now() - interval '24 hours'
GROUP BY u.id, u.phone
HAVING COUNT(w.id) < 3;

-- Update clean sendable view to include cap
CREATE OR REPLACE VIEW public.whatsapp_sendable_clean AS
SELECT s.*
FROM public.whatsapp_sendable s
JOIN public.user_billing b ON b.user_id = s.user_id
JOIN public.whatsapp_under_cap cap ON cap.user_id = s.user_id
LEFT JOIN public.whatsapp_blacklist bl ON bl.user_id = s.user_id
WHERE bl.user_id IS NULL
  AND COALESCE(b.whatsapp_opt_out, false) = false
  AND COALESCE(b.whatsapp_opt_in, false) = true;
