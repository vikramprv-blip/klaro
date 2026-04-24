-- Weekly revenue estimate based on new paid activations

SELECT
  date_trunc('week', created_at) AS week,
  COUNT(*) FILTER (WHERE payment_status = 'PAID') * 999 AS weekly_revenue_inr
FROM public.user_billing
GROUP BY 1
ORDER BY 1 DESC;
