import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Household = {
  id: string;
  owner_id: string;
  name: string;
  num_adults: number;
  num_children: number;
  child_age_bands: string[];
};

export type HouseholdPreferences = {
  id: string;
  household_id: string;
  cuisines_liked: string[];
  cuisines_disliked: string[];
  dietary_preferences: string[];
  allergies: string[];
  weekly_grocery_budget: number | null;
  cooking_time_tolerance: string;
  preferred_takeout_frequency: number;
  grocery_store: string | null;
  delivery_preference: string;
  health_goal: string;
};

export const useHousehold = () => {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [preferences, setPreferences] = useState<HouseholdPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      const { data: hh } = await supabase
        .from("households")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (hh) {
        setHousehold(hh as Household);
        const { data: prefs } = await supabase
          .from("household_preferences")
          .select("*")
          .eq("household_id", hh.id)
          .maybeSingle();
        if (prefs) setPreferences(prefs as HouseholdPreferences);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { household, preferences, loading };
};
