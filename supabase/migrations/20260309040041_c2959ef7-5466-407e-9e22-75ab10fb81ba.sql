ALTER TABLE public.household_preferences 
ADD COLUMN foods_to_avoid text[] DEFAULT '{}'::text[];