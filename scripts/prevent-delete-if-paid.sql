-- SAFETY GUARD:
-- ensures no paid or active users are ever deleted

WITH invalid_targets AS (
  SELECT user_id
  FROM public.user_billing
  WHERE
    payment_status IN ('PAID','TRIAL')
    OR (paid_until IS NOT NULL AND paid_until > now())
    OR (trial_ends_at IS NOT NULL AND trial_ends_at > now())
)

SELECT
  COUNT(*) AS risky_users
FROM invalid_targets;
