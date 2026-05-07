import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, ChevronDown, Sparkles, Award, X, Rocket, Share2, Home, Flame, TrendingUp } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { computeTimeSaved, computePerWeekResults, formatHours, type TimeSavedResult, type WeekInputs, type PerWeekResult } from "@/lib/timeSaved";
import { getHumanRewards, type HumanReward } from "@/lib/humanReward";
import ShareableRecapCard from "./ShareableRecapCard";
import type { PlanDay, WeeklyPlan } from "./types";

interface TimeSavedRecapProps {
  plan: WeeklyPlan;
  days: PlanDay[];
  householdId: string;
  householdName?: string;
  onGeneratePlan: () => void;
  onViewDetails: () => void;
  generating: boolean;
}

const MILESTONES = [
  { hours: 100, label: "100 hours", message: "A hundred hours reclaimed for your family." },
  { hours: 50, label: "50 hours", message: "Fifty hours back in your family's hands." },
  { hours: 25, label: "25 hours", message: "Twenty-five hours saved—and counting." },
  { hours: 10, label: "10 hours", message: "Ten hours reclaimed for what matters." },
];

function getMilestone(totalMinutes: number) {
  const hours = totalMinutes / 60;
  return MILESTONES.find((m) => hours >= m.hours) || null;
}

const CONFETTI_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--sage))",
  "hsl(var(--warm))",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--sage-dark))",
];

function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color, left: `${x}%`, top: -8 }}
      initial={{ opacity: 0, y: 0, rotate: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, 60, 130, 200],
        x: [0, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 70],
        rotate: [0, 180, 360],
        scale: [0, 1, 0.8, 0],
      }}
      transition={{ duration: 2.8, delay, ease: "easeOut" }}
    />
  );
}

function AnimatedHours({ minutes }: { minutes: number }) {
  const target = minutes / 60;
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => {
    const rounded = Math.round(v * 10) / 10;
    return rounded % 1 === 0 ? `${rounded.toFixed(0)}h` : `${rounded.toFixed(1)}h`;
  });
  useEffect(() => {
    const controls = animate(mv, target, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [target, mv]);
  return (
    <h2 className="text-[3.5rem] sm:text-[5rem] md:text-[6rem] font-serif font-semibold text-primary leading-none tracking-tight">
      <motion.span>{display}</motion.span>
    </h2>
  );
}

function KPI({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`relative rounded-xl px-3 py-3 text-center border ${
        accent
          ? "bg-primary/5 border-primary/20"
          : "bg-background/50 border-border/40"
      }`}
    >
      <p className="text-base sm:text-lg font-serif font-bold text-foreground leading-none">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-1.5">{label}</p>
    </div>
  );
}

function RecapStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center px-1">
      <p className="text-2xl sm:text-3xl font-serif font-semibold text-foreground leading-none tabular-nums">
        {value}
      </p>
      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 leading-tight">
        {label}
      </p>
    </div>
  );
}

// Shareable real-world comparison — concrete, relatable hook.
function getRealWorldEquivalent(minutes: number): { emoji: string; text: string } {
  if (minutes >= 360) return { emoji: "✈️", text: "a flight to the coast" };
  if (minutes >= 240) return { emoji: "🎬", text: "two full movies" };
  if (minutes >= 180) return { emoji: "🏃‍♀️", text: "a half-marathon (and a shower)" };
  if (minutes >= 150) return { emoji: "🍿", text: "a feature film with previews" };
  if (minutes >= 120) return { emoji: "🧘", text: "two yoga classes back-to-back" };
  if (minutes >= 90) return { emoji: "📚", text: "three bedtime stories, twice" };
  if (minutes >= 60) return { emoji: "☕", text: "a slow coffee with a friend" };
  if (minutes >= 45) return { emoji: "🚶", text: "an evening walk around the block" };
  if (minutes >= 30) return { emoji: "🛁", text: "a hot bath, no rushing" };
  return { emoji: "📖", text: "one chapter, fully present" };
}

type RecapInputs = {
  plannedNights: number;
  cookNights: number;
  groceryListUsed: boolean;
  rawCheckinCount: number;
  cappedCheckinCount: number;
};

const TimeSavedRecap = ({ plan, days, householdId, householdName, onGeneratePlan, onViewDetails, generating }: TimeSavedRecapProps) => {
  const [result, setResult] = useState<TimeSavedResult | null>(null);
  const [cumulativeMinutes, setCumulativeMinutes] = useState(0);
  const [pastWeekResults, setPastWeekResults] = useState<PerWeekResult[]>([]);
  const [isFirstWeek, setIsFirstWeek] = useState(false);
  const [totalWeeks, setTotalWeeks] = useState(1);
  const [showEstimation, setShowEstimation] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [recapInputs, setRecapInputs] = useState<RecapInputs | null>(null);

  // Persist milestone acknowledgment so it doesn't show on every login
  const getAcknowledgedMilestone = (): number => {
    try {
      return parseInt(localStorage.getItem(`ffos_milestone_ack_${householdId}`) || "0", 10) || 0;
    } catch { return 0; }
  };
  const [milestoneAcknowledged, setMilestoneAcknowledged] = useState(false);

  useEffect(() => {
    loadTimeSaved();
  }, [plan, days, householdId]);

  const loadTimeSaved = async () => {
    // ── Current-week grocery engagement ──
    // "Used" = at least one item checked off (real shopping behavior),
    // OR at least one item came from a meal swap (list got actively updated).
    const { data: currentGrocery } = await supabase
      .from("grocery_items")
      .select("is_checked, source")
      .eq("plan_id", plan.id);
    const currentGroceryUsed = (currentGrocery || []).some(
      (g: any) => g.is_checked === true || g.source === "swap"
    );

    // ── Current-week check-in coverage ──
    // Count UNIQUE plan_days with at least one check-in to avoid
    // overcounting when a day has multiple check-in rows.
    const dayIds = days.map(d => d.id);
    let checkinCount = 0;
    if (dayIds.length) {
      const { data: ciRows } = await supabase
        .from("evening_checkins")
        .select("plan_day_id")
        .eq("household_id", householdId)
        .in("plan_day_id", dayIds);
      checkinCount = new Set((ciRows || []).map((c: any) => c.plan_day_id)).size;
    }

    // Pull all past plans to compute cumulative as a SUM of per-week actuals.
    const { data: allPlans } = await supabase
      .from("weekly_plans")
      .select("id, week_start")
      .eq("household_id", householdId)
      .order("week_start", { ascending: true });

    const weeks = allPlans?.length || 1;
    const pastWeeks = Math.max(0, weeks - 1); // exclude current week
    setTotalWeeks(weeks);

    if (pastWeeks === 0) {
      setIsFirstWeek(true);
      setResult(null);
      return;
    }
    setIsFirstWeek(false);

    const computed = computeTimeSaved(days, {
      groceryListUsed: currentGroceryUsed,
      checkinCount,
      totalPlansCompleted: weeks,
    });
    setResult(computed);

    const currentPlannedNights = days.filter(d => d.meal_name).length;
    const currentCookNights = days.filter(d => d.meal_mode === "cook").length;
    setRecapInputs({
      plannedNights: currentPlannedNights,
      cookNights: currentCookNights,
      groceryListUsed: currentGroceryUsed,
      rawCheckinCount: checkinCount,
      cappedCheckinCount: Math.min(checkinCount, currentCookNights),
    });

    // ── Cumulative: sum per-week actuals ──
    try {
      const pastPlanIds = (allPlans || []).filter(p => p.id !== plan.id).map(p => p.id);
      const weekInputs: (WeekInputs & { weekStart?: string })[] = [];

      // Past weeks first (chronological), then current week last.
      if (pastPlanIds.length) {
        const [{ data: pastDays }, { data: pastGrocery }] = await Promise.all([
          supabase
            .from("plan_days")
            .select("*")
            .in("plan_id", pastPlanIds),
          supabase
            .from("grocery_items")
            .select("plan_id, is_checked, source")
            .in("plan_id", pastPlanIds),
        ]);

        const daysByPlan: Record<string, PlanDay[]> = {};
        (pastDays || []).forEach((d: any) => {
          (daysByPlan[d.plan_id] ||= []).push(d as PlanDay);
        });

        const groceryUsedByPlan = new Set<string>();
        (pastGrocery || []).forEach((g: any) => {
          if (g.is_checked === true || g.source === "swap") {
            groceryUsedByPlan.add(g.plan_id);
          }
        });

        const allPastDayIds = (pastDays || []).map((d: any) => d.id);
        let checkinDayIds = new Set<string>();
        if (allPastDayIds.length) {
          const { data: pastCheckins } = await supabase
            .from("evening_checkins")
            .select("plan_day_id")
            .eq("household_id", householdId)
            .in("plan_day_id", allPastDayIds);
          checkinDayIds = new Set((pastCheckins || []).map((c: any) => c.plan_day_id));
        }

        // Preserve chronological order from allPlans
        const pastPlansChrono = (allPlans || []).filter(p => p.id !== plan.id);
        for (const p of pastPlansChrono) {
          const pd = daysByPlan[p.id] || [];
          if (!pd.length) continue;
          const checkinsForWeek = pd.filter(d => checkinDayIds.has(d.id)).length;
          weekInputs.push({
            planId: p.id,
            weekStart: p.week_start,
            days: pd,
            groceryListUsed: groceryUsedByPlan.has(p.id),
            checkinCount: checkinsForWeek,
          });
        }
      }

      // Current week last
      weekInputs.push({
        planId: plan.id,
        weekStart: plan.week_start,
        days,
        groceryListUsed: currentGroceryUsed,
        checkinCount,
      });

      const { total, perWeek } = computePerWeekResults(weekInputs);
      setCumulativeMinutes(total);
      // Past weeks only (exclude current), most recent first
      const past = perWeek.filter(w => w.planId !== plan.id).reverse();
      setPastWeekResults(past);
    } catch {
      setCumulativeMinutes(computed.totalMinutesSaved * weeks);
      setPastWeekResults([]);
    }
  };

  useEffect(() => {
    if (result && cumulativeMinutes > 0 && !milestoneAcknowledged) {
      const milestone = getMilestone(cumulativeMinutes);
      const acked = getAcknowledgedMilestone();
      if (milestone && milestone.hours > acked) {
        const timer = setTimeout(() => setShowMilestone(true), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [result, cumulativeMinutes, milestoneAcknowledged]);

  if (!result || result.totalMinutesSaved === 0) return null;

  const plannedNights = days.filter(d => d.meal_name).length;
  const takeoutNights = days.filter(d => ["takeout", "dine_out"].includes(d.meal_mode as string)).length;
  const humanRewards = getHumanRewards(result.totalMinutesSaved, plannedNights);
  const primaryReward = humanRewards[0];
  const milestone = getMilestone(cumulativeMinutes);

  // ── Improvement streak: consecutive weeks (including current) where
  // time-saved increased vs the prior week. pastWeekResults is most-recent-first.
  const chronologicalAll = [...pastWeekResults].reverse().concat([
    { planId: plan.id, minutesSaved: result.totalMinutesSaved, plannedNights, weekStart: plan.week_start },
  ]);
  let improvementStreak = 0;
  for (let i = chronologicalAll.length - 1; i > 0; i--) {
    if (chronologicalAll[i].minutesSaved > chronologicalAll[i - 1].minutesSaved) {
      improvementStreak++;
    } else break;
  }
  const STREAK_BADGES: { min: number; label: string; sublabel: string; icon: typeof Flame }[] = [
    { min: 6, label: "Unstoppable", sublabel: "6+ weeks of growth", icon: Award },
    { min: 4, label: "On fire", sublabel: "4 weeks improving", icon: Flame },
    { min: 3, label: "Hat trick", sublabel: "3 weeks improving", icon: Flame },
    { min: 2, label: "Building momentum", sublabel: "2 weeks improving", icon: TrendingUp },
  ];
  const streakBadge = STREAK_BADGES.find((b) => improvementStreak >= b.min) || null;

  const dismissMilestone = () => {
    setShowMilestone(false);
    setMilestoneAcknowledged(true);
    const milestone = getMilestone(cumulativeMinutes);
    if (milestone) {
      try { localStorage.setItem(`ffos_milestone_ack_${householdId}`, String(milestone.hours)); } catch {}
    }
  };
  // First-week welcome card
  if (isFirstWeek) {
    const plannedCount = days.filter(d => d.meal_name).length;
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-b from-card via-card to-background/40 px-6 py-10 sm:px-12 sm:py-14 text-center">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)" }}
          />
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.15, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-5"
            >
              <Rocket className="w-7 h-7 text-primary" />
            </motion.div>
            <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-2">
              Welcome to your first week!
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-6">
              You've got {plannedCount} dinner{plannedCount !== 1 ? "s" : ""} planned — nice start.
              Complete this week and check in on your meals to unlock your first <span className="font-medium text-foreground">Weekly Recap</span> with personalized time-saved insights.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Your recap will appear here next week</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  // Issue stamp metadata
  const issueNumber = String(totalWeeks).padStart(2, "0");
  const dateStamp = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }).toUpperCase();

  // Confetti pieces for celebratory background
  const confettiPieces = Array.from({ length: 32 }).map((_, i) => ({
    left: (i * 9.7) % 100,
    top: (i * 13.3) % 100,
    delay: (i % 8) * 0.15,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 4 + (i % 3) * 2,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12"
    >
      <div
        className="relative overflow-hidden rounded-[28px] px-6 py-10 sm:px-10 sm:py-14 text-center shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.25)]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, hsl(var(--primary) / 0.08) 0%, transparent 60%), linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
        }}
      >
        {/* Confetti background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {confettiPieces.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-[2px]"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size + 2,
                backgroundColor: p.color,
                transformOrigin: "center",
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ opacity: [0, 0.85, 0.6], scale: [0, 1, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2.2, delay: p.delay, ease: "easeOut" }}
            />
          ))}
        </div>

        {/* ── MILESTONE OVERLAY ── */}
        <AnimatePresence>
          {showMilestone && milestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-[28px] overflow-hidden"
            >
              <div className="absolute inset-0 bg-card/92 backdrop-blur-md" />
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 18 }).map((_, i) => (
                  <ConfettiParticle key={i} delay={i * 0.07} x={8 + (i * 5)} color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} />
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="relative z-20 text-center px-6 py-10 max-w-xs"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.15, 1] }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5"
                >
                  <Award className="w-7 h-7 text-primary" />
                </motion.div>
                <p className="text-[11px] uppercase tracking-widest text-primary/70 font-medium mb-2">
                  Milestone Reached
                </p>
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-2">
                  {milestone.label} saved
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {milestone.message}
                </p>
                <Button variant="outline" size="sm" onClick={dismissMilestone} className="gap-1.5 text-xs">
                  Continue <ArrowRight className="w-3 h-3" />
                </Button>
              </motion.div>
              <button onClick={dismissMilestone} className="absolute top-4 right-4 z-30 p-1.5 rounded-full bg-background/60 hover:bg-background/80 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* hidden stamp for a11y / screenshots */}
        <span className="sr-only">Weekly Recap №{issueNumber} · {dateStamp}</span>

        {/* ── HEADLINE ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-2"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground leading-tight">
            You did it!
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative text-sm sm:text-base text-muted-foreground mb-7 max-w-xs mx-auto"
        >
          Great job planning your week.
        </motion.p>

        {/* ── HOUSE BADGE ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 220, damping: 16 }}
          className="relative mx-auto mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)]"
          aria-hidden
        >
          <Home className="w-7 h-7" strokeWidth={2} />
        </motion.div>

        {/* ── STATS ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="relative grid grid-cols-3 gap-3 max-w-md mx-auto mb-8"
        >
          <RecapStat value={String(plannedNights)} label="Meals planned" />
          <RecapStat value={String(takeoutNights)} label={takeoutNights === 1 ? "Takeout night" : "Takeout nights"} />
          <RecapStat value={formatHours(result.totalMinutesSaved)} label="Time saved" />
        </motion.div>

        {/* ── EMOTIONAL PAYOFF — what you can use this time for ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 180, damping: 18 }}
          className="relative max-w-md mx-auto mb-8 space-y-2.5"
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/15 via-primary/8 to-accent/12 border border-primary/20 px-5 py-3.5 text-center shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.35)]">
            <p className="text-sm sm:text-base font-serif text-foreground leading-snug">
              That's <span className="font-semibold">{formatHours(result.totalMinutesSaved)}</span> back in your week
            </p>
          </div>

          {humanRewards.length > 0 && (
            <div className="space-y-1.5">
              {humanRewards.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl bg-background/60 border border-border/40 px-4 py-2.5 text-left"
                >
                  <span className="text-lg shrink-0" aria-hidden>{r.emoji}</span>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-snug">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {cumulativeMinutes > result.totalMinutesSaved && pastWeekResults.length === 0 && (
            <p className="text-[11px] text-muted-foreground/70 text-center pt-1">
              <span className="font-medium text-foreground/70">{formatHours(cumulativeMinutes)}</span> reclaimed across {totalWeeks} weeks with Family Food OS
            </p>
          )}
        </motion.div>

        {/* ── JOURNEY SO FAR — past weeks comparison ── */}
        {pastWeekResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.78, duration: 0.5 }}
            className="relative max-w-md mx-auto mb-8"
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 font-medium text-center mb-3">
              Your journey so far
            </p>
            <div className="rounded-2xl bg-background/50 border border-border/40 p-3 sm:p-4 space-y-2">
              {pastWeekResults.slice(0, 5).map((w) => {
                const max = Math.max(
                  result.totalMinutesSaved,
                  ...pastWeekResults.map((p) => p.minutesSaved),
                  1,
                );
                const pct = Math.max(8, Math.round((w.minutesSaved / max) * 100));
                const label = w.weekStart
                  ? new Date(w.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  : "Past week";
                return (
                  <div key={w.planId} className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground/80 w-14 shrink-0 tabular-nums">{label}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-foreground/80 w-14 text-right tabular-nums shrink-0">
                      {formatHours(w.minutesSaved)}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 pt-1.5 border-t border-border/40">
                <span className="text-[11px] font-semibold text-primary w-14 shrink-0">This week</span>
                <div className="flex-1 h-2 rounded-full bg-primary/15 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.max(8, Math.round((result.totalMinutesSaved / Math.max(result.totalMinutesSaved, ...pastWeekResults.map((p) => p.minutesSaved), 1)) * 100))}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <span className="text-[11px] font-semibold text-primary w-14 text-right tabular-nums shrink-0">
                  {formatHours(result.totalMinutesSaved)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/60 text-center mt-2.5">
              <span className="font-medium text-foreground/70">{formatHours(cumulativeMinutes)}</span> reclaimed across {totalWeeks} week{totalWeeks !== 1 ? "s" : ""} — keep the streak going.
            </p>
          </motion.div>
        )}

        {/* ── PRIMARY ACTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="relative flex flex-col items-center gap-3 mb-2"
        >
          <Button
            onClick={onGeneratePlan}
            disabled={generating}
            size="lg"
            className="gap-2.5 w-full sm:w-auto text-base font-medium px-10 py-6 shadow-lg shadow-primary/20 rounded-xl"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Creating your plan…
              </>
            ) : (
              <>
                Plan Next Week
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Share — generates a clean image */}
          <div className="[&_button]:!text-primary [&_button]:!font-medium [&_button]:!text-sm [&_button]:gap-2 [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-full [&_button]:bg-primary/10 [&_button]:hover:bg-primary/15 [&_button]:border [&_button]:border-primary/20 [&_button_svg]:!w-4 [&_button_svg]:!h-4">
            <ShareableRecapCard
              result={result}
              cumulativeMinutes={cumulativeMinutes}
              totalWeeks={totalWeeks}
              plannedNights={plannedNights}
              humanRewards={humanRewards}
              householdName={householdName}
            />
          </div>
        </motion.div>

        {/* ── 8. SECONDARY LINKS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.76 }}
          className="flex flex-col items-center gap-0"
        >
          <Collapsible open={showEstimation} onOpenChange={setShowEstimation}>
            <CollapsibleTrigger className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors flex items-center gap-1 py-1.5">
              How we estimated this
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showEstimation ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>

            <AnimatePresence>
              {showEstimation && (
                <CollapsibleContent forceMount>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg bg-muted/30 p-4 mt-2 text-[11px] text-muted-foreground/70 leading-relaxed space-y-3 max-w-sm mx-auto text-left">
                      {recapInputs && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-1.5">Signals from your week</p>
                          <ul className="space-y-1">
                            <li className="flex justify-between gap-3">
                              <span>Planned nights</span>
                              <span className="font-medium text-foreground/80">{recapInputs.plannedNights} / 7</span>
                            </li>
                            <li className="flex justify-between gap-3">
                              <span>Grocery list used</span>
                              <span className="font-medium text-foreground/80">{recapInputs.groceryListUsed ? "Yes" : "No"}</span>
                            </li>
                            <li className="flex justify-between gap-3">
                              <span>Check-ins counted</span>
                              <span className="font-medium text-foreground/80">
                                {recapInputs.cappedCheckinCount} / {Math.max(recapInputs.cookNights, 1)}
                                {recapInputs.rawCheckinCount > recapInputs.cappedCheckinCount && (
                                  <span className="text-muted-foreground/50"> (capped from {recapInputs.rawCheckinCount})</span>
                                )}
                              </span>
                            </li>
                            <li className="flex justify-between gap-3">
                              <span>Confidence score</span>
                              <span className="font-medium text-foreground/80">{Math.round(result.confidence * 100)}%</span>
                            </li>
                          </ul>
                        </div>
                      )}

                      {result.factors.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-1.5">Savings components</p>
                          <ul className="space-y-1">
                            {result.factors.map((f, i) => (
                              <li key={i} className="flex justify-between gap-3">
                                <span className="flex-1">{f.label}</span>
                                <span className="font-medium text-foreground/80 whitespace-nowrap">
                                  {f.minutesSaved} min
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="pt-1.5 text-muted-foreground/40 italic text-center">
                        Estimated from your plan and activity, not a stopwatch.
                      </p>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              )}
            </AnimatePresence>
          </Collapsible>

          <button
            onClick={onViewDetails}
            className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors py-1.5"
          >
            View last week's details
          </button>

        </motion.div>
      </div>
    </motion.div>
  );
};

export default TimeSavedRecap;
