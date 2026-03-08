import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHousehold, type HouseholdPreferences } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, X } from "lucide-react";

const CUISINES = ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "Mediterranean", "American", "Korean", "French", "Middle Eastern", "Vietnamese"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Keto", "Paleo", "Halal", "Kosher", "Low-sodium", "Nut-free"];
const ALLERGIES = ["Peanuts", "Tree nuts", "Milk", "Eggs", "Fish", "Shellfish", "Wheat", "Soy", "Sesame"];
const HEALTH_GOALS = ["Balanced family eating", "Lose weight", "Gain weight", "Higher protein", "Maintain"];
const AGE_BANDS = ["0–1 (infant)", "1–3 (toddler)", "3–5 (preschool)", "5–10 (school age)", "10–13 (preteen)", "13–18 (teenager)"];

const HouseholdSettings = () => {
  const { household, preferences, loading: hhLoading } = useHousehold();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Household
  const [name, setName] = useState("");
  const [numAdults, setNumAdults] = useState(2);
  const [numChildren, setNumChildren] = useState(0);
  const [childAgeBands, setChildAgeBands] = useState<string[]>([]);

  // Preferences
  const [cuisinesLiked, setCuisinesLiked] = useState<string[]>([]);
  const [cuisinesDisliked, setCuisinesDisliked] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergyList] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [cookingTolerance, setCookingTolerance] = useState("medium");
  const [takeoutFreq, setTakeoutFreq] = useState(1);
  const [groceryStore, setGroceryStore] = useState("");
  const [deliveryPref, setDeliveryPref] = useState("in-store");
  const [healthGoal, setHealthGoal] = useState("Balanced family eating");

  // Saved meals
  const [savedMeals, setSavedMeals] = useState<{ id: string; meal_name: string; meal_description: string | null }[]>([]);
  const [newMealName, setNewMealName] = useState("");
  const [newMealDesc, setNewMealDesc] = useState("");

  useEffect(() => {
    if (household) {
      setName(household.name);
      setNumAdults(household.num_adults);
      setNumChildren(household.num_children);
      setChildAgeBands(household.child_age_bands || []);
    }
    if (preferences) {
      setCuisinesLiked(preferences.cuisines_liked || []);
      setCuisinesDisliked(preferences.cuisines_disliked || []);
      setDietary(preferences.dietary_preferences || []);
      setAllergyList(preferences.allergies || []);
      setBudget(preferences.weekly_grocery_budget?.toString() || "");
      setCookingTolerance(preferences.cooking_time_tolerance || "medium");
      setTakeoutFreq(preferences.preferred_takeout_frequency || 1);
      setGroceryStore(preferences.grocery_store || "");
      setDeliveryPref(preferences.delivery_preference || "in-store");
      setHealthGoal(preferences.health_goal || "Balanced family eating");
    }
  }, [household, preferences]);

  const toggleInList = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSave = async () => {
    if (!household) return;
    setSaving(true);
    try {
      const { error: hhError } = await supabase
        .from("households")
        .update({ name, num_adults: numAdults, num_children: numChildren, child_age_bands: childAgeBands })
        .eq("id", household.id);
      if (hhError) throw hhError;

      const { error: prefError } = await supabase
        .from("household_preferences")
        .update({
          cuisines_liked: cuisinesLiked,
          cuisines_disliked: cuisinesDisliked,
          dietary_preferences: dietary,
          allergies,
          weekly_grocery_budget: budget ? parseFloat(budget) : null,
          cooking_time_tolerance: cookingTolerance,
          preferred_takeout_frequency: takeoutFreq,
          grocery_store: groceryStore || null,
          delivery_preference: deliveryPref,
          health_goal: healthGoal,
        })
        .eq("household_id", household.id);
      if (prefError) throw prefError;

      toast({ title: "Settings saved!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error saving", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (hhLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">Household Settings</h1>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Family basics */}
          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Family Basics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-sm">
                <Label>Household name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div>
                  <Label>Adults</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setNumAdults(Math.max(1, numAdults - 1))}>−</Button>
                    <span className="text-lg font-medium w-8 text-center">{numAdults}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setNumAdults(numAdults + 1)}>+</Button>
                  </div>
                </div>
                <div>
                  <Label>Children</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setNumChildren(Math.max(0, numChildren - 1))}>−</Button>
                    <span className="text-lg font-medium w-8 text-center">{numChildren}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setNumChildren(numChildren + 1)}>+</Button>
                  </div>
                </div>
              </div>
              {numChildren > 0 && (
                <div>
                  <Label>Children's age bands</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AGE_BANDS.map((band) => (
                      <button key={band} onClick={() => toggleInList(childAgeBands, band, setChildAgeBands)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${childAgeBands.includes(band) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}>
                        {band}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Food preferences */}
          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Food Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Cuisines liked</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CUISINES.map((c) => (
                    <button key={c} onClick={() => toggleInList(cuisinesLiked, c, setCuisinesLiked)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${cuisinesLiked.includes(c) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Cuisines to avoid</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CUISINES.map((c) => (
                    <button key={c} onClick={() => toggleInList(cuisinesDisliked, c, setCuisinesDisliked)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${cuisinesDisliked.includes(c) ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background text-foreground border-border hover:bg-muted"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Dietary preferences</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DIETARY.map((d) => (
                    <button key={d} onClick={() => toggleInList(dietary, d, setDietary)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${dietary.includes(d) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Allergies</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ALLERGIES.map((a) => (
                    <button key={a} onClick={() => toggleInList(allergies, a, setAllergyList)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${allergies.includes(a) ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background text-foreground border-border hover:bg-muted"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Health goal</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {HEALTH_GOALS.map((g) => (
                    <button key={g} onClick={() => setHealthGoal(g)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${healthGoal === g ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logistics */}
          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Logistics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-sm">
                <Label>Weekly grocery budget ($)</Label>
                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="mt-1.5" />
              </div>
              <div className="max-w-sm">
                <Label>Preferred grocery store</Label>
                <Input value={groceryStore} onChange={(e) => setGroceryStore(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium">Takeout nights per week: {takeoutFreq}</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setTakeoutFreq(Math.max(0, takeoutFreq - 1))}>−</Button>
                  <span className="text-lg font-medium w-8 text-center">{takeoutFreq}</span>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setTakeoutFreq(Math.min(7, takeoutFreq + 1))}>+</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default HouseholdSettings;
