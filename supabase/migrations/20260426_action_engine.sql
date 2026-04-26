create table if not exists lawyer_action_suggestions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  matter_id uuid,
  suggestion_type text,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);
