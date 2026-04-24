-- Create feature usage log table (for tracking gated feature attempts)

CREATE TABLE IF NOT EXISTS public.feature_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT,
  action TEXT,
  status TEXT, -- e.g. ALLOWED / BLOCKED
  created_at TIMESTAMPTZ DEFAULT now()
);

-- basic index for performance
CREATE INDEX IF NOT EXISTS idx_feature_usage_user
ON public.feature_usage_log (user_id);

CREATE INDEX IF NOT EXISTS idx_feature_usage_status
ON public.feature_usage_log (status);
