-- Delete old backup records (keep last 30 days)

DELETE FROM public.deleted_users_backup
WHERE created_at IS NOT NULL
  AND created_at < now() - interval '30 days';
