import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, ChevronDown, Sparkles, Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { computeTimeSaved, formatHours, type TimeSavedResult } from "@/lib/timeSaved";
import { getHumanRewards, type HumanReward } from "@/lib/humanReward";
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

  if (!result || result.totalMinutesSaved === 0) return null;

  const plannedNights = days.filter(d => d.meal_name).length;
  const humanRewards = getHumanRewards(result.totalMinutesSaved, plannedNights);
  const primaryReward = humanRewards[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-10"
    >
      <div className="rounded-2xl border border-border/40 bg-card px-6 py-10 sm:px-10 sm:py-14">

        {/* ── 1. TOP LABEL ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 text-primary text-xs font-medium tracking-wide">
            <Sparkles className="w-3 h-3" />
            Last Week Recap
          </div>
        </motion.div>

        {/* ── 2. MAIN HEADLINE ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-serif font-semibold text-foreground leading-tight tracking-tight">
            You got{" "}
            <span className="text-primary">{formatHours(result.totalMinutesSaved)}</span>
            {" "}back last week.
          </h2>
        </motion.div>

        {/* ── 3. SUPPORTING COPY ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-10"
        >
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            From smarter planning, grocery automation, and fewer last-minute dinner scrambles.
          </p>
        </motion.div>

        {/* ── 4. KPI ROW (2 cards only) ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto mb-12"
        >
          <div className="rounded-xl border border-border/40 bg-background/60 p-4 sm:p-5 text-center">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-none">
              {formatHours(result.totalMinutesSaved)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">Saved last week</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/60 p-4 sm:p-5 text-center">
            <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-none">
              {formatHours(cumulativeMinutes)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">Total time back</p>
          </div>
        </motion.div>

        {/* ── 5. EMOTIONAL PAYOFF ── */}
        {primaryReward && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="text-center mb-10"
          >
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70 font-medium mb-3">
              What you got back
            </p>
            <p className="text-lg sm:text-xl font-serif font-medium text-foreground leading-snug">
              {primaryReward.emoji} {primaryReward.text}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              And one less week of dinner scrambling.
            </p>
          </motion.div>
        )}

        {/* ── 6. SYSTEM LEARNING LINE ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-xs text-muted-foreground/60 italic">
            We'll use last week's patterns to make this week easier.
          </p>
        </motion.div>

        {/* ── 7. PRIMARY CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68 }}
          className="flex justify-center mb-6"
        >
          <Button
            onClick={onGeneratePlan}
            disabled={generating}
            size="lg"
            className="gap-2 w-full sm:w-auto text-base px-10 py-6 shadow-lg shadow-primary/20 rounded-xl"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Creating your plan...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Generate this week's plan
              </>
            )}
          </Button>
        </motion.div>

        {/* ── 8. SECONDARY LINKS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="flex flex-col items-center gap-1"
        >
          <Collapsible open={showEstimation} onOpenChange={setShowEstimation}>
            <CollapsibleTrigger className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1 py-1">
              See how we estimated this
              <ChevronDown className={`w-3 h-3 transition-transform ${showEstimation ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>

            {/* ── 9. COLLAPSIBLE TRANSPARENCY ── */}
            <AnimatePresence>
              {showEstimation && (
                <CollapsibleContent forceMount>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-border/30 bg-background/50 p-5 mt-3 text-xs text-muted-foreground leading-relaxed space-y-2 max-w-lg mx-auto">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                          <span>Planned dinners reduced decision time — families spend ~6 min/day deciding what to cook.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                          <span>Grocery automation reduced list-building time and forgotten items.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                          <span>Leftovers and planned takeout reduced extra cooking and last-minute scrambling.</span>
                        </li>
                      </ul>
                      <p className="pt-2 text-muted-foreground/50 italic">
                        This is an estimate based on your weekly plan and activity, not a stopwatch measurement.
                      </p>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              )}
            </AnimatePresence>
          </Collapsible>

          <button
            onClick={onViewDetails}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
          >
            View last week's details
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TimeSavedRecap;
