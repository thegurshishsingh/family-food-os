
CREATE TABLE public.saved_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved meals"
  ON public.saved_meals FOR SELECT
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own saved meals"
  ON public.saved_meals FOR INSERT
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update own saved meals"
  ON public.saved_meals FOR UPDATE
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own saved meals"
  ON public.saved_meals FOR DELETE
  USING (household_id IN (SELECT id FROM public.households WHERE owner_id = auth.uid()));
