CREATE TABLE public.study_signups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  household_type text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.study_signups TO anon, authenticated;
GRANT SELECT ON public.study_signups TO authenticated;
GRANT ALL ON public.study_signups TO service_role;

ALTER TABLE public.study_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a study signup"
  ON public.study_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (consent = true AND length(email) > 3 AND length(email) <= 255);

CREATE POLICY "Admins can view study signups"
  ON public.study_signups FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete study signups"
  ON public.study_signups FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));