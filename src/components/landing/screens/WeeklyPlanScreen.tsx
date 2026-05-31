import { Utensils, Package, Bike, UtensilsCrossed, TrendingUp } from "lucide-react";

type Mode = "cook" | "leftovers" | "takeout" | "dineout";

const MODES: Record<Mode, { label: string; icon: typeof Utensils; cls: string }> = {
  cook: { label: "Cook", icon: Utensils, cls: "bg-primary/10 text-primary" },
  leftovers: { label: "Leftovers", icon: Package, cls: "bg-sky/15 text-sky" },
  takeout: { label: "Takeout", icon: Bike, cls: "bg-coral/15 text-coral" },
  dineout: { label: "Dine out", icon: UtensilsCrossed, cls: "bg-accent/20 text-accent-foreground" },
};

const DAYS: { day: string; mode: Mode; meal: string; time: string; today?: boolean }[] = [
  { day: "Mon", mode: "cook", meal: "Sheet-pan chicken & veg", time: "30 min" },
  { day: "Tue", mode: "leftovers", meal: "Chicken grain bowls", time: "10 min", today: true },
  { day: "Wed", mode: "takeout", meal: "Thai green curry", time: "Order in" },
  { day: "Thu", mode: "cook", meal: "15-min garlic pasta", time: "15 min" },
  { day: "Fri", mode: "dineout", meal: "Pizza night out", time: "Booked" },
  { day: "Sat", mode: "cook", meal: "Family taco bar", time: "25 min" },
  { day: "Sun", mode: "cook", meal: "Roast & potatoes", time: "50 min" },
];

const RealityRing = ({ score = 84 }: { score?: number }) => {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[12px] font-bold text-foreground leading-none">{score}</span>
      </div>
    </div>
  );
};

export const WeeklyPlanScreen = () => (
  <div className="px-3.5 pt-1 pb-2">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">This week</p>
        <h3 className="text-[16px] font-serif font-semibold text-foreground leading-tight">Your dinner plan</h3>
      </div>
      <div className="flex flex-col items-center">
        <RealityRing score={84} />
        <span className="mt-0.5 inline-flex items-center gap-0.5 text-[7px] font-bold text-primary">
          <TrendingUp className="w-2 h-2" /> REALITY
        </span>
      </div>
    </div>

    <div className="space-y-1.5">
      {DAYS.map((d) => {
        const m = MODES[d.mode];
        const Icon = m.icon;
        return (
          <div
            key={d.day}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-2 border ${
              d.today ? "border-primary/30 bg-primary/[0.06]" : "border-border/50 bg-background/60"
            }`}
          >
            <span className="w-7 text-[10px] font-bold text-muted-foreground shrink-0">{d.day}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate leading-tight">{d.meal}</p>
              <span className={`mt-0.5 inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[7px] font-bold uppercase ${m.cls}`}>
                <Icon className="w-2 h-2" />
                {m.label}
              </span>
            </div>
            <span className="text-[8px] font-semibold text-muted-foreground/70 shrink-0">{d.time}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default WeeklyPlanScreen;
