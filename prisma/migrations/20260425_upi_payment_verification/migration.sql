CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.upi_payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  email text,
  plan text NOT NULL,
  amount_paise integer NOT NULL,
  upi_ref text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 minutes'
);

CREATE UNIQUE INDEX IF NOT EXISTS upi_payment_requests_upi_ref_key
ON public.upi_payment_requests (upi_ref)
WHERE upi_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS upi_payment_requests_status_idx
ON public.upi_payment_requests (status);

CREATE TABLE IF NOT EXISTS public.upi_payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid REFERENCES public.upi_payment_requests(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
