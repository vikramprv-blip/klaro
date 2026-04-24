-- High value users (top spenders based on payments_log)

SELECT
  u.email,
  SUM(p.amount) AS total_spent,
  COUNT(*) AS transactions,
  MAX(p.created_at) AS last_payment
FROM public.payments_log p
JOIN auth.users u ON u.id = p.user_id
GROUP BY u.email
HAVING SUM(p.amount) > 0
ORDER BY total_spent DESC
LIMIT 50;
