-- Throttle sending: limit messages per minute (e.g., 30/min)

-- Fetch up to 30 messages created in the last minute
SELECT *
FROM public.whatsapp_outbox
WHERE status = 'PENDING'
  AND created_at > now() - interval '10 minutes'
ORDER BY created_at ASC
LIMIT 30;

-- Optional: mark them IN_PROGRESS (use with dequeue script ideally)
-- UPDATE public.whatsapp_outbox
-- SET status = 'IN_PROGRESS', last_attempt_at = now(), attempts = attempts + 1
-- WHERE id IN (...);
