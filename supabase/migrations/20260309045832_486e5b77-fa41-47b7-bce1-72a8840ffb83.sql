ALTER TABLE public.saved_meals 
ADD COLUMN include_in_plan boolean NOT NULL DEFAULT true,
ADD COLUMN frequency text NOT NULL DEFAULT 'every_week';