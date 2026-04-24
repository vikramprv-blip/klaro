-- Export deleted users log (for audit / compliance)

COPY (
  SELECT
    l.user_id,
    u.email,
    l.reason,
    l.deleted_at
  FROM public.data_deletion_log l
  LEFT JOIN auth.users u ON u.id = l.user_id
  ORDER BY l.deleted_at DESC
) TO STDOUT WITH CSV HEADER;
