import { TrendingUp, Info, ChefHat, Clock, Sparkles, Utensils, Zap, Flame } from "lucide-react";

const WHY = [
  { icon: ChefHat, text: "Cook-heavy week — 86% of nights require cooking." },
  { icon: Clock, text: "Quick prep — averaging 17 min per cook night." },
  { icon: Sparkles, text: "Strong cuisine variety — 5 cuisines across cook nights." },
];

const STATS = [
  { icon: Utensils, value: "6 of 7", label: "Cook nights" },
  { icon: Clock, value: "17 min", label: "Avg prep (cook)" },
  { icon: Zap, value: "1", label: "Convenience night" },
  { icon: Flame, value: "1,157", label: "Avg calories" },
];

/**
 * RealityScoreScreen — mirrors the in-app Reality Score card: the metric the
 * whole plan is graded on. Tuned to look like a real screenshot of the app.
 */
export const RealityScoreScreen = () => (
  <div className="px-3.5 pt-1 pb-2">
    {/* Header */}
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-accent" />
        <span className="text-[13px] font-bold text-foreground">Reality Score</span>
        <Info className="w-2.5 h-2.5 text-muted-foreground/60" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[10px] font-bold text-accent">Moderate</span>
        <span className="text-[18px] font-bold text-foreground tabular-nums leading-none">68</span>
        <span className="text-[9px] text-muted-foreground">/100</span>
      </div>
    </div>

    {/* Progress bar */}
    <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden mb-3">
      <div className="h-full rounded-full bg-accent" style={{ width: "68%" }} />
    </div>

    {/* Summary */}
    <p className="text-[10px] text-muted-foreground leading-snug mb-3">
      Highly realistic for a solo-parenting week. Every meal is soft-textured for
      baby's safety, zero red meat, prep under 25 minutes. Tuesday's takeout is a
      strategic energy saver.
    </p>

    {/* Why this score */}
    <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
      Why this score
    </p>
    <div className="space-y-1.5 mb-3">
      {WHY.map((w) => (
        <div key={w.text} className="flex items-start gap-1.5">
          <w.icon className="w-2.5 h-2.5 text-primary mt-0.5 shrink-0" />
          <p className="text-[9.5px] font-medium text-foreground leading-snug">{w.text}</p>
        </div>
      ))}
    </div>

    {/* Stat grid */}
    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border/40">
      {STATS.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
            <s.icon className="w-3 h-3 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-foreground leading-none">{s.value}</p>
            <p className="text-[8px] text-muted-foreground leading-tight truncate">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RealityScoreScreen;
