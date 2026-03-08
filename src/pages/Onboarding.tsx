import { useState } from "react";
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
const AGE_BANDS = ["0–1 (infant)", "1–3 (toddler)", "3–5 (preschool)", "5–10 (school age)", "10–13 (preteen)", "13–18 (teenager)"];
const HEALTH_GOALS = ["Balanced family eating", "Lose weight", "Gain weight", "Higher protein", "Maintain"];
const COOKING_TOLERANCES = [
  { value: "minimal", label: "Minimal (15 min max)" },
  { value: "low", label: "Low (30 min max)" },
  { value: "medium", label: "Medium (45 min)" },
  { value: "high", label: "High (60+ min, I love cooking)" },
];
const CONTEXT_TOGGLES = [
  { key: "newborn_in_house", label: "Newborn in house", emoji: "👶" },
  { key: "guests_visiting", label: "Guests visiting", emoji: "🏠" },
  { key: "sports_week", label: "Sports week", emoji: "⚽" },
  { key: "one_parent_traveling", label: "One parent traveling", emoji: "✈️" },
  { key: "budget_week", label: "Budget-tight week", emoji: "💰" },
  { key: "low_cleanup_week", label: "Low-cleanup week", emoji: "🧹" },
  { key: "sick_week", label: "Sick week", emoji: "🤒" },
  { key: "high_protein_week", label: "High-protein week", emoji: "💪" },
  { key: "chaotic_week", label: "Chaotic week", emoji: "🌀" },
];

const STEPS = [
  { title: "Your household", desc: "Tell us about your family" },
  { title: "Food preferences", desc: "What does your family like?" },
  { title: "Logistics", desc: "Budget, time, and grocery habits" },
  { title: "This week's context", desc: "What's happening this week?" },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
  const [healthGoal, setHealthGoal] = useState("Balanced family eating");

  // Step 3 - Logistics
  const [budget, setBudget] = useState("");
  const [cookingTolerance, setCookingTolerance] = useState("medium");
  const [takeoutFreq, setTakeoutFreq] = useState(1);
  const [groceryStore, setGroceryStore] = useState("");
  const [deliveryPref, setDeliveryPref] = useState("in-store");

  // Step 4 - Weekly context
  const [contexts, setContexts] = useState<Record<string, boolean>>({});

  const toggleInList = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
          weekly_grocery_budget: budget ? parseFloat(budget) : null,
          cooking_time_tolerance: cookingTolerance,
          preferred_takeout_frequency: takeoutFreq,
          grocery_store: groceryStore || null,
          delivery_preference: deliveryPref,
          health_goal: healthGoal,
        });
      if (prefError) throw prefError;

      // Create weekly context
      const monday = getNextMonday();
      const { error: ctxError } = await supabase
        .from("weekly_contexts")
        .insert({
          household_id: household.id,
          week_start: monday,
          ...Object.fromEntries(CONTEXT_TOGGLES.map((t) => [t.key, contexts[t.key] || false])),
        });
      if (ctxError) throw ctxError;

      navigate("/planner");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getNextMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
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
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-6">Select anything that applies to this week. This helps us generate a more realistic plan.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {CONTEXT_TOGGLES.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setContexts((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                          contexts[t.key] ? "bg-sage-light border-primary" : "bg-background border-border hover:bg-muted"
                        }`}
                      >
                        <span className="text-2xl">{t.emoji}</span>
                        <span className="text-sm font-medium text-foreground">{t.label}</span>
                        {contexts[t.key] && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </button>
                    ))}
                  </div>
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
