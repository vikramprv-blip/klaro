-- Central config for retention (editable in one place)

CREATE TABLE IF NOT EXISTS public.retention_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  trial_days INTEGER DEFAULT 7,
  grace_days INTEGER DEFAULT 7
);

-- ensure single row
INSERT INTO public.retention_config (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- view current config
SELECT * FROM public.retention_config;
