import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat, ArrowRight, ArrowLeft, Check, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const CUISINES = ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "Mediterranean", "American", "Korean", "French", "Middle Eastern", "Vietnamese"];
const DIETARY = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Keto", "Paleo", "Halal", "Kosher", "Low-sodium", "Nut-free"];
const ALLERGIES = ["Peanuts", "Tree nuts", "Milk", "Eggs", "Fish", "Shellfish", "Wheat", "Soy", "Sesame"];
const FOODS_TO_AVOID = ["Beef", "Pork", "Lamb", "Fish", "Shellfish", "Organ meats", "Tofu", "Mushrooms", "Spicy food", "Raw food"];
const AGE_BANDS = ["0–1 (infant)", "1–3 (toddler)", "3–5 (preschool)", "5–10 (school age)", "10–13 (preteen)", "13–18 (teenager)"];
const HEALTH_GOALS = ["Balanced family eating", "Lose weight", "Gain weight", "Higher protein", "Maintain"];
const COOKING_TOLERANCES = [
  { value: "minimal", label: "Minimal (15 min max)" },
  { value: "low", label: "Low (30 min max)" },
  { value: "medium", label: "Medium (45 min)" },
  { value: "high", label: "High (60+ min, I love cooking)" },
];

const STEPS = [
  { title: "Your household", desc: "Tell us about your family" },
  { title: "Food preferences", desc: "What does your family like?" },
  { title: "Logistics", desc: "Budget, time, and grocery habits" },
  { title: "Your meals", desc: "Add meals you'd like included in your plan" },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if household already exists
  useEffect(() => {
    const checkExisting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: hh } = await supabase
        .from("households")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle();
      if (hh) navigate("/planner", { replace: true });
    };
    checkExisting();
  }, [navigate]);

  // Step 1 - Household
  const [householdName, setHouseholdName] = useState("");
  const [numAdults, setNumAdults] = useState(2);
  const [numChildren, setNumChildren] = useState(0);
  const [childAgeBands, setChildAgeBands] = useState<string[]>([]);

  // Step 2 - Food preferences
  const [cuisinesLiked, setCuisinesLiked] = useState<string[]>([]);
  const [cuisinesDisliked, setCuisinesDisliked] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [foodsToAvoid, setFoodsToAvoid] = useState<string[]>([]);
  const [healthGoal, setHealthGoal] = useState("Balanced family eating");

  // Step 3 - Logistics
  const [budget, setBudget] = useState("");
  const [cookingTolerance, setCookingTolerance] = useState("medium");
  const [takeoutFreq, setTakeoutFreq] = useState(1);
  const [groceryStore, setGroceryStore] = useState("");
  const [deliveryPref, setDeliveryPref] = useState("in-store");

  // Step 4 - Custom meals
  const [savedMeals, setSavedMeals] = useState<{ name: string; description: string }[]>([]);
  const [newMealName, setNewMealName] = useState("");
  const [newMealDesc, setNewMealDesc] = useState("");


  const toggleInList = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const addMeal = () => {
    const trimmed = newMealName.trim().slice(0, 200);
    if (!trimmed) return;
    setSavedMeals((prev) => [...prev, { name: trimmed, description: newMealDesc.trim().slice(0, 500) }]);
    setNewMealName("");
    setNewMealDesc("");
  };

  const removeMeal = (idx: number) => {
    setSavedMeals((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if household already exists
      const { data: existingHh } = await supabase
        .from("households")
        .select("id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingHh) {
        // Household already exists — skip to planner
        navigate("/planner");
        return;
      }

      // Create household
      const { data: household, error: hhError } = await supabase
        .from("households")
        .insert({
          owner_id: user.id,
          name: householdName || "My Family",
          num_adults: numAdults,
          num_children: numChildren,
          child_age_bands: childAgeBands,
        })
        .select()
        .single();
      if (hhError) throw hhError;

      // Create preferences
      const { error: prefError } = await supabase
        .from("household_preferences")
        .insert({
          household_id: household.id,
          cuisines_liked: cuisinesLiked,
          cuisines_disliked: cuisinesDisliked,
          dietary_preferences: dietary,
          allergies,
          foods_to_avoid: foodsToAvoid,
          weekly_grocery_budget: budget ? parseFloat(budget) : null,
          cooking_time_tolerance: cookingTolerance,
          preferred_takeout_frequency: takeoutFreq,
          grocery_store: groceryStore || null,
          delivery_preference: deliveryPref,
          health_goal: healthGoal,
        });
      if (prefError) throw prefError;


      // Save custom meals
      if (savedMeals.length > 0) {
        const { error: mealsError } = await supabase
          .from("saved_meals")
          .insert(savedMeals.map((m) => ({
            household_id: household.id,
            meal_name: m.name,
            meal_description: m.description || null,
          })));
        if (mealsError) throw mealsError;
      }

      navigate("/planner");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };


  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return true;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="container max-w-2xl px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold">Family Food OS</span>
          </div>
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Step {step + 1} of {STEPS.length} · {STEPS[step].title}</p>
        </div>
      </div>

      <div className="flex-1 pt-28 pb-24 px-4">
        <div className="container max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-2">{STEPS[step].title}</h2>
              <p className="text-muted-foreground mb-8">{STEPS[step].desc}</p>

              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="hhName">Household name</Label>
                    <Input id="hhName" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} placeholder="The Johnsons" className="mt-1.5 max-w-sm" />
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
                          <button
                            key={band}
                            onClick={() => toggleInList(childAgeBands, band, setChildAgeBands)}
                            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                              childAgeBands.includes(band) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
                            }`}
                          >
                            {band}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <Label className="text-base font-medium">Cuisines your family likes</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {CUISINES.map((c) => (
                        <button
                          key={c}
                          onClick={() => toggleInList(cuisinesLiked, c, setCuisinesLiked)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            cuisinesLiked.includes(c) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Cuisines to avoid</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {CUISINES.map((c) => (
                        <button
                          key={c}
                          onClick={() => toggleInList(cuisinesDisliked, c, setCuisinesDisliked)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            cuisinesDisliked.includes(c) ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Dietary preferences</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {DIETARY.map((d) => (
                        <button
                          key={d}
                          onClick={() => toggleInList(dietary, d, setDietary)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            dietary.includes(d) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Allergies</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ALLERGIES.map((a) => (
                        <button
                          key={a}
                          onClick={() => toggleInList(allergies, a, setAllergies)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            allergies.includes(a) ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Foods to avoid</Label>
                    <p className="text-sm text-muted-foreground mt-1">Select presets or add your own</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {FOODS_TO_AVOID.map((f) => (
                        <button
                          key={f}
                          onClick={() => toggleInList(foodsToAvoid, f, setFoodsToAvoid)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            foodsToAvoid.includes(f) ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          🚫 {f}
                        </button>
                      ))}
                      {foodsToAvoid.filter(f => !FOODS_TO_AVOID.includes(f)).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFoodsToAvoid(foodsToAvoid.filter(x => x !== f))}
                          className="px-4 py-2 rounded-full text-sm border bg-destructive text-destructive-foreground border-destructive flex items-center gap-1.5"
                        >
                          🚫 {f} <X className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3 max-w-sm">
                      <Input
                        placeholder="Add custom food..."
                        maxLength={50}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !foodsToAvoid.includes(val)) {
                              setFoodsToAvoid([...foodsToAvoid, val]);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Health goal</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {HEALTH_GOALS.map((g) => (
                        <button
                          key={g}
                          onClick={() => setHealthGoal(g)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            healthGoal === g ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="max-w-sm">
                    <Label>Weekly grocery budget ($)</Label>
                    <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="150" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Cooking time tolerance</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {COOKING_TOLERANCES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setCookingTolerance(t.value)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            cookingTolerance === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-w-sm">
                    <Label>Preferred takeout nights per week</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setTakeoutFreq(Math.max(0, takeoutFreq - 1))}>−</Button>
                      <span className="text-lg font-medium w-8 text-center">{takeoutFreq}</span>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setTakeoutFreq(Math.min(7, takeoutFreq + 1))}>+</Button>
                    </div>
                  </div>
                  <div className="max-w-sm">
                    <Label>Preferred grocery store</Label>
                    <Input value={groceryStore} onChange={(e) => setGroceryStore(e.target.value)} placeholder="Whole Foods, Trader Joe's, etc." className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Grocery preference</Label>
                    <div className="flex gap-2 mt-3">
                      {[{ v: "in-store", l: "In-store shopping" }, { v: "delivery", l: "Delivery" }, { v: "pickup", l: "Curbside pickup" }].map((o) => (
                        <button
                          key={o.v}
                          onClick={() => setDeliveryPref(o.v)}
                          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                            deliveryPref === o.v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Add meals your family loves. These will be prioritized when generating your weekly plan. This is optional — you can always add more later.
                  </p>

                  {/* Add meal form */}
                  <div className="space-y-3 max-w-md">
                    <Input
                      value={newMealName}
                      onChange={(e) => setNewMealName(e.target.value)}
                      placeholder="Meal name, e.g. Grandma's Lasagna"
                      maxLength={200}
                      onKeyDown={(e) => { if (e.key === "Enter") addMeal(); }}
                    />
                    <Input
                      value={newMealDesc}
                      onChange={(e) => setNewMealDesc(e.target.value)}
                      placeholder="Brief description (optional)"
                      maxLength={500}
                      onKeyDown={(e) => { if (e.key === "Enter") addMeal(); }}
                    />
                    <Button variant="outline" onClick={addMeal} disabled={!newMealName.trim()} className="gap-2">
                      <Plus className="w-4 h-4" /> Add meal
                    </Button>
                  </div>

                  {/* Saved meals list */}
                  {savedMeals.length > 0 && (
                    <div className="space-y-2 mt-6">
                      <Label className="text-base font-medium">Your meals ({savedMeals.length})</Label>
                      {savedMeals.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{m.name}</p>
                            {m.description && <p className="text-xs text-muted-foreground truncate">{m.description}</p>}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeMeal(i)}>
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-4 px-4">
        <div className="container max-w-2xl flex justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? "Setting up..." : "Generate my weekly plan"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
