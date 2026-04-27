insert into storage.buckets (id, name, public)
values ('documents-us', 'documents-us', false)
on conflict (id) do nothing;

create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documents-us');

create policy "Allow authenticated read"
on storage.objects for select
to authenticated
using (bucket_id = 'documents-us');

create policy "Allow owner delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'documents-us');
