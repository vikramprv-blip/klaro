COPY (
  SELECT
    u.email,
    b.payment_status,
    b.paid_until,
    b.trial_ends_at,
    b.created_at
  FROM public.user_billing b
  JOIN auth.users u ON u.id = b.user_id
  WHERE b.payment_status = 'PAID'
  ORDER BY b.created_at DESC
) TO STDOUT WITH CSV HEADER;
