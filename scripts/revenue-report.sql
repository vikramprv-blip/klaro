-- simple monthly revenue estimate (assumes fixed plan price)
-- change 999 to your plan price (INR)

SELECT
  date_trunc('month', COALESCE(paid_until, created_at)) AS month,
  COUNT(*) FILTER (WHERE payment_status = 'PAID') * 999 AS estimated_revenue
FROM public.user_billing
GROUP BY 1
ORDER BY 1 DESC;
