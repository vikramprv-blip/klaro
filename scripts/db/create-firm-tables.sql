create extension if not exists pgcrypto;

create table if not exists firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  header_url text,
  whatsapp_display_name text,
  whatsapp_phone text,
  created_at timestamptz default now()
);

create table if not exists firm_members (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz default now(),
  unique(firm_id, user_id)
);

create table if not exists firm_invites (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references firms(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz default now(),
  unique(firm_id, email)
);
