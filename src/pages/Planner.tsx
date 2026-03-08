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
  ArrowRight, AlertTriangle, TrendingUp, Flame, Heart, ThumbsUp, Baby, Wrench, RotateCcw, Star, Shuffle, Pencil, Check, X, GripVertical
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type FeedbackType = "loved" | "okay" | "kids_refused" | "too_hard" | "good_leftovers" | "reorder_worthy";

const FEEDBACK_OPTIONS: { value: FeedbackType; label: string; icon: typeof Heart; emoji: string }[] = [
  { value: "loved", label: "Loved it", icon: Heart, emoji: "❤️" },
  { value: "okay", label: "Okay", icon: ThumbsUp, emoji: "👍" },
  { value: "kids_refused", label: "Kids refused", icon: Baby, emoji: "👶" },
  { value: "too_hard", label: "Too much work", icon: Wrench, emoji: "😮‍💨" },
  { value: "good_leftovers", label: "Good leftovers", icon: RotateCcw, emoji: "♻️" },
  { value: "reorder_worthy", label: "Reorder-worthy", icon: Star, emoji: "⭐" },
];

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
  const [dayFeedback, setDayFeedback] = useState<Record<string, FeedbackType>>({});
  const [swappingDay, setSwappingDay] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null);
  const [dragOverDayId, setDragOverDayId] = useState<string | null>(null);
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
      if (planDays) {
        setDays(planDays as PlanDay[]);
        // Load existing feedback for these days
        const { data: fb } = await supabase
          .from("meal_feedback")
          .select("plan_day_id, feedback")
          .eq("household_id", household.id)
          .in("plan_day_id", planDays.map((d: any) => d.id));
        if (fb) {
          const fbMap: Record<string, FeedbackType> = {};
          fb.forEach((f: any) => { if (f.plan_day_id) fbMap[f.plan_day_id] = f.feedback; });
          setDayFeedback(fbMap);
        }
      }
    }
    setLoading(false);
  };

  const submitFeedback = async (day: PlanDay, feedback: FeedbackType) => {
    if (!household || !day.meal_name) return;
    // Optimistic update
    setDayFeedback((prev) => ({ ...prev, [day.id]: feedback }));
    const { error } = await supabase.from("meal_feedback").insert({
      household_id: household.id,
      plan_day_id: day.id,
      meal_name: day.meal_name,
      feedback,
    });
    if (error) {
      toast({ variant: "destructive", title: "Feedback failed", description: error.message });
      setDayFeedback((prev) => { const n = { ...prev }; delete n[day.id]; return n; });
    } else {
      toast({ title: "Feedback saved!", description: `Marked "${day.meal_name}" as ${feedback.replace("_", " ")}` });
    }
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

  const swapMeal = async (day: PlanDay) => {
    if (!household || day.is_locked) return;
    setSwappingDay(day.id);
    try {
      const { data, error } = await supabase.functions.invoke("swap-meal", {
        body: { plan_day_id: day.id, household_id: household.id },
      });
      if (error) throw error;
      if (data?.meal) {
        setDays((prev) =>
          prev.map((d) =>
            d.id === day.id
              ? {
                  ...d,
                  meal_name: data.meal.meal_name,
                  meal_description: data.meal.meal_description,
                  cuisine_type: data.meal.cuisine_type || null,
                  prep_time_minutes: data.meal.prep_time_minutes || null,
                  calories: data.meal.calories,
                  protein_g: data.meal.protein_g,
                  carbs_g: data.meal.carbs_g,
                  fat_g: data.meal.fat_g,
                  fiber_g: data.meal.fiber_g || null,
                }
              : d
          )
        );
        // Clear feedback for swapped meal
        setDayFeedback((prev) => { const n = { ...prev }; delete n[day.id]; return n; });
        toast({ title: "Meal swapped!", description: `Now serving: ${data.meal.meal_name}` });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Swap failed", description: err.message });
    } finally {
      setSwappingDay(null);
    }
  };
  const startEditing = (day: PlanDay) => {
    if (day.is_locked) return;
    setEditingDay(day.id);
    setEditName(day.meal_name || "");
    setEditDesc(day.meal_description || "");
  };

  const cancelEditing = () => {
    setEditingDay(null);
    setEditName("");
    setEditDesc("");
  };

  const saveEdit = async (day: PlanDay) => {
    const trimmedName = editName.trim().slice(0, 200);
    const trimmedDesc = editDesc.trim().slice(0, 500);
    if (!trimmedName) {
      toast({ variant: "destructive", title: "Meal name required" });
      return;
    }
    const { error } = await supabase
      .from("plan_days")
      .update({ meal_name: trimmedName, meal_description: trimmedDesc || null })
      .eq("id", day.id);
    if (!error) {
      setDays((prev) =>
        prev.map((d) => d.id === day.id ? { ...d, meal_name: trimmedName, meal_description: trimmedDesc || null } : d)
      );
      setDayFeedback((prev) => { const n = { ...prev }; delete n[day.id]; return n; });
      toast({ title: "Meal updated!" });
    } else {
      toast({ variant: "destructive", title: "Save failed", description: error.message });
    }
    cancelEditing();
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

  const handleDragStart = (dayId: string) => {
    const day = days.find((d) => d.id === dayId);
    if (day?.is_locked) return;
    setDraggedDayId(dayId);
  };

  const handleDragOver = (e: React.DragEvent, dayId: string) => {
    e.preventDefault();
    if (draggedDayId && draggedDayId !== dayId) {
      setDragOverDayId(dayId);
    }
  };

  const handleDragLeave = () => {
    setDragOverDayId(null);
  };

  const handleDrop = async (targetDayId: string) => {
    setDragOverDayId(null);
    if (!draggedDayId || draggedDayId === targetDayId) {
      setDraggedDayId(null);
      return;
    }
    const source = days.find((d) => d.id === draggedDayId);
    const target = days.find((d) => d.id === targetDayId);
    if (!source || !target || target.is_locked) {
      setDraggedDayId(null);
      return;
    }

    const mealFields = ["meal_name", "meal_description", "meal_mode", "cuisine_type", "prep_time_minutes", "calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "notes", "takeout_budget"] as const;
    const sourceData: any = {};
    const targetData: any = {};
    mealFields.forEach((f) => { sourceData[f] = (source as any)[f]; targetData[f] = (target as any)[f]; });

    setDays((prev) =>
      prev.map((d) => {
        if (d.id === draggedDayId) return { ...d, ...targetData };
        if (d.id === targetDayId) return { ...d, ...sourceData };
        return d;
      })
    );

    const [r1, r2] = await Promise.all([
      supabase.from("plan_days").update(targetData).eq("id", draggedDayId),
      supabase.from("plan_days").update(sourceData).eq("id", targetDayId),
    ]);

    if (r1.error || r2.error) {
      toast({ variant: "destructive", title: "Swap failed", description: "Could not save the reorder." });
      setDays((prev) =>
        prev.map((d) => {
          if (d.id === draggedDayId) return { ...d, ...sourceData };
          if (d.id === targetDayId) return { ...d, ...targetData };
          return d;
        })
      );
    } else {
      setDayFeedback((prev) => { const n = { ...prev }; delete n[draggedDayId!]; delete n[targetDayId]; return n; });
      toast({ title: "Meals swapped!", description: `${DAYS[source.day_of_week]} ↔ ${DAYS[target.day_of_week]}` });
    }
    setDraggedDayId(null);
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
                  draggable={!day.is_locked}
                  onDragStart={() => handleDragStart(day.id)}
                  onDragOver={(e) => handleDragOver(e, day.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(day.id)}
                  onDragEnd={() => { setDraggedDayId(null); setDragOverDayId(null); }}
                >
                  <Card className={`overflow-hidden transition-all ${day.is_locked ? "ring-1 ring-primary/20" : ""} ${draggedDayId === day.id ? "opacity-50 scale-[0.98]" : ""} ${dragOverDayId === day.id ? "ring-2 ring-primary shadow-lg" : ""}`}>
                    <div className="flex flex-col sm:flex-row">
                      {/* Day label + mode */}
                      <div className="flex items-center gap-3 p-4 sm:w-48 sm:border-r border-border">
                        {!day.is_locked && (
                          <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0 hidden sm:block" />
                        )}
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
                            {editingDay === day.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Meal name"
                                  maxLength={200}
                                  className="h-8 text-sm"
                                  autoFocus
                                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(day); if (e.key === "Escape") cancelEditing(); }}
                                />
                                <Textarea
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  placeholder="Description (optional)"
                                  maxLength={500}
                                  className="text-sm min-h-[60px] resize-none"
                                  onKeyDown={(e) => { if (e.key === "Escape") cancelEditing(); }}
                                />
                              </div>
                            ) : (
                              <>
                                <h3 className="font-medium text-foreground truncate">
                                  {day.meal_name || "No meal assigned"}
                                </h3>
                                {day.meal_description && (
                                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{day.meal_description}</p>
                                )}
                                {day.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">{day.notes}</p>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {editingDay === day.id ? (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveEdit(day)} title="Save">
                                  <Check className="w-4 h-4 text-primary" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEditing} title="Cancel">
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => startEditing(day)}
                                  disabled={day.is_locked}
                                  title="Edit meal"
                                >
                                  <Pencil className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => swapMeal(day)}
                                  disabled={day.is_locked || swappingDay === day.id}
                                  title="Swap meal"
                                >
                                  {swappingDay === day.id ? (
                                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Shuffle className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleLock(day)}
                                >
                                  {day.is_locked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                                </Button>
                              </>
                            )}
                          </div>
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

                        {/* Feedback buttons */}
                        {day.meal_name && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                            {dayFeedback[day.id] ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Rated:</span>
                                <Badge variant="secondary" className="text-xs gap-1">
                                  {FEEDBACK_OPTIONS.find((f) => f.value === dayFeedback[day.id])?.emoji}
                                  {FEEDBACK_OPTIONS.find((f) => f.value === dayFeedback[day.id])?.label}
                                </Badge>
                              </div>
                            ) : (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5 h-7 px-2">
                                    <Heart className="w-3 h-3" /> Rate this meal
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                  <div className="grid grid-cols-2 gap-1">
                                    {FEEDBACK_OPTIONS.map((opt) => (
                                      <button
                                        key={opt.value}
                                        onClick={() => submitFeedback(day, opt.value)}
                                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-muted transition-colors text-left"
                                      >
                                        <span>{opt.emoji}</span>
                                        <span className="text-foreground">{opt.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        )}
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
