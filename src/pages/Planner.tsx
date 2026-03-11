import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, RefreshCw, ArrowRight } from "lucide-react";
import CheckInStreak from "@/components/planner/CheckInStreak";
import CheckInNudge from "@/components/planner/CheckInNudge";
import RealityScore from "@/components/planner/RealityScore";
import TimeSavedRecap from "@/components/planner/TimeSavedRecap";
import WeeklySummary from "@/components/planner/WeeklySummary";
import DayCard from "@/components/planner/DayCard";
import SwapMealDialog, { type MealSuggestion } from "@/components/planner/SwapMealDialog";
import DailyDinnerCard from "@/components/planner/DailyDinnerCard";
import WeeklyInsights from "@/components/planner/WeeklyInsights";
import { DAYS, type PlanDay, type WeeklyPlan, type FeedbackType, type MealMode } from "@/components/planner/types";

const Planner = () => {
  const { user } = useAuth();
  const { household, preferences, loading: hhLoading } = useHousehold();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [days, setDays] = useState<PlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dayFeedback, setDayFeedback] = useState<Record<string, FeedbackType>>({});
  const [swappingDay, setSwappingDay] = useState<string | null>(null);
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null);
  const [dragOverDayId, setDragOverDayId] = useState<string | null>(null);
  const [checkedInDays, setCheckedInDays] = useState<Set<string>>(new Set());
  const [savedMealNames, setSavedMealNames] = useState<Set<string>>(new Set());
  const [swapSuggestions, setSwapSuggestions] = useState<MealSuggestion[]>([]);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [swapDayContext, setSwapDayContext] = useState<PlanDay | null>(null);
  const [confirmingSwap, setConfirmingSwap] = useState(false);
  const [regeneratingSwap, setRegeneratingSwap] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Compute today's day_of_week (0=Mon)
  const jsDay = new Date().getDay();
  const todayDow = jsDay === 0 ? 6 : jsDay - 1;

  useEffect(() => {
    if (hhLoading) return;
    if (!household) {
      navigate("/onboarding");
      return;
    }
    loadPlan();
    loadSavedMealNames();
  }, [household, hhLoading]);

  const loadSavedMealNames = async () => {
    if (!household) return;
    const { data } = await supabase
      .from("saved_meals")
      .select("meal_name")
      .eq("household_id", household.id)
      .eq("include_in_plan", true);
    if (data) {
      setSavedMealNames(new Set(data.map((m: any) => m.meal_name.toLowerCase())));
    }
  };

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
        setDays(planDays as unknown as PlanDay[]);
        const dayIds = planDays.map((d: any) => d.id);

        // Load feedback and check-in status in parallel
        const [fbResult, ciResult] = await Promise.all([
          supabase
            .from("meal_feedback")
            .select("plan_day_id, feedback")
            .eq("household_id", household.id)
            .in("plan_day_id", dayIds),
          supabase
            .from("evening_checkins")
            .select("plan_day_id")
            .eq("household_id", household.id)
            .in("plan_day_id", dayIds),
        ]);

        if (fbResult.data) {
          const fbMap: Record<string, FeedbackType> = {};
          fbResult.data.forEach((f: any) => { if (f.plan_day_id) fbMap[f.plan_day_id] = f.feedback; });
          setDayFeedback(fbMap);
        }
        if (ciResult.data) {
          setCheckedInDays(new Set(ciResult.data.map((c: any) => c.plan_day_id)));
        }
      }
    }
    setLoading(false);
  };

  const submitFeedback = async (day: PlanDay, feedback: FeedbackType) => {
    if (!household || !day.meal_name) return;
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

      // Auto-save to saved meals when loved
      if (feedback === "loved" && day.meal_name) {
        const { data: existing } = await supabase
          .from("saved_meals")
          .select("id")
          .eq("household_id", household.id)
          .eq("meal_name", day.meal_name)
          .maybeSingle();

        if (!existing) {
          const { error: saveErr } = await supabase.from("saved_meals").insert({
            household_id: household.id,
            meal_name: day.meal_name,
            meal_description: day.meal_description || null,
            include_in_plan: true,
            frequency: "every_week",
          });
          if (!saveErr) {
            toast({ title: "⭐ Saved to Your Meals!", description: `"${day.meal_name}" will now appear in future plans.` });
            setSavedMealNames((prev) => new Set([...prev, day.meal_name!.toLowerCase()]));
          }
        }
      }
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
    setSwapDayContext(day);
    try {
      const { data, error } = await supabase.functions.invoke("swap-meal", {
        body: { plan_day_id: day.id, household_id: household.id },
      });
      if (error) throw error;
      if (data?.suggestions?.length) {
        setSwapSuggestions(data.suggestions);
        setSwapDialogOpen(true);
      } else {
        toast({ variant: "destructive", title: "No suggestions returned" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Swap failed", description: err.message });
    } finally {
      setSwappingDay(null);
    }
  };

  const confirmSwapMeal = async (meal: MealSuggestion) => {
    if (!household || !swapDayContext) return;
    setConfirmingSwap(true);
    try {
      const { data, error } = await supabase.functions.invoke("swap-meal", {
        body: {
          plan_day_id: swapDayContext.id,
          household_id: household.id,
          action: "confirm",
          selected_meal: meal,
        },
      });
      if (error) throw error;
      if (data?.meal) {
        setDays((prev) =>
          prev.map((d) =>
            d.id === swapDayContext.id
              ? { ...d, meal_name: data.meal.meal_name, meal_description: data.meal.meal_description, cuisine_type: data.meal.cuisine_type || null, prep_time_minutes: data.meal.prep_time_minutes || null, calories: data.meal.calories, protein_g: data.meal.protein_g, carbs_g: data.meal.carbs_g, fat_g: data.meal.fat_g, fiber_g: data.meal.fiber_g || null, ingredients: data.meal.ingredients || null, instructions: data.meal.instructions || null }
              : d
          )
        );
        setDayFeedback((prev) => { const n = { ...prev }; delete n[swapDayContext.id]; return n; });
        toast({ title: "Meal swapped!", description: `Now serving: ${data.meal.meal_name}. Grocery list updated.` });
        setSwapDialogOpen(false);
        setSwapSuggestions([]);
        setSwapDayContext(null);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Swap failed", description: err.message });
    } finally {
      setConfirmingSwap(false);
    }
  };

  const saveEdit = async (day: PlanDay, name: string, desc: string) => {
    const trimmedName = name.trim().slice(0, 200);
    const trimmedDesc = desc.trim().slice(0, 500);
    if (!trimmedName) {
      toast({ variant: "destructive", title: "Meal name required" });
      return;
    }
    const { error } = await supabase
      .from("plan_days")
      .update({ meal_name: trimmedName, meal_description: trimmedDesc || null })
      .eq("id", day.id);
    if (!error) {
      setDays((prev) => prev.map((d) => d.id === day.id ? { ...d, meal_name: trimmedName, meal_description: trimmedDesc || null } : d));
      setDayFeedback((prev) => { const n = { ...prev }; delete n[day.id]; return n; });
      toast({ title: "Meal updated!" });
    } else {
      toast({ variant: "destructive", title: "Save failed", description: error.message });
    }
  };

  const toggleLock = async (day: PlanDay) => {
    const { error } = await supabase.from("plan_days").update({ is_locked: !day.is_locked }).eq("id", day.id);
    if (!error) {
      setDays((prev) => prev.map((d) => (d.id === day.id ? { ...d, is_locked: !d.is_locked } : d)));
    }
  };

  const cycleMealMode = async (day: PlanDay) => {
    if (day.is_locked) return;
    const modes: MealMode[] = ["cook", "leftovers", "takeout", "dine_out", "emergency"];
    const nextIdx = (modes.indexOf(day.meal_mode) + 1) % modes.length;
    const newMode = modes[nextIdx];
    const { error } = await supabase.from("plan_days").update({ meal_mode: newMode }).eq("id", day.id);
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
    if (draggedDayId && draggedDayId !== dayId) setDragOverDayId(dayId);
  };

  const handleDragLeave = () => setDragOverDayId(null);

  const handleDrop = async (targetDayId: string) => {
    setDragOverDayId(null);
    if (!draggedDayId || draggedDayId === targetDayId) { setDraggedDayId(null); return; }
    const source = days.find((d) => d.id === draggedDayId);
    const target = days.find((d) => d.id === targetDayId);
    if (!source || !target || target.is_locked) { setDraggedDayId(null); return; }

    const mealFields = ["meal_name", "meal_description", "meal_mode", "cuisine_type", "prep_time_minutes", "calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "notes", "takeout_budget"] as const;
    const sourceData: any = {};
    const targetData: any = {};
    mealFields.forEach((f) => { sourceData[f] = (source as any)[f]; targetData[f] = (target as any)[f]; });

    setDays((prev) => prev.map((d) => {
      if (d.id === draggedDayId) return { ...d, ...targetData };
      if (d.id === targetDayId) return { ...d, ...sourceData };
      return d;
    }));

    const [r1, r2] = await Promise.all([
      supabase.from("plan_days").update(targetData).eq("id", draggedDayId),
      supabase.from("plan_days").update(sourceData).eq("id", targetDayId),
    ]);

    if (r1.error || r2.error) {
      toast({ variant: "destructive", title: "Swap failed", description: "Could not save the reorder." });
      setDays((prev) => prev.map((d) => {
        if (d.id === draggedDayId) return { ...d, ...sourceData };
        if (d.id === targetDayId) return { ...d, ...targetData };
        return d;
      }));
    } else {
      setDayFeedback((prev) => { const n = { ...prev }; delete n[draggedDayId!]; delete n[targetDayId]; return n; });
      toast({ title: "Meals swapped!", description: `${DAYS[source.day_of_week]} ↔ ${DAYS[target.day_of_week]}` });
    }
    setDraggedDayId(null);
  };

  const handleDragEnd = () => { setDraggedDayId(null); setDragOverDayId(null); };

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

        {/* Daily Dinner Card - top */}
        {plan && household && (
          <div className="mb-4">
            <DailyDinnerCard
              todayDay={days.find((d) => d.day_of_week === todayDow) || null}
              householdId={household.id}
              checkedIn={(() => {
                const td = days.find((d) => d.day_of_week === todayDow);
                return td ? checkedInDays.has(td.id) : false;
              })()}
              onCheckedIn={(dayId) => setCheckedInDays((prev) => new Set([...prev, dayId]))}
              onFeedback={submitFeedback}
            />
          </div>
        )}

        {plan && household && <CheckInNudge householdId={household.id} planId={plan.id} />}

        {household && (
          <div className="mb-4">
            <CheckInStreak householdId={household.id} checkedInCount={checkedInDays.size} />
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

        {plan && <RealityScore plan={plan} days={days} />}

        <WeeklySummary days={days} />

        {household && <WeeklyInsights householdId={household.id} />}

        {/* Day cards */}
        {days.length > 0 && (
          <div className="space-y-3">
            {days.map((day, i) => (
              <DayCard
                key={day.id}
                day={day}
                index={i}
                feedback={dayFeedback[day.id]}
                isSwapping={swappingDay === day.id}
                isDragged={draggedDayId === day.id}
                isDragOver={dragOverDayId === day.id}
                isToday={day.day_of_week === todayDow}
                householdId={household?.id}
                householdSize={household ? household.num_adults + household.num_children : undefined}
                checkedIn={checkedInDays.has(day.id)}
                isSavedMeal={!!day.meal_name && savedMealNames.has(day.meal_name.toLowerCase())}
                onSwapMeal={swapMeal}
                onToggleLock={toggleLock}
                onCycleMealMode={cycleMealMode}
                onSubmitFeedback={submitFeedback}
                onSaveEdit={saveEdit}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onCheckedIn={(dayId) => setCheckedInDays((prev) => new Set([...prev, dayId]))}
              />
            ))}
          </div>
        )}

        {/* Last Week Recap - bottom */}
        {plan && household && (
          <div className="mt-6">
            <TimeSavedRecap
              plan={plan}
              days={days}
              householdId={household.id}
              householdName={household.name}
              onGeneratePlan={generatePlan}
              onViewDetails={() => navigate("/history")}
              generating={generating}
            />
          </div>
        )}
                onToggleLock={toggleLock}
                onCycleMealMode={cycleMealMode}
                onSubmitFeedback={submitFeedback}
                onSaveEdit={saveEdit}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onCheckedIn={(dayId) => setCheckedInDays((prev) => new Set([...prev, dayId]))}
              />
            ))}
          </div>
        )}
      </div>

      <SwapMealDialog
        open={swapDialogOpen}
        onOpenChange={(o) => { setSwapDialogOpen(o); if (!o) { setSwapSuggestions([]); setSwapDayContext(null); } }}
        suggestions={swapSuggestions}
        dayName={swapDayContext ? DAYS[swapDayContext.day_of_week] : ""}
        currentMealName={swapDayContext?.meal_name || undefined}
        onSelect={confirmSwapMeal}
        onRegenerate={async () => {
          if (!household || !swapDayContext) return;
          setRegeneratingSwap(true);
          try {
            const { data, error } = await supabase.functions.invoke("swap-meal", {
              body: { plan_day_id: swapDayContext.id, household_id: household.id },
            });
            if (error) throw error;
            if (data?.suggestions?.length) setSwapSuggestions(data.suggestions);
          } catch (err: any) {
            toast({ variant: "destructive", title: "Failed to load suggestions", description: err.message });
          } finally {
            setRegeneratingSwap(false);
          }
        }}
        confirming={confirmingSwap}
        regenerating={regeneratingSwap}
      />
    </AppLayout>
  );
};

export default Planner;
