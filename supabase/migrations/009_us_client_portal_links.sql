create table if not exists client_portal_links (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null,
  document_id uuid not null,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  revoked_at timestamptz
);

create index if not exists idx_client_portal_links_token
on client_portal_links(token);

create index if not exists idx_client_portal_links_document_id
on client_portal_links(document_id);

create index if not exists idx_client_portal_links_firm_id
on client_portal_links(firm_id);
