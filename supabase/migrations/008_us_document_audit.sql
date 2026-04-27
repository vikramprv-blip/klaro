alter table document_vault
add column if not exists deleted_at timestamptz,
add column if not exists updated_at timestamptz default now();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_document_vault_updated_at on document_vault;

create trigger set_document_vault_updated_at
before update on document_vault
for each row
execute function set_updated_at();

create table if not exists document_activity_logs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid,
  firm_id uuid,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
