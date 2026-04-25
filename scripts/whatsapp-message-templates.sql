-- WhatsApp message templates for follow-ups

-- 1. Trial ending soon
SELECT
  u.phone,
  'Hi ' || COALESCE(u.email, '') || ', your Klaro trial is ending soon. Upgrade to continue using all features. Reply to this message to get started.' AS message
FROM auth.users u
JOIN public.user_billing b ON b.user_id = u.id
WHERE b.payment_status = 'TRIAL'
  AND b.trial_ends_at < now() + interval '24 hours'
  AND b.trial_ends_at > now();

-- 2. Blocked feature (high intent)
SELECT
  u.phone,
  'Hi, you tried accessing premium features on Klaro. Unlock everything by upgrading. Reply to activate your account.' AS message
FROM auth.users u
JOIN public.user_billing b ON b.user_id = u.id
JOIN public.feature_usage_log f ON f.user_id = u.id
WHERE f.status = 'BLOCKED';

-- 3. Expired trial
SELECT
  u.phone,
  'Hi, your Klaro trial has expired. You can still continue by upgrading your plan. Let me know if you want help.' AS message
FROM auth.users u
JOIN public.user_billing b ON b.user_id = u.id
WHERE b.payment_status = 'FREE'
  AND b.trial_ends_at IS NOT NULL
  AND b.trial_ends_at < now();
