create table if not exists stripe_events (
  id text primary key,
  type text,
  data jsonb,
  created_at timestamptz default now()
);
