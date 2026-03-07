import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ChefHat, UtensilsCrossed, Truck, Store, Zap, Lock, Unlock, RefreshCw,
  ArrowRight, AlertTriangle, TrendingUp, Flame
} from "lucide-react";
import { motion } from "framer-motion";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type MealMode = "cook" | "leftovers" | "takeout" | "dine_out" | "emergency";

const MODE_CONFIG: Record<MealMode, { label: string; icon: typeof ChefHat; color: string }> = {
  cook: { label: "Cook", icon: ChefHat, color: "bg-primary text-primary-foreground" },
  leftovers: { label: "Leftovers", icon: RefreshCw, color: "bg-secondary text-secondary-foreground" },
  takeout: { label: "Takeout", icon: Truck, color: "bg-accent text-accent-foreground" },
  dine_out: { label: "Dine Out", icon: Store, color: "bg-warm text-primary-foreground" },
  emergency: { label: "Emergency", icon: Zap, color: "bg-destructive text-destructive-foreground" },
};

type PlanDay = {
  id: string;
  day_of_week: number;
  meal_mode: MealMode;
  meal_name: string | null;
  meal_description: string | null;
  cuisine_type: string | null;
  prep_time_minutes: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  is_locked: boolean;
  notes: string | null;
  takeout_budget: number | null;
};

type WeeklyPlan = {
  id: string;
  week_start: string;
  reality_score: number | null;
  reality_message: string | null;
};

const Planner = () => {
  const { user } = useAuth();
  const { household, preferences, loading: hhLoading } = useHousehold();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [days, setDays] = useState<PlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (hhLoading) return;
    if (!household) {
      navigate("/onboarding");
      return;
    }
    loadPlan();
  }, [household, hhLoading]);

  const loadPlan = async () => {
    if (!household) return;
    const { data: plans } = await supabase
      .from("weekly_plans")
      .select("*")
      .eq("household_id", household.id)
      .order("week_start", { ascending: false })
      .limit(1);

    if (plans && plans.length > 0) {
      const p = plans[0] as any;
      setPlan(p);
      const { data: planDays } = await supabase
        .from("plan_days")
        .select("*")
        .eq("plan_id", p.id)
        .order("day_of_week");
      if (planDays) setDays(planDays as PlanDay[]);
    }
    setLoading(false);
  };

  const generatePlan = async () => {
    if (!household) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { household_id: household.id },
      });
      if (error) throw error;
      await loadPlan();
      toast({ title: "Weekly plan generated!", description: "Your personalized meal plan is ready." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Generation failed", description: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const toggleLock = async (day: PlanDay) => {
    const { error } = await supabase
      .from("plan_days")
      .update({ is_locked: !day.is_locked })
      .eq("id", day.id);
    if (!error) {
      setDays((prev) => prev.map((d) => (d.id === day.id ? { ...d, is_locked: !d.is_locked } : d)));
    }
  };

  const cycleMealMode = async (day: PlanDay) => {
    if (day.is_locked) return;
    const modes: MealMode[] = ["cook", "leftovers", "takeout", "dine_out", "emergency"];
    const nextIdx = (modes.indexOf(day.meal_mode) + 1) % modes.length;
    const newMode = modes[nextIdx];
    const { error } = await supabase
      .from("plan_days")
      .update({ meal_mode: newMode })
      .eq("id", day.id);
    if (!error) {
      setDays((prev) => prev.map((d) => (d.id === day.id ? { ...d, meal_mode: newMode } : d)));
    }
  };

  const totalCals = days.reduce((s, d) => s + (d.calories || 0), 0);
  const totalProtein = days.reduce((s, d) => s + Number(d.protein_g || 0), 0);
  const totalCarbs = days.reduce((s, d) => s + Number(d.carbs_g || 0), 0);
  const totalFat = days.reduce((s, d) => s + Number(d.fat_g || 0), 0);
  const cookDays = days.filter((d) => d.meal_mode === "cook").length;
  const takeoutDays = days.filter((d) => d.meal_mode === "takeout" || d.meal_mode === "dine_out").length;

  if (loading || hhLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your plan...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
              {household?.name}'s Week
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {plan ? `Week of ${new Date(plan.week_start + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : "No plan yet"}
            </p>
          </div>
          <Button onClick={generatePlan} disabled={generating} className="gap-2">
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                {plan ? "Regenerate Plan" : "Generate Plan"}
              </>
            )}
          </Button>
        </div>

        {/* Reality Score */}
        {plan && plan.reality_score !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`mb-6 ${(plan.reality_score || 0) < 60 ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-sage-light"}`}>
              <CardContent className="py-4 flex items-start gap-3">
                {(plan.reality_score || 0) < 60 ? (
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium text-sm text-foreground">
                    Reality Score: {plan.reality_score}/100
                  </p>
                  {plan.reality_message && (
                    <p className="text-sm text-muted-foreground mt-0.5">{plan.reality_message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Weekly summary */}
        {days.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <Flame className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Weekly Calories</p>
                  <p className="font-semibold text-foreground">{totalCals.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="font-semibold text-foreground">{Math.round(totalProtein)}g</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <ChefHat className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Cook Nights</p>
                  <p className="font-semibold text-foreground">{cookDays}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <Truck className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Takeout/Out</p>
                  <p className="font-semibold text-foreground">{takeoutDays}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty state */}
        {!plan && (
          <Card className="py-16 text-center">
            <CardContent>
              <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-serif font-semibold mb-2">No plan yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Click "Generate Plan" to create your personalized weekly meal plan based on your household preferences.
              </p>
              <Button onClick={generatePlan} disabled={generating} className="gap-2">
                <ArrowRight className="w-4 h-4" /> Generate your first plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Day cards */}
        {days.length > 0 && (
          <div className="space-y-3">
            {days.map((day, i) => {
              const mode = MODE_CONFIG[day.meal_mode];
              const Icon = mode.icon;
              return (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`overflow-hidden ${day.is_locked ? "ring-1 ring-primary/20" : ""}`}>
                    <div className="flex flex-col sm:flex-row">
                      {/* Day label + mode */}
                      <div className="flex items-center gap-3 p-4 sm:w-48 sm:border-r border-border">
                        <div className="text-center sm:text-left">
                          <p className="font-serif font-semibold text-foreground">{DAYS[day.day_of_week]}</p>
                          <button
                            onClick={() => cycleMealMode(day)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 transition-colors ${mode.color}`}
                            disabled={day.is_locked}
                          >
                            <Icon className="w-3 h-3" />
                            {mode.label}
                          </button>
                        </div>
                      </div>

                      {/* Meal info */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {day.meal_name || "No meal assigned"}
                            </h3>
                            {day.meal_description && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{day.meal_description}</p>
                            )}
                            {day.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">{day.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => toggleLock(day)}
                          >
                            {day.is_locked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                        </div>

                        {/* Nutrition badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {day.calories && (
                            <Badge variant="secondary" className="text-xs">{day.calories} cal</Badge>
                          )}
                          {day.protein_g && (
                            <Badge variant="secondary" className="text-xs">{Number(day.protein_g)}g protein</Badge>
                          )}
                          {day.carbs_g && (
                            <Badge variant="secondary" className="text-xs">{Number(day.carbs_g)}g carbs</Badge>
                          )}
                          {day.fat_g && (
                            <Badge variant="secondary" className="text-xs">{Number(day.fat_g)}g fat</Badge>
                          )}
                          {day.prep_time_minutes && day.meal_mode === "cook" && (
                            <Badge variant="outline" className="text-xs">{day.prep_time_minutes} min</Badge>
                          )}
                          {day.cuisine_type && (
                            <Badge variant="outline" className="text-xs">{day.cuisine_type}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Planner;
