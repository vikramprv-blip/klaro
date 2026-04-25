-- Retry failed WhatsApp messages (max 3 attempts)

UPDATE public.whatsapp_outbox
SET
  status = 'PENDING'
WHERE status = 'FAILED'
  AND attempts < 3;

-- View retry candidates
SELECT
  id,
  user_id,
  phone,
  template,
  attempts
FROM public.whatsapp_outbox
WHERE status = 'PENDING'
ORDER BY attempts ASC, created_at ASC;
