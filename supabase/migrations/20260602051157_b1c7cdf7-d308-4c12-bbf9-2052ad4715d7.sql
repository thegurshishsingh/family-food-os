-- 1. Lock down SECURITY DEFINER functions: revoke EXECUTE from anon & authenticated.
-- These are either invoked only by edge functions (service_role) or used internally by RLS/triggers.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;

-- has_role is used inside RLS policies (runs as definer, no EXECUTE grant needed for that),
-- but keep it available to service_role for any admin/server paths.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- 2. Add explicit owner-scoped DELETE policy for household_preferences (consistency with SELECT/INSERT/UPDATE).
CREATE POLICY "Users can delete own household prefs"
ON public.household_preferences
FOR DELETE
USING (household_id IN (
  SELECT households.id FROM households WHERE households.owner_id = auth.uid()
));

-- 3. Add explicit owner-scoped UPDATE and DELETE policies for meal_feedback.
CREATE POLICY "Users can update own meal feedback"
ON public.meal_feedback
FOR UPDATE
USING (household_id IN (
  SELECT households.id FROM households WHERE households.owner_id = auth.uid()
));

CREATE POLICY "Users can delete own meal feedback"
ON public.meal_feedback
FOR DELETE
USING (household_id IN (
  SELECT households.id FROM households WHERE households.owner_id = auth.uid()
));

-- 4. Ensure email_unsubscribe_tokens has no client-facing table grants (service-role only).
REVOKE ALL ON TABLE public.email_unsubscribe_tokens FROM anon, authenticated;