CREATE TABLE public.cached_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  plan_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(household_id)
);

ALTER TABLE public.cached_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cached recs"
  ON public.cached_recommendations FOR SELECT
  TO authenticated
  USING (household_id IN (SELECT id FROM households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own cached recs"
  ON public.cached_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (household_id IN (SELECT id FROM households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update own cached recs"
  ON public.cached_recommendations FOR UPDATE
  TO authenticated
  USING (household_id IN (SELECT id FROM households WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own cached recs"
  ON public.cached_recommendations FOR DELETE
  TO authenticated
  USING (household_id IN (SELECT id FROM households WHERE owner_id = auth.uid()));