import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, TrendingUp, Zap, ArrowRight, ChevronDown, ChevronUp, Sparkles, Award, X, Info, Share2 } from "lucide-react";
import ShareableRecapCard from "./ShareableRecapCard";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { computeTimeSaved, formatHours, type TimeSavedResult } from "@/lib/timeSaved";
import { getHumanRewards, getCumulativeMessage, getYearlyProjection, type HumanReward } from "@/lib/humanReward";
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
      transition={{ duration: 2.5, delay, ease: "easeOut" }}
    />
  );
}

const TimeSavedRecap = ({ plan, days, householdId, householdName, onGeneratePlan, onViewDetails, generating }: TimeSavedRecapProps) => {
  const [result, setResult] = useState<TimeSavedResult | null>(null);
  const [cumulativeMinutes, setCumulativeMinutes] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneAcknowledged, setMilestoneAcknowledged] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTimeSaved();
  }, [plan, days, householdId]);

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

  const dismissMilestone = () => {
    setShowMilestone(false);
    setMilestoneAcknowledged(true);
  };

  const handleShare = async () => {
    if (!result) return;
    const topFactors = result.factors.slice(0, 3).map(f => `• ${f.label}: ${f.minutesSaved} min`).join("\n");
    const text = [
      `🕐 My family got ${formatHours(result.totalMinutesSaved)} back last week with Family Food OS!`,
      "",
      topFactors,
      "",
      `📊 ${formatHours(cumulativeMinutes)} saved total across ${totalWeeks} week${totalWeeks !== 1 ? "s" : ""}.`,
      "",
      humanRewards.length > 0 ? humanRewards.map(r => `${r.emoji} ${r.text}`).join("\n") : "",
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "My Weekly Time Saved", text });
      } catch (e: any) {
        if (e.name !== "AbortError") {
          toast({ variant: "destructive", title: "Share failed", description: e.message });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!", description: "Paste it anywhere to share your recap." });
      } catch {
        toast({ variant: "destructive", title: "Could not copy to clipboard" });
      }
    }
  };

  if (!result || result.totalMinutesSaved === 0) return null;

  const milestone = getMilestone(cumulativeMinutes);
  const avgMinutes = totalWeeks > 0 ? Math.round(cumulativeMinutes / totalWeeks) : 0;
  const maxBarValue = Math.max(...result.breakdown.map(b => b.withoutApp));
  const plannedNights = days.filter(d => d.meal_name).length;
  const humanRewards = getHumanRewards(result.totalMinutesSaved, plannedNights);
  const cumulativeMessage = getCumulativeMessage(cumulativeMinutes);
  const yearlyProjection = getYearlyProjection(avgMinutes);

  // Find biggest saving source
  const biggestFactor = result.factors.length > 0
    ? result.factors.reduce((a, b) => b.minutesSaved > a.minutesSaved ? b : a)
    : null;

  const confettiColors = [
    "hsl(var(--primary))",
    "hsl(var(--sage))",
    "hsl(var(--warm))",
    "hsl(var(--primary) / 0.6)",
    "hsl(var(--sage-dark))",
  ];

  // Cumulative progress toward next milestone
  const cumulativeHours = cumulativeMinutes / 60;
  const nextMilestoneHours = [10, 25, 50, 100].find(h => h > cumulativeHours) || 100;
  const prevMilestoneHours = [0, 10, 25, 50].reverse().find(h => h < nextMilestoneHours) || 0;
  const progressPct = Math.min(100, Math.round(((cumulativeHours - prevMilestoneHours) / (nextMilestoneHours - prevMilestoneHours)) * 100));

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
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-sage-light/40 to-warm-light/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.85] }}
                transition={{ duration: 1.5 }}
              />
              <motion.div
                className="absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.15) 0%, transparent 60%)" }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <ConfettiParticle key={i} delay={i * 0.08} x={10 + (i * 4.5)} color={confettiColors[i % confettiColors.length]} />
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative z-20 text-center px-6 py-10 max-w-sm"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20"
                >
                  <Award className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-xs uppercase tracking-widest text-primary/80 font-medium mb-2">Milestone Reached</p>
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-3">{milestone.label} saved</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{milestone.message}</p>
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

        <CardContent className="pt-8 pb-6 px-5 sm:px-8">
          {/* ── LAYER 1: WEEKLY WIN ── */}
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
            <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              This estimate is based on your actual weekly plan, grocery automation, leftovers, takeout planning, and dinner check-ins.
            </p>
          </motion.div>

          {/* ── KPI CARDS ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
          >
            <KpiCard
              icon={Clock}
              value={formatHours(result.totalMinutesSaved)}
              label="Saved last week"
              sublabel={`from ${plannedNights} planned meals`}
              accent={false}
              delay={0.35}
            />
            <KpiCard
              icon={TrendingUp}
              value={formatHours(cumulativeMinutes)}
              label="Total time back"
              sublabel={`across ${totalWeeks} week${totalWeeks !== 1 ? "s" : ""}`}
              accent={false}
              delay={0.4}
            />
            {totalWeeks >= 3 && biggestFactor ? (
              <KpiCard
                icon={Zap}
                value={`${biggestFactor.minutesSaved} min`}
                label="Biggest source"
                sublabel={biggestFactor.label.length > 50 ? biggestFactor.label.slice(0, 47) + "…" : biggestFactor.label}
                accent
                delay={0.45}
              />
            ) : (
              <KpiCard
                icon={Zap}
                value={yearlyProjection}
                label="Projected yearly savings"
                sublabel="At this pace, per year"
                accent
                delay={0.45}
              />
            )}
          </motion.div>

          {/* ── LAYER 2: WHERE THE TIME CAME FROM ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <div className="rounded-xl border border-border/50 bg-background/70 backdrop-blur-sm p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Where your time came from
              </h3>
              <div className="space-y-3">
                {result.factors.map((factor, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span className="text-sm text-foreground/85 leading-snug">{factor.label}</span>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-primary tabular-nums">
                      {factor.minutesSaved} min
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── LAYER 3: HUMAN REWARD ── */}
          {humanRewards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62 }}
              className="mb-6"
            >
              <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-warm" />
                  What that time turned into
                </h3>
                <div className="space-y-2.5">
                  {humanRewards.map((reward, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.66 + i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-lg shrink-0">{reward.emoji}</span>
                      <span className="text-sm text-foreground/85 leading-snug">{reward.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── LAYER 4: CUMULATIVE PROGRESS ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            className="mb-6"
          >
            <div className="rounded-xl border border-border/50 bg-background/60 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  Cumulative progress
                </h3>
                <span className="text-xs text-muted-foreground">
                  Next: {nextMilestoneHours}h
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-semibold text-foreground mb-1">
                {formatHours(cumulativeMinutes)}{" "}
                <span className="text-base font-normal text-muted-foreground">saved total</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {cumulativeMessage}
              </p>
              <Progress value={progressPct} className="h-2" />
              <p className="text-[11px] text-muted-foreground/60 mt-1.5 text-right">
                {progressPct}% to {nextMilestoneHours}-hour milestone
              </p>
            </div>
          </motion.div>

          {/* ── COMPARISON CHART (expandable) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.78 }}
            className="mb-4"
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
                          <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> With Family Food OS
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

          {/* ── METHODOLOGY / TRANSPARENCY ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.82 }}
            className="mb-6"
          >
            <Collapsible open={showMethodology} onOpenChange={setShowMethodology}>
              <CollapsibleTrigger className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors py-1">
                <Info className="w-3 h-3" />
                How we estimate this
                {showMethodology ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="rounded-xl border border-border/30 bg-background/50 p-4 mt-2 text-xs text-muted-foreground leading-relaxed space-y-2">
                  <p>Our estimates are based on research into weekly household meal planning time. Here's how each factor contributes:</p>
                  <ul className="space-y-1.5 ml-1">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      <span><strong>Planned dinners</strong> reduce decision time — families spend ~6 min/day deciding what to cook.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      <span><strong>Auto-generated grocery lists</strong> eliminate manual list building and reduce forgotten items.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      <span><strong>Ingredient overlap</strong> across meals simplifies shopping trips and reduces waste.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      <span><strong>Leftover and takeout planning</strong> reduces extra cooking and prevents last-minute scrambling.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                      <span><strong>Dinner Check-Ins</strong> help the system learn your preferences, reducing replanning over time.</span>
                    </li>
                  </ul>
                  <p className="pt-1 text-muted-foreground/60 italic">
                    This is an estimate based on your weekly plan and activity, not a stopwatch measurement.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88 }}
            className="flex flex-col items-center gap-4 mt-2"
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
                  Generate this week's plan
                </>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onViewDetails}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                View last week's details
              </Button>
              <Button
                variant="ghost"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share recap
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function KpiCard({
  icon: Icon,
  value,
  label,
  sublabel,
  accent,
  delay,
}: {
  icon: typeof Clock;
  value: string;
  label: string;
  sublabel: string;
  accent: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <div className={`rounded-xl border bg-background/70 backdrop-blur-sm p-3 sm:p-4 text-center ${
        accent ? "border-primary/20 bg-primary/[0.03]" : "border-border/40"
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
          accent ? "bg-primary/15" : "bg-primary/10"
        }`}>
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-lg sm:text-xl font-serif font-bold text-foreground leading-tight">{value}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{label}</p>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 mt-0.5 leading-tight line-clamp-2">{sublabel}</p>
      </div>
    </motion.div>
  );
}

export default TimeSavedRecap;
