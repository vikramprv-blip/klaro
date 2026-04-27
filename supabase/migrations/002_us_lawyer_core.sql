create table if not exists lawyer_clients (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  name text not null,
  email text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists matters (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  client_id uuid references lawyer_clients(id) on delete cascade,
  title text not null,
  description text,
  status text default 'open',
  opened_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists evidence_files (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid references matters(id) on delete cascade,
  file_path text not null,
  file_type text,
  file_size bigint,
  uploaded_at timestamptz default now()
);

create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid references matters(id) on delete cascade,
  user_id uuid,
  hours numeric,
  description text,
  created_at timestamptz default now()
);

create table if not exists retainers (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid references matters(id) on delete cascade,
  amount numeric,
  balance numeric,
  created_at timestamptz default now()
);
