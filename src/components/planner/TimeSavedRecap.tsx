import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Calendar, ArrowRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
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

const TimeSavedRecap = ({ plan, days, householdId, onGeneratePlan, onViewDetails, generating }: TimeSavedRecapProps) => {
  const [result, setResult] = useState<TimeSavedResult | null>(null);
  const [cumulativeMinutes, setCumulativeMinutes] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    loadTimeSaved();
  }, [plan, days, householdId]);

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
    // Estimate cumulative as avg * weeks (since we don't persist per-week yet)
    setCumulativeMinutes(computed.totalMinutesSaved * weeks);
  };

  if (!result || result.totalMinutesSaved === 0) return null;

  const avgMinutes = totalWeeks > 0 ? Math.round(cumulativeMinutes / totalWeeks) : 0;
  const maxBarValue = Math.max(...result.breakdown.map(b => b.withoutApp));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      {/* Main recap card */}
      <Card className="border-primary/15 bg-gradient-to-br from-sage-light/60 via-card to-warm-light/30 overflow-hidden">
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
              You saved{" "}
              <span className="text-primary">{formatHours(result.totalMinutesSaved)}</span>
              {" "}last week.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-3 max-w-lg mx-auto leading-relaxed">
              Family Food OS reduced planning, shopping, and coordination time based on the meals your family actually made.
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
            <div className="rounded-xl border border-border/50 bg-background/70 backdrop-blur-sm p-4 sm:p-5 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Why you saved time
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
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
          >
            <Button
              onClick={onGeneratePlan}
              disabled={generating}
              size="lg"
              className="gap-2 w-full sm:w-auto text-base px-8"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Generate this week's plan
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={onViewDetails}
              className="text-muted-foreground hover:text-foreground text-sm"
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
