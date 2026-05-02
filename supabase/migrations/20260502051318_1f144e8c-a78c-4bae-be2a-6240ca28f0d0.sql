CREATE TABLE IF NOT EXISTS public.push_notification_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('delivered', 'clicked', 'opened')),
  weekday SMALLINT,
  local_hour SMALLINT,
  local_minute SMALLINT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per (event_id, event_type) — keeps clicks/opens idempotent if the SW
-- fires the callback multiple times.
CREATE UNIQUE INDEX IF NOT EXISTS push_notification_events_event_type_uniq
  ON public.push_notification_events (event_id, event_type);

CREATE INDEX IF NOT EXISTS push_notification_events_user_cat_time_idx
  ON public.push_notification_events (user_id, category, occurred_at DESC);

ALTER TABLE public.push_notification_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own events (for personal analytics).
CREATE POLICY "Users can view own notification events"
  ON public.push_notification_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only the service role inserts. No client INSERT/UPDATE/DELETE policy =
-- denied for authenticated/anon by default with RLS on.