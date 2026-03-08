
-- Create evening check-ins table
CREATE TABLE public.evening_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_day_id uuid NOT NULL REFERENCES public.plan_days(id) ON DELETE CASCADE,
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  tags text[] NOT NULL DEFAULT '{}',
  effort_level text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint so only one check-in per day
ALTER TABLE public.evening_checkins ADD CONSTRAINT evening_checkins_plan_day_unique UNIQUE (plan_day_id);

-- Enable RLS
ALTER TABLE public.evening_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own checkins" ON public.evening_checkins
  FOR SELECT TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own checkins" ON public.evening_checkins
  FOR INSERT TO authenticated
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update own checkins" ON public.evening_checkins
  FOR UPDATE TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own checkins" ON public.evening_checkins
  FOR DELETE TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
