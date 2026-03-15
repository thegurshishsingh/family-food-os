import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, ShoppingBag, Ban, Flame } from "lucide-react";
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
      return `Kids seem to enjoy ${day.cuisine_type || "this style"}. We'll remember.`;
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
  const [streak, setStreak] = useState(0);
  const [streakMessage, setStreakMessage] = useState("");
  const { toast } = useToast();

  const jsDay = new Date().getDay();
  const todayDow = jsDay === 0 ? 6 : jsDay - 1;
  const dayName = DAYS[todayDow];

  // Load streak
  useEffect(() => {
    computeStreak();
  }, [householdId, checkedIn]);

  const computeStreak = async () => {
    const { data } = await supabase
      .from("evening_checkins")
      .select("created_at")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) {
      setStreak(0);
      setStreakMessage("");
      return;
    }

    const uniqueDates = [
      ...new Set(
        data.map((r) => {
          const d = new Date(r.created_at);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        })
      ),
    ].sort((a, b) => (a > b ? -1 : 1));

    const today = new Date();
    const todayStr = fmt(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = fmt(yesterday);

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      setStreak(0);
      setStreakMessage("");
      return;
    }

    let count = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1] + "T00:00:00");
      const curr = new Date(uniqueDates[i] + "T00:00:00");
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) count++;
      else break;
    }

    setStreak(count);
    setStreakMessage(getStreakMessage(count));
  };

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const getStreakMessage = (n: number): string => {
    if (n >= 7) return "Full week! The habit is real.";
    if (n >= 5) return "Five days strong 💪";
    if (n >= 3) return "Building momentum!";
    if (n === 2) return "Two in a row — keep it going!";
    return "First check-in! Come back tomorrow.";
  };

  // Already checked in — show completed state
  if (checkedIn && todayDay) {
    return (
      <Card className="bg-primary/[0.03] border-primary/10">
        <CardContent className="p-5 sm:p-6">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground/60 uppercase mb-2">
            Tonight's Dinner
          </p>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-foreground">
              {todayDay.meal_name}
            </h2>
            <span className="text-xs text-primary font-medium">✓ Logged</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Dinner logged. Your week is on track.
          </p>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              <Flame className={`w-3.5 h-3.5 ${streak >= 7 ? "text-orange-500" : streak >= 3 ? "text-amber-500" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium text-foreground">Dinner streak: {streak} nights</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">· {streakMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Build subtitle
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

    onFeedback(todayDay, actionToFeedback(action));
    setSmartLine(generateSmartLine(action, todayDay));
    setDone(true);
    setSaving(false);
    setTimeout(() => onCheckedIn(todayDay.id), 3000);
  };

  // Empty state
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

  // Done state — smart feedback
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
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Main dinner card
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/10 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground/60 uppercase mb-2">
            Tonight's Dinner
          </p>

          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-1">
            {todayDay.meal_name}
          </h2>

          {subtextParts.length > 0 && (
            <p className="text-sm text-muted-foreground mb-1">
              {subtextParts.join(" · ")}
            </p>
          )}

          <p className="text-xs text-muted-foreground/50 mb-4">
            Your plan gets smarter when you check in.
          </p>

          {/* Streak inline */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg bg-muted/40">
              <motion.div
                animate={streak >= 3 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Flame className={`w-4 h-4 ${streak >= 7 ? "text-orange-500" : streak >= 3 ? "text-amber-500" : "text-muted-foreground"}`} />
              </motion.div>
              <span className="text-sm font-semibold text-foreground">Dinner streak: {streak} nights</span>
              <span className="text-xs text-muted-foreground hidden sm:inline ml-1">· {streakMessage}</span>
            </div>
          )}

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
