-- Users who signed up again after being deleted (reactivation tracking)

SELECT
  u.email,
  u.created_at AS new_signup_at,
  l.deleted_at AS last_deleted_at
FROM auth.users u
JOIN public.data_deletion_log l ON l.user_id = u.id
WHERE u.created_at > l.deleted_at
ORDER BY u.created_at DESC;
