-- CLEANUP + NORMALIZE access_type across all users

-- 1) Default NULLs → PAID (safe fallback)
UPDATE public.user_billing
SET access_type = 'PAID'
WHERE access_type IS NULL;

-- 2) INTERNAL (company emails)
UPDATE public.user_billing b
SET access_type = 'INTERNAL'
FROM auth.users u
WHERE b.user_id = u.id
  AND u.email LIKE '%@yourcompany.com';

-- 3) REAL PAID users (have payments)
UPDATE public.user_billing b
SET access_type = 'PAID'
WHERE EXISTS (
  SELECT 1 FROM public.payments_log p WHERE p.user_id = b.user_id
);

-- 4) FREE_TEST users (no payments but have paid_until)
UPDATE public.user_billing b
SET access_type = 'FREE_TEST'
WHERE b.payment_status = 'PAID'
  AND b.paid_until IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.payments_log p WHERE p.user_id = b.user_id
  );

-- 5) TRIAL users
UPDATE public.user_billing
SET access_type = 'TRIAL'
WHERE payment_status = 'TRIAL';

-- sanity summary
SELECT access_type, COUNT(*) FROM public.user_billing GROUP BY access_type;
