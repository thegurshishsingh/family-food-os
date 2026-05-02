
ALTER TABLE public.push_notification_events
  ADD COLUMN IF NOT EXISTS household_context jsonb NOT NULL DEFAULT '{}'::jsonb;

-- GIN index so the analytics UI can quickly filter events by context flags
-- like {"flags": ["budget_week"]} or {"child_age_bands": ["toddler"]}.
CREATE INDEX IF NOT EXISTS push_notification_events_household_context_gin
  ON public.push_notification_events USING gin (household_context);
