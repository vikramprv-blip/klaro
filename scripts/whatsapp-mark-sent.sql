-- Mark sent and log (replace id list before running)

UPDATE public.whatsapp_outbox
SET status = 'SENT'
WHERE id IN ('REPLACE_WITH_IDS');

INSERT INTO public.whatsapp_log (user_id, phone, message, status, template)
SELECT user_id, phone, template, 'SENT', template
FROM public.whatsapp_outbox
WHERE id IN ('REPLACE_WITH_IDS');
