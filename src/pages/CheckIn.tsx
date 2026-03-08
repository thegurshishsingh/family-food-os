import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHousehold } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Check, ArrowRight, Sparkles } from "lucide-react";
import { DAYS, type PlanDay } from "@/components/planner/types";

const CHECKIN_TAGS = [
  { value: "cooked_it", label: "Cooked it", emoji: "🍳" },
  { value: "ordered_out", label: "Ordered out instead", emoji: "📦" },
  { value: "everyone_liked", label: "Everyone liked it", emoji: "😋" },
  { value: "kids_refused", label: "Kids refused it", emoji: "👶" },
  { value: "too_much_work", label: "Too much work", emoji: "😮‍💨" },
  { value: "easy_win", label: "Easy win", emoji: "✅" },
  { value: "great_leftovers", label: "Great leftovers", emoji: "♻️" },
  { value: "not_again", label: "Not again", emoji: "🚫" },
];

const EFFORT_OPTIONS = [
  { value: "easy", label: "Easy", emoji: "😌" },
  { value: "fine", label: "Fine", emoji: "👍" },
  { value: "too_much", label: "Too much", emoji: "😩" },
];

const CheckIn = () => {
  const { household, loading: hhLoading } = useHousehold();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [todayMeal, setTodayMeal] = useState<PlanDay | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"tags" | "effort" | "done">("tags");
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

    // Get the current plan
    const { data: plans } = await supabase
      .from("weekly_plans")
      .select("*")
      .eq("household_id", household.id)
      .order("week_start", { ascending: false })
      .limit(1);

    if (!plans || plans.length === 0) {
      setLoading(false);
      return;
    }

    // Today's day_of_week (0=Monday matching our DAYS array)
    const jsDay = new Date().getDay(); // 0=Sun, 1=Mon...
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // convert to 0=Mon

    const { data: dayData } = await supabase
      .from("plan_days")
      .select("*")
      .eq("plan_id", plans[0].id)
      .eq("day_of_week", dayOfWeek)
      .limit(1);

    if (dayData && dayData.length > 0) {
      const day = dayData[0] as PlanDay;
      setTodayMeal(day);

      // Check if already checked in
      const { data: existing } = await supabase
        .from("evening_checkins")
        .select("id")
        .eq("plan_day_id", day.id)
        .limit(1);

      if (existing && existing.length > 0) {
        setAlreadyCheckedIn(true);
      }
    }
    setLoading(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!household || !todayMeal || selectedTags.length === 0) return;
    setSaving(true);

    const { error } = await supabase.from("evening_checkins").insert({
      plan_day_id: todayMeal.id,
      household_id: household.id,
      tags: selectedTags,
      effort_level: effort,
    });

    if (error) {
      toast({ variant: "destructive", title: "Check-in failed", description: error.message });
      setSaving(false);
      return;
    }

    setStep("done");
    setSaving(false);
    toast({ title: "Check-in saved!", description: "Thanks for the feedback 🎉" });
  };

  const handleNext = () => {
    if (step === "tags") {
      setStep("effort");
    } else if (step === "effort") {
      handleSubmit();
    }
  };

  const handleSkipEffort = () => {
    handleSubmit();
  };

  if (loading || hhLoading) {
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
      <div className="max-w-lg mx-auto py-4">
        <AnimatePresence mode="wait">
          {/* No meal today */}
          {!todayMeal && (
            <motion.div key="no-meal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="py-16 text-center">
                <CardContent>
                  <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-serif font-semibold mb-2">No meal planned for today</h2>
                  <p className="text-muted-foreground mb-6">Generate a weekly plan first to start checking in.</p>
                  <Button onClick={() => navigate("/planner")} className="gap-2">
                    <ArrowRight className="w-4 h-4" /> Go to Planner
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Already checked in */}
          {todayMeal && alreadyCheckedIn && (
            <motion.div key="done-already" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="py-16 text-center">
                <CardContent>
                  <Check className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-serif font-semibold mb-2">Already checked in today!</h2>
                  <p className="text-muted-foreground mb-6">
                    You've already logged how <span className="font-medium text-foreground">{todayMeal.meal_name}</span> went tonight.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/planner")} className="gap-2">
                    Back to Planner
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 1: Tags */}
          {todayMeal && !alreadyCheckedIn && step === "tags" && (
            <motion.div key="step-tags" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">{DAYS[todayMeal.day_of_week]} evening</p>
                <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-2">
                  How did tonight go?
                </h1>
                {todayMeal.meal_name && (
                  <p className="text-muted-foreground">
                    Tonight's meal: <span className="font-medium text-foreground">{todayMeal.meal_name}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {CHECKIN_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.value);
                  return (
                    <motion.button
                      key={tag.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleTag(tag.value)}
                      className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className="text-lg">{tag.emoji}</span>
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {tag.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <Button
                onClick={handleNext}
                disabled={selectedTags.length === 0}
                className="w-full gap-2"
                size="lg"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Effort (optional) */}
          {todayMeal && !alreadyCheckedIn && step === "effort" && (
            <motion.div key="step-effort" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-2">
                  How much effort did this feel like tonight?
                </h1>
                <p className="text-sm text-muted-foreground">Optional — tap one or skip</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {EFFORT_OPTIONS.map((opt) => {
                  const isSelected = effort === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEffort(isSelected ? null : opt.value)}
                      className={`flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {opt.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkipEffort} className="flex-1" size="lg" disabled={saving}>
                  Skip
                </Button>
                <Button onClick={handleSubmit} className="flex-1 gap-2" size="lg" disabled={saving}>
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Done
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Done */}
          {todayMeal && !alreadyCheckedIn && step === "done" && (
            <motion.div key="step-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="py-16 text-center">
                <CardContent>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-xl font-serif font-semibold mb-2">Check-in complete!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your feedback helps make next week's plan even better.
                  </p>
                  <Button onClick={() => navigate("/planner")} className="gap-2">
                    <ArrowRight className="w-4 h-4" /> Back to Planner
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default CheckIn;
