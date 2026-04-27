create table if not exists accountant_clients (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  name text not null,
  email text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists entities (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  client_id uuid references accountant_clients(id) on delete cascade,
  name text not null,
  entity_type text,
  ein text,
  state text,
  created_at timestamptz default now()
);

create table if not exists tax_forms (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  form_type text,
  tax_year int,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists sales_tax_records (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  state text,
  amount numeric,
  period text,
  created_at timestamptz default now()
);

create table if not exists 1099_records (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  vendor_name text,
  amount numeric,
  tax_year int,
  created_at timestamptz default now()
);

create table if not exists w2_records (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references entities(id) on delete cascade,
  employee_name text,
  wages numeric,
  tax_year int,
  created_at timestamptz default now()
);
