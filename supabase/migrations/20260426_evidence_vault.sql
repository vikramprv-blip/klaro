create table if not exists lawyer_evidence_certificates (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references lawyer_firms(id) on delete cascade,
  evidence_id uuid references lawyer_evidence_vault(id) on delete cascade,
  certificate_type text default 'section_65b',
  certificate_text text not null,
  generated_by uuid references lawyer_team_members(id) on delete set null,
  status text default 'draft',
  created_at timestamptz default now()
);

alter table lawyer_evidence_certificates enable row level security;

create index if not exists idx_lawyer_evidence_certificates_firm on lawyer_evidence_certificates(firm_id);
create index if not exists idx_lawyer_evidence_certificates_evidence on lawyer_evidence_certificates(evidence_id);

alter table lawyer_evidence_vault
add column if not exists original_filename text,
add column if not exists mime_type text,
add column if not exists file_size_bytes bigint,
add column if not exists storage_bucket text default 'lawyer-evidence',
add column if not exists integrity_status text default 'verified',
add column if not exists hash_algorithm text default 'sha256',
add column if not exists uploaded_at timestamptz default now(),
add column if not exists last_verified_at timestamptz;

insert into storage.buckets (id, name, public)
values ('lawyer-evidence', 'lawyer-evidence', false)
on conflict (id) do nothing;
