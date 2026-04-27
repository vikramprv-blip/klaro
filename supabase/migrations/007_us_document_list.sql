create or replace view us_documents_view as
select
  id,
  firm_id,
  title,
  file_path,
  file_type,
  file_size,
  profession,
  created_at
from document_vault
order by created_at desc;
