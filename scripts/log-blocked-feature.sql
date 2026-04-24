-- Manually log a blocked feature attempt (for testing / analysis)
-- Replace email + feature

INSERT INTO public.feature_usage_log (user_id, feature, action, status)
SELECT
  u.id,
  'work_items_create',   -- feature name
  'attempt',
  'BLOCKED'
FROM auth.users u
WHERE u.email = 'customer@example.com';
