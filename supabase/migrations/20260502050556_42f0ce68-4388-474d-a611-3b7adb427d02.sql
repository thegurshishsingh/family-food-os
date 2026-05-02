ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS dinner_reveal_time time NOT NULL DEFAULT '13:00',
  ADD COLUMN IF NOT EXISTS evening_checkin_time time NOT NULL DEFAULT '19:30',
  ADD COLUMN IF NOT EXISTS weekly_plan_ready_time time NOT NULL DEFAULT '09:00';