-- Log a WhatsApp send (manual/testing)

INSERT INTO public.whatsapp_log (user_id, phone, message, status)
SELECT
  u.id,
  u.phone,
  'Test message from Klaro',
  'SENT'
FROM auth.users u
WHERE u.email = 'customer@example.com';
