-- churn = users who were PAID and moved to CANCELED

SELECT
  date_trunc('month', paid_until) AS month,
  COUNT(*) FILTER (WHERE payment_status = 'CANCELED') AS churned_users
FROM public.user_billing
WHERE paid_until IS NOT NULL
GROUP BY 1
ORDER BY 1 DESC;
