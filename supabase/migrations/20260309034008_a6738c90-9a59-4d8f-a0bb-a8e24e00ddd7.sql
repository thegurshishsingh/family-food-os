-- Fix RLS policies on evening_checkins: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can view own checkins" ON evening_checkins;
CREATE POLICY "Users can view own checkins" ON evening_checkins
  FOR SELECT TO authenticated
  USING (household_id IN (SELECT id FROM households WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert own checkins" ON evening_checkins;
CREATE POLICY "Users can insert own checkins" ON evening_checkins
  FOR INSERT TO authenticated
  WITH CHECK (household_id IN (SELECT id FROM households WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own checkins" ON evening_checkins;
CREATE POLICY "Users can update own checkins" ON evening_checkins
  FOR UPDATE TO authenticated
  USING (household_id IN (SELECT id FROM households WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own checkins" ON evening_checkins;
CREATE POLICY "Users can delete own checkins" ON evening_checkins
  FOR DELETE TO authenticated
  USING (household_id IN (SELECT id FROM households WHERE owner_id = auth.uid()));