-- Remove direct anonymous/authenticated write access to study_signups.
-- Submissions now go through the validated submit-study-signup edge function
-- (service_role), which bypasses RLS. This prevents arbitrary public inserts.

DROP POLICY IF EXISTS "Anyone can submit a study signup" ON public.study_signups;

REVOKE INSERT ON public.study_signups FROM anon, authenticated;