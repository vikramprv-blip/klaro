alter table public.us_firms
add column if not exists plan text not null default 'FREE',
add column if not exists billing_status text not null default 'active',
add column if not exists storage_limit_mb integer not null default 1024,
add column if not exists billing_provider text not null default 'MANUAL',
add column if not exists valid_till timestamptz,
add column if not exists stripe_customer_id text,
add column if not exists stripe_subscription_id text,
add column if not exists stripe_price_id text,
add column if not exists billing_updated_at timestamptz not null default now();

alter table public.us_firms
drop constraint if exists us_firms_plan_check;

alter table public.us_firms
add constraint us_firms_plan_check
check (plan in ('FREE', 'PRO', 'FIRM'));

alter table public.us_firms
drop constraint if exists us_firms_billing_status_check;

alter table public.us_firms
add constraint us_firms_billing_status_check
check (billing_status in ('active', 'trialing', 'past_due', 'cancelled', 'expired'));

alter table public.us_firms
drop constraint if exists us_firms_billing_provider_check;

alter table public.us_firms
add constraint us_firms_billing_provider_check
check (billing_provider in ('MANUAL', 'STRIPE'));

create table if not exists public.us_billing_events (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.us_firms(id) on delete cascade,
  event_type text not null,
  old_plan text,
  new_plan text,
  old_billing_status text,
  new_billing_status text,
  old_storage_limit_mb integer,
  new_storage_limit_mb integer,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists us_billing_events_firm_id_idx
on public.us_billing_events(firm_id);

create index if not exists us_billing_events_created_at_idx
on public.us_billing_events(created_at desc);
