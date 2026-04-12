import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHousehold } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Check, ArrowRight, Sparkles } from "lucide-react";
import { DAYS, type PlanDay } from "@/components/planner/types";

// ── Tags ──

const ALL_TAGS = [
  { value: "cooked_it", label: "Cooked it", emoji: "🍳" },
  { value: "ordered_out", label: "Ordered out", emoji: "📦" },
  { value: "everyone_liked", label: "Everyone liked it", emoji: "😋" },
  { value: "kids_refused", label: "Kids refused", emoji: "👶" },
  { value: "too_much_work", label: "Too much work", emoji: "😮‍💨" },
  { value: "easy_win", label: "Easy win", emoji: "✅" },
  { value: "great_leftovers", label: "Great leftovers", emoji: "♻️" },
  { value: "not_again", label: "Not again", emoji: "🚫" },
];

// ── Effort levels ──

const EFFORT_OPTIONS = [
  { value: "easy", label: "Easy night", emoji: "😌", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  { value: "fine", label: "It was fine", emoji: "👍", color: "border-amber-300 bg-amber-50 text-amber-700" },
  { value: "too_much", label: "Too much", emoji: "😩", color: "border-red-300 bg-red-50 text-red-700" },
];

// ── Smart tag suggestions based on meal context ──

function getSuggestedTags(meal: PlanDay): string[] {
  const suggestions: string[] = [];
  const mode = meal.meal_mode;
  const prepTime = meal.prep_time_minutes ?? 0;

  if (mode === "cook") {
    suggestions.push("cooked_it");
    if (prepTime >= 30) suggestions.push("too_much_work");
    else suggestions.push("easy_win");
  }
  if (mode === "takeout" || mode === "dine_out") {
    suggestions.push("ordered_out");
    suggestions.push("easy_win");
  }
  if (mode === "leftovers") {
    suggestions.push("great_leftovers");
    suggestions.push("easy_win");
  }
  if (mode === "emergency") {
    suggestions.push("ordered_out");
  }

  // Always suggest sentiment tags
  if (!suggestions.includes("everyone_liked")) suggestions.push("everyone_liked");

  // Deduplicate and cap at 4
  return [...new Set(suggestions)].slice(0, 4);
}

// ── Smart line generation ──

function generateSmartLine(tags: string[], effortLevel: string | null, meal: PlanDay): string {
  const dayName = DAYS[meal.day_of_week];
  const mealName = meal.meal_name || "tonight's meal";

  if (tags.includes("kids_refused") && tags.includes("too_much_work"))
    return `Got it. We'll make ${dayName}s easier and more kid-friendly.`;
  if (tags.includes("kids_refused"))
    return `Noted. We'll try something the kids might go for on ${dayName}s.`;
  if (tags.includes("easy_win") && tags.includes("everyone_liked"))
    return `${mealName} is a keeper. We'll plan around it.`;
  if (tags.includes("everyone_liked"))
    return `"${mealName}" works for your family. Expect it back.`;
  if (tags.includes("great_leftovers"))
    return `Nice. We'll plan tomorrow around those leftovers.`;
  if (tags.includes("not_again"))
    return `Won't suggest "${mealName}" again. Moving on.`;
  if (tags.includes("ordered_out") && tags.includes("easy_win"))
    return `${dayName} takeout night seems to work. We'll plan around it.`;
  if (tags.includes("ordered_out"))
    return `No judgment. We'll keep ${dayName}s flexible.`;
  if (tags.includes("too_much_work"))
    return `We'll suggest fewer cleanup-heavy meals next week.`;
  if (tags.includes("easy_win"))
    return `Easy wins build momentum. More of those coming.`;
  if (effortLevel === "too_much")
    return `Looks like ${dayName}s should stay low-effort. On it.`;
  if (effortLevel === "easy")
    return `Smooth night. We'll keep the rhythm going.`;
  if (tags.includes("cooked_it"))
    return `Another home-cooked night in the books. 💪`;
  return `Got it. Next week gets a little smarter.`;
}

// ── Component ──

const CheckIn = () => {
  const { household, loading: hhLoading } = useHousehold();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [todayMeal, setTodayMeal] = useState<PlanDay | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [effort, setEffort] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [smartLine, setSmartLine] = useState("");

  useEffect(() => {
    if (hhLoading || !household) return;
    loadTodayMeal();
  }, [household, hhLoading]);

  const loadTodayMeal = async () => {
    if (!household) return;
    const { data: plans } = await supabase
      .from("weekly_plans")
      .select("*")
      .eq("household_id", household.id)
      .order("week_start", { ascending: false })
      .limit(1);

    if (!plans || plans.length === 0) { setLoading(false); return; }

    const jsDay = new Date().getDay();
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    const { data: dayData } = await supabase
      .from("plan_days")
      .select("*")
      .eq("plan_id", plans[0].id)
      .eq("day_of_week", dayOfWeek)
      .limit(1);

    if (dayData && dayData.length > 0) {
      const day = dayData[0] as unknown as PlanDay;
      setTodayMeal(day);

      const { data: existing } = await supabase
        .from("evening_checkins")
        .select("id")
        .eq("plan_day_id", day.id)
        .limit(1);

      if (existing && existing.length > 0) setAlreadyCheckedIn(true);
    }
    setLoading(false);
  };

  // Smart suggestions
  const suggestedTagValues = useMemo(
    () => (todayMeal ? getSuggestedTags(todayMeal) : []),
    [todayMeal],
  );
  const suggestedTags = ALL_TAGS.filter((t) => suggestedTagValues.includes(t.value));
  const otherTags = ALL_TAGS.filter((t) => !suggestedTagValues.includes(t.value));

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async (overrideEffort?: string | null) => {
    if (!household || !todayMeal) return;
    const finalEffort = overrideEffort !== undefined ? overrideEffort : effort;

    // Allow submit with just effort or just tags
    if (!finalEffort && selectedTags.length === 0) return;

    setSaving(true);
    const { error } = await supabase.from("evening_checkins").insert({
      plan_day_id: todayMeal.id,
      household_id: household.id,
      tags: selectedTags,
      effort_level: finalEffort,
    });

    if (error) {
      toast({ variant: "destructive", title: "Check-in failed", description: error.message });
      setSaving(false);
      return;
    }

    setSmartLine(generateSmartLine(selectedTags, finalEffort, todayMeal));
    setDone(true);
    setSaving(false);
  };

  const handleEffortTap = (value: string) => {
    const newEffort = effort === value ? null : value;
    setEffort(newEffort);
  };

  if (loading || hhLoading) {
    return (
      <MobileLayout title="Check-in"><AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout></MobileLayout>
    );
  }

  return (
    <MobileLayout title="Check-in"><AppLayout>
      <div className="max-w-md mx-auto py-4">
        <AnimatePresence mode="wait">
          {/* No meal */}
          {!todayMeal && (
            <motion.div key="no-meal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="py-16 text-center">
                <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-serif font-semibold mb-2">No meal planned for today</h2>
                <p className="text-muted-foreground mb-6">Generate a weekly plan first.</p>
                <Button onClick={() => navigate("/planner")} className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Go to Planner
                </Button>
              </div>
            </motion.div>
          )}

          {/* Already done */}
          {todayMeal && alreadyCheckedIn && (
            <motion.div key="already" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="py-16 text-center">
                <Check className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-serif font-semibold mb-2">Already checked in!</h2>
                <p className="text-muted-foreground mb-6">
                  You've logged how <span className="font-medium text-foreground">{todayMeal.meal_name}</span> went.
                </p>
                <Button variant="outline" onClick={() => navigate("/planner")} className="gap-2">
                  Back to Planner
                </Button>
              </div>
            </motion.div>
          )}

          {/* Single-screen check-in */}
          {todayMeal && !alreadyCheckedIn && !done && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center">
                <p className="text-xs tracking-widest text-muted-foreground/60 uppercase mb-2">
                  {DAYS[todayMeal.day_of_week]} evening
                </p>
                <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-1">
                  How did tonight go?
                </h1>
                {todayMeal.meal_name && (
                  <p className="text-muted-foreground text-sm">
                    {todayMeal.meal_name}
                  </p>
                )}
              </div>

              {/* ── 1. EFFORT (one-tap, primary action) ── */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Effort level
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {EFFORT_OPTIONS.map((opt, i) => {
                    const isSelected = effort === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEffortTap(opt.value)}
                        className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? opt.color + " shadow-sm"
                            : "border-border bg-card hover:border-muted-foreground/30"
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className={`text-xs font-medium ${isSelected ? "" : "text-muted-foreground"}`}>
                          {opt.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* ── 2. SMART SUGGESTED TAGS ── */}
              {suggestedTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Quick tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.value);
                      return (
                        <motion.button
                          key={tag.value}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleTag(tag.value)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-primary/15 text-primary border border-primary/30"
                              : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
                          }`}
                        >
                          <span>{tag.emoji}</span>
                          {tag.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── 3. OTHER TAGS (collapsed feel, lower visual weight) ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-xs font-medium text-muted-foreground/50 mb-3 uppercase tracking-wider">
                  More
                </p>
                <div className="flex flex-wrap gap-2">
                  {otherTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.value);
                    return (
                      <motion.button
                        key={tag.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTag(tag.value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-muted/30 text-muted-foreground/70 border border-transparent hover:bg-muted/50"
                        }`}
                      >
                        <span>{tag.emoji}</span>
                        {tag.label}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* ── SUBMIT ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Button
                  onClick={() => handleSubmit()}
                  disabled={saving || (!effort && selectedTags.length === 0)}
                  className="w-full gap-2 rounded-xl py-6 text-base"
                  size="lg"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Log it
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── Done state ── */}
          {todayMeal && !alreadyCheckedIn && done && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                >
                  <Sparkles className="w-10 h-10 text-primary mx-auto mb-6" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl font-serif font-medium text-foreground leading-relaxed max-w-sm mx-auto mb-8"
                >
                  {smartLine}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button variant="ghost" onClick={() => navigate("/planner")} className="gap-2 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" /> Back to Planner
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout></MobileLayout>
  );
};

export default CheckIn;
