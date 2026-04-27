create type if not exists country_code as enum ('IN', 'US');
create type if not exists profession_type as enum ('accountant', 'lawyer');
create type if not exists currency_code as enum ('INR', 'USD');

alter table if exists firms
add column if not exists country country_code default 'IN',
add column if not exists profession profession_type,
add column if not exists currency currency_code default 'INR',
add column if not exists timezone text default 'Asia/Kolkata';

create table if not exists us_states (
  code text primary key,
  name text not null
);

insert into us_states (code, name) values
('CA','California'),('NY','New York'),('TX','Texas'),('FL','Florida'),('IL','Illinois')
on conflict do nothing;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

create table if not exists stripe_customers (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  stripe_customer_id text unique not null,
  created_at timestamptz default now()
);

create table if not exists stripe_subscriptions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  stripe_subscription_id text unique not null,
  plan_name text not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists document_vault (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid,
  uploaded_by uuid references auth.users(id),
  country country_code default 'US',
  profession profession_type,
  title text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  related_entity_type text,
  related_entity_id uuid,
  is_sensitive boolean default true,
  created_at timestamptz default now()
);
