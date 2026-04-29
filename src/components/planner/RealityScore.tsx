import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, ChefHat, Clock, DollarSign, Zap, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { WeeklyPlan, PlanDay } from "./types";

interface RealityScoreProps {
  plan: WeeklyPlan;
  days?: PlanDay[];
}

function getScoreTier(score: number) {
  if (score >= 80) return { label: "Very Realistic", color: "text-primary", bg: "bg-primary", barColor: "bg-primary" };
  if (score >= 60) return { label: "Moderate", color: "text-amber-600", bg: "bg-amber-500", barColor: "bg-amber-500" };
  return { label: "Ambitious", color: "text-destructive", bg: "bg-destructive", barColor: "bg-destructive" };
}

function computeBreakdown(days: PlanDay[]) {
  if (!days.length) return null;

  const cookDays = days.filter(d => d.meal_mode === "cook");
  const totalPrepMin = cookDays.reduce((s, d) => s + (d.prep_time_minutes || 0), 0);
  const avgPrep = cookDays.length ? Math.round(totalPrepMin / cookDays.length) : 0;
  const cookRatio = Math.round((cookDays.length / days.length) * 100);
  const takeoutDays = days.filter(d => ["takeout", "dine_out"].includes(d.meal_mode)).length;
  const avgCal = Math.round(days.reduce((s, d) => s + (d.calories || 0), 0) / days.length);

  return [
    { icon: ChefHat, label: "Cook nights", value: `${cookDays.length} of ${days.length}`, detail: `${cookRatio}%` },
    { icon: Clock, label: "Avg prep (cook)", value: `${avgPrep} min`, detail: avgPrep <= 25 ? "Quick" : avgPrep <= 40 ? "Medium" : "Long" },
    { icon: Zap, label: "Convenience nights", value: `${takeoutDays + days.filter(d => d.meal_mode === "leftovers" || d.meal_mode === "emergency").length}`, detail: "takeout + leftovers" },
    { icon: DollarSign, label: "Avg calories", value: `${avgCal.toLocaleString()}`, detail: "per day" },
  ];
}

const SCORE_FACTORS = [
  { label: "Cook-to-convenience ratio", desc: "Balancing home-cooked meals with realistic takeout/leftover nights" },
  { label: "Prep time vs. tolerance", desc: "Whether cook times match your household's stated comfort level" },
  { label: "Variety & repetition", desc: "Cuisine diversity without overwhelming the week" },
  { label: "Nutritional balance", desc: "Calorie and macro spread across the full week" },
  { label: "Family context", desc: "Adjustments for household size, children's ages, and weekly context flags" },
];

type Reason = { icon: typeof ChefHat; label: string; tone: "good" | "warn" | "bad" };

function buildReasons(days: PlanDay[]): Reason[] {
  if (!days.length) return [];
  const cookDays = days.filter(d => d.meal_mode === "cook");
  const cookRatio = cookDays.length / days.length;
  const cookPct = Math.round(cookRatio * 100);
  const preps = cookDays.map(d => d.prep_time_minutes || 0).filter(p => p > 0);
  const avgPrep = preps.length ? Math.round(preps.reduce((a, b) => a + b, 0) / preps.length) : 0;

  const reasons: Reason[] = [];

  // 1. Cook balance
  if (cookRatio >= 0.4 && cookRatio <= 0.75) {
    reasons.push({ icon: ChefHat, label: `Cook balance is realistic — ${cookDays.length} cook nights, ${days.length - cookDays.length} convenience.`, tone: "good" });
  } else if (cookRatio > 0.75) {
    reasons.push({ icon: ChefHat, label: `Cook-heavy week — ${cookPct}% of nights require cooking.`, tone: "warn" });
  } else {
    reasons.push({ icon: ChefHat, label: `Light on cooking — only ${cookDays.length} cook night${cookDays.length === 1 ? "" : "s"} this week.`, tone: "warn" });
  }

  // 2. Prep time
  if (avgPrep === 0) {
    reasons.push({ icon: Clock, label: `No prep time data on cook nights yet.`, tone: "warn" });
  } else if (avgPrep <= 25) {
    reasons.push({ icon: Clock, label: `Quick prep — averaging ${avgPrep} min per cook night.`, tone: "good" });
  } else if (avgPrep <= 40) {
    reasons.push({ icon: Clock, label: `Moderate prep — averaging ${avgPrep} min per cook night.`, tone: "good" });
  } else {
    reasons.push({ icon: Clock, label: `Longer prep — ${avgPrep} min average; some weeknights may feel heavy.`, tone: "bad" });
  }

  // 3. One learning / context / variety reason — pick the most relevant
  const cuisines = cookDays.map(d => d.cuisine_type).filter(Boolean) as string[];
  const uniqueCuisines = new Set(cuisines).size;
  let consecutiveRepeats = 0;
  for (let i = 1; i < days.length; i++) {
    const a = days[i - 1].cuisine_type, b = days[i].cuisine_type;
    if (a && b && a === b) consecutiveRepeats++;
  }
  const leftoverCount = days.filter(d => d.meal_mode === "leftovers").length;
  const takeoutCount = days.filter(d => d.meal_mode === "takeout" || d.meal_mode === "dine_out").length;

  if (consecutiveRepeats > 0) {
    reasons.push({ icon: Sparkles, label: `Same cuisine on back-to-back nights — variety could be stronger.`, tone: "warn" });
  } else if (cookDays.length >= 4 && uniqueCuisines / cookDays.length >= 0.75) {
    reasons.push({ icon: Sparkles, label: `Strong cuisine variety — ${uniqueCuisines} different cuisines across cook nights.`, tone: "good" });
  } else if (leftoverCount > 0 && takeoutCount > 0) {
    reasons.push({ icon: Sparkles, label: `Smart mix of ${leftoverCount} leftover and ${takeoutCount} takeout night${takeoutCount === 1 ? "" : "s"} for breathing room.`, tone: "good" });
  } else if (avgPrep > 40 && cookRatio > 0.6) {
    reasons.push({ icon: Sparkles, label: `Plan adapts well to your tolerance, but consider one swap if energy dips.`, tone: "warn" });
  } else {
    reasons.push({ icon: Sparkles, label: `Plan reflects your recent feedback and household context.`, tone: "good" });
  }

  return reasons;
}

const TONE_CLASSES: Record<Reason["tone"], string> = {
  good: "text-primary",
  warn: "text-amber-600",
  bad: "text-destructive",
};

const RealityScore = ({ plan, days = [] }: RealityScoreProps) => {
  const [showFactors, setShowFactors] = useState(false);

  if (plan.reality_score === null) return null;

  const score = plan.reality_score || 0;
  const tier = getScoreTier(score);
  const isLow = score < 60;
  const breakdown = computeBreakdown(days);
  const reasons = buildReasons(days);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`mb-6 ${isLow ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-sage-light"}`}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3 mb-3">
            {isLow ? (
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            ) : (
              <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm text-foreground">Reality Score</p>
                  <button
                    onClick={() => setShowFactors((v) => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors rounded-full"
                    aria-label="What factors into this score?"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${tier.color}`}>{tier.label}</span>
                  <span className="text-lg font-bold text-foreground tabular-nums">{score}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${tier.barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>

              {/* Expandable factors */}
              <AnimatePresence>
                {showFactors && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3 rounded-lg bg-background/60 border border-border/40 space-y-2">
                      <p className="text-xs font-semibold text-foreground mb-1.5">What factors into this score</p>
                      {SCORE_FACTORS.map((f) => (
                        <div key={f.label} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-foreground leading-tight">{f.label}</p>
                            <p className="text-[11px] text-muted-foreground leading-snug">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {plan.reality_message && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{plan.reality_message}</p>
              )}
            </div>
          </div>

          {/* Breakdown metrics */}
          {breakdown && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border/40">
              {breakdown.map((metric) => (
                <div key={metric.label} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                    <metric.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground leading-tight">{metric.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight truncate">{metric.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RealityScore;
