CREATE OR REPLACE FUNCTION public.throttle_study_signups()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.email := lower(btrim(NEW.email));

  IF EXISTS (
    SELECT 1 FROM public.study_signups
    WHERE email = NEW.email
      AND created_at > now() - interval '1 hour'
  ) THEN
    RAISE EXCEPTION 'rate_limited: this email was used recently'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER throttle_study_signups_trigger
  BEFORE INSERT ON public.study_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.throttle_study_signups();