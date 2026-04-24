-- Compare revenue under different price points (simulation)
-- Adjust prices as needed

WITH base AS (
  SELECT COUNT(*) AS paid_users
  FROM public.user_billing
  WHERE payment_status = 'PAID'
)

SELECT
  paid_users,
  paid_users * 499 AS revenue_499,
  paid_users * 999 AS revenue_999,
  paid_users * 1499 AS revenue_1499
FROM base;
