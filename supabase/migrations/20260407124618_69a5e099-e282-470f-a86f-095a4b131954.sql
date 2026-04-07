ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS mp_subscription_id text;