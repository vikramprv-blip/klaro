-- Fetch a batch to send (limit 50), mark as in-progress (optimistic)

WITH batch AS (
  SELECT id
  FROM public.whatsapp_outbox
  WHERE status = 'PENDING'
  ORDER BY created_at ASC
  LIMIT 50
)
UPDATE public.whatsapp_outbox o
SET
  status = 'IN_PROGRESS',
  last_attempt_at = now(),
  attempts = attempts + 1
FROM batch b
WHERE o.id = b.id
RETURNING o.*;
