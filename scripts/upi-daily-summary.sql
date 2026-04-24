-- Daily UPI revenue + transactions summary

SELECT
  date_trunc('day', p.created_at) AS day,
  COUNT(*) AS transactions,
  SUM(p.amount) AS total_revenue
FROM public.payments_log p
WHERE p.method = 'UPI'
GROUP BY 1
ORDER BY 1 DESC;
