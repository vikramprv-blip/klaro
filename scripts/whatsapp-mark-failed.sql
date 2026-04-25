-- Mark failed (replace id list before running)

UPDATE public.whatsapp_outbox
SET status = 'FAILED'
WHERE id IN ('REPLACE_WITH_IDS');
