
-- Per-device metadata on push_subscriptions
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS app_version text,
  ADD COLUMN IF NOT EXISTS device_id text;

-- Per-device metadata on push_notification_events
ALTER TABLE public.push_notification_events
  ADD COLUMN IF NOT EXISTS subscription_id uuid,
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS app_version text,
  ADD COLUMN IF NOT EXISTS device_id text,
  ADD COLUMN IF NOT EXISTS endpoint_host text;

-- Drop old per-user uniqueness if it exists, allow per-device delivered rows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'push_notification_events_event_id_event_type_key'
  ) THEN
    ALTER TABLE public.push_notification_events
      DROP CONSTRAINT IF EXISTS push_notification_events_event_id_event_type_key;
    DROP INDEX IF EXISTS public.push_notification_events_event_id_event_type_key;
  END IF;
END $$;

-- New uniqueness: one row per (event_id, event_type, subscription_id).
-- Subscription_id is nullable for clicks/opens that don't know which device,
-- so we treat NULL as a distinct value via COALESCE on a sentinel UUID.
CREATE UNIQUE INDEX IF NOT EXISTS push_notification_events_event_type_sub_uniq
  ON public.push_notification_events (
    event_id,
    event_type,
    COALESCE(subscription_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

-- Analytics queries: filter by user/category, then by platform/version
CREATE INDEX IF NOT EXISTS push_notification_events_user_category_platform_idx
  ON public.push_notification_events (user_id, category, platform, occurred_at DESC);
