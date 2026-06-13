-- Allow only the backend service role to insert push notification events
CREATE POLICY "Service role can insert notification events"
ON public.push_notification_events
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow users to delete their own household's weekly contexts
CREATE POLICY "Users can delete own weekly contexts"
ON public.weekly_contexts
FOR DELETE
USING (household_id IN (
  SELECT households.id
  FROM households
  WHERE households.owner_id = auth.uid()
));