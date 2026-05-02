ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS weekly_plan_ready_days smallint[] NOT NULL DEFAULT ARRAY[0]::smallint[];