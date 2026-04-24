-- Assign access_type based on email domain or specific emails
-- Customize domains / emails as needed

UPDATE public.user_billing b
SET access_type = CASE
  WHEN u.email LIKE '%@yourcompany.com' THEN 'INTERNAL'
  WHEN u.email IN ('friend1@example.com','friend2@example.com') THEN 'FREE_TEST'
  ELSE b.access_type
END
FROM auth.users u
WHERE b.user_id = u.id;

-- View result
SELECT access_type, COUNT(*) FROM public.user_billing GROUP BY access_type;
