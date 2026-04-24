-- revenue split by payment method

SELECT
  method,
  COUNT(*) AS transactions,
  SUM(amount) AS total_revenue
FROM public.payments_log
GROUP BY method
ORDER BY total_revenue DESC;
