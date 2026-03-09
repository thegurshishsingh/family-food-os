import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Calendar, ArrowRight, ChevronDown, ChevronUp, Sparkles, Award, X, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { computeTimeSaved, formatHours, type TimeSavedResult } from "@/lib/timeSaved";
import type { PlanDay, WeeklyPlan } from "./types";

interface TimeSavedRecapProps {
  plan: WeeklyPlan;
  days: PlanDay[];
  householdId: string;
  onGeneratePlan: () => void;
  onViewDetails: () => void;
  generating: boolean;
}

// Milestone thresholds in hours
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

// Confetti particle component
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color, left: `${x}%`, top: -8 }}
      initial={{ opacity: 0, y: 0, rotate: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, 60, 120, 180],
        x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
        rotate: [0, 180, 360],
        scale: [0, 1, 0.8, 0],
      }}
      transition={{
        duration: 2.5,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

const TimeSavedRecap = ({ plan, days, householdId, onGeneratePlan, onViewDetails, generating }: TimeSavedRecapProps) => {
  const [result, setResult] = useState<TimeSavedResult | null>(null);
  const [cumulativeMinutes, setCumulativeMinutes] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneAcknowledged, setMilestoneAcknowledged] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    loadTimeSaved();
  }, [plan, days, householdId]);

  // Trigger milestone celebration after data loads
  useEffect(() => {
    if (result && cumulativeMinutes > 0 && !milestoneAcknowledged) {
      const milestone = getMilestone(cumulativeMinutes);
      if (milestone) {
        const timer = setTimeout(() => setShowMilestone(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [result, cumulativeMinutes, milestoneAcknowledged]);

  const loadTimeSaved = async () => {
    // Check grocery list existence
    const { count: groceryCount } = await supabase
      .from("grocery_items")
      .select("id", { count: "exact", head: true })
      .eq("plan_id", plan.id);

    // Check evening check-ins for this plan
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

    // Count total plans for cumulative stats
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

    // Generate personalized insight from feedback + cuisine data
    buildInsight(householdId);
  };

  const dismissMilestone = () => {
    setShowMilestone(false);
    setMilestoneAcknowledged(true);
  };

  if (!result || result.totalMinutesSaved === 0) return null;

  const milestone = getMilestone(cumulativeMinutes);
  const avgMinutes = totalWeeks > 0 ? Math.round(cumulativeMinutes / totalWeeks) : 0;
  const maxBarValue = Math.max(...result.breakdown.map(b => b.withoutApp));

  // Confetti colors using design system tones
  const confettiColors = [
    "hsl(var(--primary))",
    "hsl(var(--sage))",
    "hsl(var(--warm))",
    "hsl(var(--primary) / 0.6)",
    "hsl(var(--sage-dark))",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      <Card className="border-primary/15 bg-gradient-to-br from-sage-light/60 via-card to-warm-light/30 overflow-hidden relative">
        {/* Milestone celebration overlay */}
        <AnimatePresence>
          {showMilestone && milestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-xl overflow-hidden"
            >
              {/* Glow background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-sage-light/40 to-warm-light/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.85] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              {/* Subtle radial glow pulse */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
                }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Confetti particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <ConfettiParticle
                    key={i}
                    delay={i * 0.08}
                    x={10 + (i * 4.5)}
                    color={confettiColors[i % confettiColors.length]}
                  />
                ))}
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                className="relative z-20 text-center px-6 py-10 max-w-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20"
                >
                  <Award className="w-8 h-8 text-primary" />
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs uppercase tracking-widest text-primary/80 font-medium mb-2"
                >
                  Milestone Reached
                </motion.p>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-3"
                >
                  {milestone.label} saved
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85 }}
                  className="text-sm text-muted-foreground leading-relaxed mb-6"
                >
                  {milestone.message}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={dismissMilestone}
                    className="gap-1.5 text-xs"
                  >
                    Continue
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Dismiss X */}
              <button
                onClick={dismissMilestone}
                className="absolute top-4 right-4 z-30 p-1.5 rounded-full bg-background/60 hover:bg-background/80 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="pt-8 pb-6 px-5 sm:px-8">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Last Week Recap
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground leading-tight">
              Your family got{" "}
              <span className="text-primary">{formatHours(result.totalMinutesSaved)}</span>
              {" "}back last week.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-3 max-w-lg mx-auto leading-relaxed">
              That's time you didn't spend deciding, shopping, or scrambling—based on the meals your family actually made together.
            </p>
          </motion.div>

          {/* KPI cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            <KpiCard
              icon={Clock}
              value={formatHours(result.totalMinutesSaved)}
              label="Saved last week"
              delay={0.35}
            />
            <KpiCard
              icon={TrendingUp}
              value={formatHours(cumulativeMinutes)}
              label="Total saved"
              delay={0.4}
            />
            <KpiCard
              icon={Calendar}
              value={formatHours(avgMinutes)}
              label="Avg per week"
              delay={0.45}
            />
          </motion.div>

          {/* Why you saved time */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="rounded-xl border border-border/50 bg-background/70 backdrop-blur-sm p-4 sm:p-5 mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Why your family saved time
              </h3>
              <ul className="space-y-2.5">
                {result.factors.map((factor, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.06 }}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <span className="shrink-0 mt-1 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </span>
                    <span className="text-foreground/85 leading-relaxed">{factor.label}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Learning indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/80" />
                </div>
                <span>Learning from your family's habits</span>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground/70 mt-2">
              Each week, the system adapts—next week's plan will fit even better.
            </p>
          </motion.div>

          {/* Expandable breakdown chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => setShowBreakdown(v => !v)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {showBreakdown ? "Hide" : "See"} time comparison breakdown
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <AnimatePresence>
              {showBreakdown && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-border/40 bg-background/60 p-4 sm:p-5 mt-2 space-y-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Category</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/25" /> Without app
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> With app
                        </span>
                      </div>
                    </div>
                    {result.breakdown.map((item, i) => {
                      const savedPct = item.withoutApp > 0 ? Math.round(((item.withoutApp - item.withApp) / item.withoutApp) * 100) : 0;
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground/80">{item.category}</span>
                            <span className="text-[11px] text-primary font-medium">
                              {savedPct > 0 ? `−${savedPct}%` : "—"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-muted-foreground/20"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.withoutApp / maxBarValue) * 100}%` }}
                                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-12 text-right">{item.withoutApp}m</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-primary"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.withApp / maxBarValue) * 100}%` }}
                                  transition={{ delay: 0.15 + i * 0.05, duration: 0.5 }}
                                />
                              </div>
                              <span className="text-[10px] text-primary font-medium w-12 text-right">{item.withApp}m</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex flex-col items-center gap-4 mt-6"
          >
            <Button
              onClick={onGeneratePlan}
              disabled={generating}
              size="lg"
              className="gap-2 w-full sm:w-auto text-base px-10 py-6 shadow-lg shadow-primary/20"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating your plan...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Plan next week
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground/70 text-center max-w-xs">
              Your preferences, your pace, your family's tastes—ready to go.
            </p>
            <Button
              variant="ghost"
              onClick={onViewDetails}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              View last week's details
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function KpiCard({ icon: Icon, value, label, delay }: { icon: typeof Clock; value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <div className="rounded-xl border border-border/40 bg-background/70 backdrop-blur-sm p-3 sm:p-4 text-center">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-lg sm:text-xl font-serif font-bold text-foreground leading-tight">{value}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export default TimeSavedRecap;
