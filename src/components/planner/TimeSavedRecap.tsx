import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, ChevronDown, Sparkles, Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { computeTimeSaved, formatHours, type TimeSavedResult } from "@/lib/timeSaved";
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

const TimeSavedRecap = ({ plan, days, householdId, householdName, onGeneratePlan, onViewDetails, generating }: TimeSavedRecapProps) => {
  const [result, setResult] = useState<TimeSavedResult | null>(null);
  const [cumulativeMinutes, setCumulativeMinutes] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(1);
  const [showEstimation, setShowEstimation] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);

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
    const { count: groceryCount } = await supabase
      .from("grocery_items")
      .select("id", { count: "exact", head: true })
      .eq("plan_id", plan.id);

    const dayIds = days.map(d => d.id);
    let checkinCount = 0;
    if (dayIds.length) {
      const { count } = await supabase
        .from("evening_checkins")
        .select("id", { count: "exact", head: true })
        .eq("household_id", householdId)
        .in("plan_day_id", dayIds);
      checkinCount = count || 0;
    }

    const { data: allPlans } = await supabase
      .from("weekly_plans")
      .select("id")
      .eq("household_id", householdId);

    const weeks = allPlans?.length || 1;
    setTotalWeeks(weeks);

    const computed = computeTimeSaved(days, {
      hasGroceryList: (groceryCount || 0) > 0,
      checkinCount,
      totalPlansCompleted: weeks,
    });

    setResult(computed);
    setCumulativeMinutes(computed.totalMinutesSaved * weeks);
  };

  useEffect(() => {
    if (result && cumulativeMinutes > 0 && !milestoneAcknowledged) {
      const milestone = getMilestone(cumulativeMinutes);
      if (milestone) {
        const timer = setTimeout(() => setShowMilestone(true), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [result, cumulativeMinutes, milestoneAcknowledged]);

  if (!result || result.totalMinutesSaved === 0) return null;

  const plannedNights = days.filter(d => d.meal_name).length;
  const humanRewards = getHumanRewards(result.totalMinutesSaved, plannedNights);
  const primaryReward = humanRewards[0];
  const milestone = getMilestone(cumulativeMinutes);

  const dismissMilestone = () => {
    setShowMilestone(false);
    setMilestoneAcknowledged(true);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-b from-card via-card to-background/40 px-6 py-12 sm:px-12 sm:py-16">

        {/* Subtle decorative glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)" }}
        />

        {/* ── MILESTONE OVERLAY ── */}
        <AnimatePresence>
          {showMilestone && milestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden"
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

        {/* ── 1. TOP LABEL ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
            Last Week Recap
          </span>
        </motion.div>

        {/* ── 2. HERO NUMBER ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-3"
        >
          <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-serif font-semibold text-foreground leading-none tracking-tight">
            <span className="text-primary">{formatHours(result.totalMinutesSaved)}</span>
            {" "}back.
          </h2>
        </motion.div>

        {/* ── 3. SUPPORTING COPY ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="text-center mb-10"
        >
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            From smarter planning, fewer scrambles, and a week that mostly ran itself.
          </p>
        </motion.div>

        {/* ── 4. KPI ROW ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42 }}
          className="flex justify-center gap-8 sm:gap-12 mb-12"
        >
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-none">
              {formatHours(result.totalMinutesSaved)}
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1 tracking-wide">this week</p>
          </div>
          <div className="w-px bg-border/40 self-stretch" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-none">
              {formatHours(cumulativeMinutes)}
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1 tracking-wide">all time</p>
          </div>
        </motion.div>

        {/* ── 5. EMOTIONAL PAYOFF ── */}
        {primaryReward && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="text-center mb-4"
          >
            <p className="text-lg sm:text-xl font-serif text-foreground leading-snug">
              {primaryReward.emoji} {primaryReward.text}
            </p>
          </motion.div>
        )}

        {/* ── 6. SYSTEM LEARNING ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.58 }}
          className="text-center mb-12"
        >
          <p className="text-xs text-muted-foreground/50">
            We'll use last week's patterns to make this week even easier.
          </p>
        </motion.div>

        {/* ── 7. CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.66, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <Button
            onClick={onGeneratePlan}
            disabled={generating}
            size="lg"
            className="gap-2.5 w-full sm:w-auto text-base font-medium px-12 py-6 shadow-lg shadow-primary/15 rounded-xl"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Creating your plan…
              </>
            ) : (
              <>
                Generate this week's plan
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
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
                    <div className="rounded-lg bg-muted/30 p-4 mt-2 text-[11px] text-muted-foreground/70 leading-relaxed space-y-1.5 max-w-sm mx-auto">
                      <p>Planned dinners reduced daily decision time.</p>
                      <p>Grocery automation cut list-building effort.</p>
                      <p>Leftovers & planned takeout prevented scrambling.</p>
                      <p className="pt-1.5 text-muted-foreground/40 italic">
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

          <ShareableRecapCard
            result={result}
            cumulativeMinutes={cumulativeMinutes}
            totalWeeks={totalWeeks}
            plannedNights={plannedNights}
            humanRewards={humanRewards}
            householdName={householdName}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TimeSavedRecap;
