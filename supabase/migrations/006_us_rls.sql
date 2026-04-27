alter table document_vault enable row level security;

create policy "Users can view their firm's documents"
on document_vault for select
using (firm_id::text = auth.jwt() ->> 'firm_id');

create policy "Users can insert their firm's documents"
on document_vault for insert
with check (firm_id::text = auth.jwt() ->> 'firm_id');

create policy "Users can delete their firm's documents"
on document_vault for delete
using (firm_id::text = auth.jwt() ->> 'firm_id');
