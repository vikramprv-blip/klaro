-- Update firm settings
update firms
set
  logo_url = :logo_url,
  header_url = :header_url,
  whatsapp_display_name = :whatsapp_display_name,
  whatsapp_phone = :whatsapp_phone
where id = :firm_id;
