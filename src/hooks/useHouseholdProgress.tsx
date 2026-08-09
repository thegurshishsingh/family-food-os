import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeMomentum, type CheckInRecord, type MomentumStats } from "@/lib/gamification";

/**
 * Loads every check-in for a household and derives momentum stats
 * (streak, level, milestones). Derived only — no extra tables.
 */
export function useHouseholdProgress(householdId?: string, refreshKey?: unknown) {
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!householdId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("evening_checkins")
      .select("created_at, outcome")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });
    setRecords((data as CheckInRecord[]) ?? []);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const stats = (weekLogged = 0, weekTotal = 7): MomentumStats =>
    computeMomentum(records, { weekLogged, weekTotal });

  return { records, loading, reload: load, stats };
}
