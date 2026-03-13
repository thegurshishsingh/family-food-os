import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Star, Plus, ShoppingBag, Ban, UtensilsCrossed } from "lucide-react";
import { DAYS, MODE_CONFIG, type PlanDay, type FeedbackType } from "./types";

const QUICK_ACTIONS = [
  { value: "cooked_it", label: "Cooked it", emoji: "🍳", sentiment: "positive" },
  { value: "ordered_instead", label: "Ordered instead", emoji: "📦", sentiment: "neutral" },
  { value: "kids_loved", label: "Kids loved it", emoji: "😋", sentiment: "positive" },
  { value: "too_much_work", label: "Too much work", emoji: "😮‍💨", sentiment: "neutral" },
] as const;

type QuickAction = typeof QUICK_ACTIONS[number]["value"];

function generateSmartLine(action: QuickAction, day: PlanDay): string {
  const dayName = DAYS[day.day_of_week];
  const name = day.meal_name || "tonight's meal";
  switch (action) {
    case "cooked_it":
      return `Nice. "${name}" reinforced for future ${dayName}s.`;
    case "ordered_instead":
      return `Got it. ${dayName} dinners should stay quick.`;
    case "kids_loved":
      return `"${name}" is a family favorite now.`;
    case "too_much_work":
      return `Noted. We'll keep ${dayName}s lighter next week.`;
  }
}

function actionToFeedback(action: QuickAction): FeedbackType {
  switch (action) {
    case "cooked_it": return "okay";
    case "ordered_instead": return "okay";
    case "kids_loved": return "loved";
    case "too_much_work": return "too_hard";
  }
}

function actionToTags(action: QuickAction): string[] {
  switch (action) {
    case "cooked_it": return ["cooked_it"];
    case "ordered_instead": return ["ordered_out"];
    case "kids_loved": return ["everyone_liked"];
    case "too_much_work": return [];
  }
}

function actionToEffort(action: QuickAction): string | null {
  switch (action) {
    case "cooked_it": return "fine";
    case "ordered_instead": return null;
    case "kids_loved": return "easy";
    case "too_much_work": return "too_much";
  }
}

interface DailyDinnerCardProps {
  todayDay: PlanDay | null;
  householdId: string;
  checkedIn: boolean;
  onCheckedIn: (dayId: string) => void;
  onFeedback: (day: PlanDay, feedback: FeedbackType) => void;
}

const DailyDinnerCard = ({
  todayDay,
  householdId,
  checkedIn,
  onCheckedIn,
  onFeedback,
}: DailyDinnerCardProps) => {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [smartLine, setSmartLine] = useState("");
  const { toast } = useToast();

  const jsDay = new Date().getDay();
  const todayDow = jsDay === 0 ? 6 : jsDay - 1;
  const dayName = DAYS[todayDow];

  // Already checked in — don't show
  if (checkedIn && todayDay) return null;

  // Build subtitle chips
  const subtextParts: string[] = [];
  if (todayDay) {
    if (todayDay.prep_time_minutes) subtextParts.push(`${todayDay.prep_time_minutes} min prep`);
    if (todayDay.cuisine_type) subtextParts.push(todayDay.cuisine_type);
    const mode = MODE_CONFIG[todayDay.meal_mode];
    if (todayDay.meal_mode !== "cook") subtextParts.push(mode.label);
  }

  const handleQuickAction = async (action: QuickAction) => {
    if (!todayDay) return;
    setSelectedAction(action);
    setSaving(true);

    // Save check-in
    const { error: ciErr } = await supabase.from("evening_checkins").insert({
      plan_day_id: todayDay.id,
      household_id: householdId,
      tags: actionToTags(action),
      effort_level: actionToEffort(action),
    });

    if (ciErr) {
      toast({ variant: "destructive", title: "Check-in failed", description: ciErr.message });
      setSaving(false);
      setSelectedAction(null);
      return;
    }

    // Also save meal feedback
    onFeedback(todayDay, actionToFeedback(action));

    setSmartLine(generateSmartLine(action, todayDay));
    setDone(true);
    setSaving(false);
    setTimeout(() => onCheckedIn(todayDay.id), 3000);
  };

  // ─── Empty state: no dinner scheduled ───
  if (!todayDay || !todayDay.meal_name) {
    return (
      <Card className="border-dashed border-border/60 bg-card/50">
        <CardContent className="p-5 sm:p-6">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground/60 uppercase mb-2">
            Tonight's Dinner
          </p>
          <h2 className="text-xl font-serif font-semibold text-foreground/70 mb-1">
            Tonight is open
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            No dinner planned for {dayName}. What sounds good?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-9 px-4">
              <Plus className="w-3.5 h-3.5" /> Quick dinner idea
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-9 px-4">
              <ShoppingBag className="w-3.5 h-3.5" /> Order takeout
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-9 px-4">
              <Ban className="w-3.5 h-3.5" /> Skip tonight
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Done state ───
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-primary/[0.04] border-primary/10">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground mb-0.5">{smartLine}</p>
                <p className="text-xs text-muted-foreground">
                  Thanks. We'll use this to improve next week's plan.
                </p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => {/* Could navigate to rate */}}
                    className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors underline underline-offset-2"
                  >
                    Rate the meal
                  </button>
                  <button
                    onClick={() => {/* Could trigger save-to-favorites */}}
                    className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors underline underline-offset-2"
                  >
                    Add to favorites
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ─── Main dinner card ───
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/10 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          {/* Section label */}
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground/60 uppercase mb-2">
            Tonight's Dinner
          </p>

          {/* Meal title */}
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-1">
            {todayDay.meal_name}
          </h2>

          {/* Subtext pills */}
          {subtextParts.length > 0 && (
            <p className="text-sm text-muted-foreground mb-1">
              {subtextParts.join(" · ")}
            </p>
          )}

          {/* Helper text */}
          <p className="text-xs text-muted-foreground/50 mb-5">
            Your plan gets smarter when you check in.
          </p>

          {/* Quick feedback buttons */}
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => {
              const isSelected = selectedAction === action.value;
              const isPositive = action.sentiment === "positive";
              return (
                <button
                  key={action.value}
                  onClick={() => handleQuickAction(action.value)}
                  disabled={saving}
                  className={`
                    relative flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-3 rounded-xl text-xs sm:text-sm font-medium
                    transition-all duration-200 border min-w-0
                    ${isSelected && saving
                      ? "border-primary bg-primary/10 text-primary scale-[0.97]"
                      : isPositive
                        ? "border-primary/20 bg-card text-foreground hover:border-primary/40 hover:bg-primary/[0.04] active:scale-[0.97]"
                        : "border-border bg-card text-foreground hover:border-muted-foreground/30 hover:bg-muted/30 active:scale-[0.97]"
                    }
                    disabled:opacity-50 disabled:pointer-events-none
                  `}
                >
                  <span className="text-sm sm:text-base">{action.emoji}</span>
                  <span className="truncate">{action.label}</span>
                  {isSelected && saving && (
                    <div className="absolute right-2 sm:right-3 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyDinnerCard;
