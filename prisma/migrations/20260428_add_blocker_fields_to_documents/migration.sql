ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS blocked_by text,
ADD COLUMN IF NOT EXISTS due_date timestamptz;
