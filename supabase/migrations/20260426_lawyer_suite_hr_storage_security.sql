create table if not exists lawyer_firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists lawyer_team_members (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references lawyer_firms(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('partner','associate','clerk','paralegal','intern','accountant','admin')),
  email text,
  phone text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists lawyer_matters (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references lawyer_firms(id) on delete cascade,
  title text not null,
  client_name text,
  court_name text,
  cnr_number text,
  status text default 'active',
  next_hearing_date date,
  created_at timestamptz default now()
);

create table if not exists lawyer_hr_tasks (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references lawyer_firms(id) on delete cascade,
  matter_id uuid references lawyer_matters(id) on delete set null,
  assigned_to uuid references lawyer_team_members(id) on delete set null,
  task_type text not null,
  title text not null,
  due_date date,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists lawyer_evidence_vault (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references lawyer_firms(id) on delete cascade,
  matter_id uuid references lawyer_matters(id) on delete cascade,
  file_path text not null,
  file_hash text,
  uploaded_by uuid references lawyer_team_members(id) on delete set null,
  section_65b_certificate_status text default 'draft_required',
  created_at timestamptz default now()
);

create table if not exists lawyer_audit_logs (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references lawyer_firms(id) on delete cascade,
  actor_id uuid references lawyer_team_members(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table lawyer_firms enable row level security;
alter table lawyer_team_members enable row level security;
alter table lawyer_matters enable row level security;
alter table lawyer_hr_tasks enable row level security;
alter table lawyer_evidence_vault enable row level security;
alter table lawyer_audit_logs enable row level security;

create index if not exists idx_lawyer_matters_firm on lawyer_matters(firm_id);
create index if not exists idx_lawyer_matters_cnr on lawyer_matters(cnr_number);
create index if not exists idx_lawyer_tasks_assigned_to on lawyer_hr_tasks(assigned_to);
create index if not exists idx_lawyer_evidence_matter on lawyer_evidence_vault(matter_id);
