
-- Add cross-device dismissed state for the Home Screen setup card
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS home_screen_setup_dismissed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS home_screen_setup_dismissed_at timestamptz;

-- Lightweight analytics events table for in-app product events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event
  ON public.analytics_events (user_id, event_name, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
