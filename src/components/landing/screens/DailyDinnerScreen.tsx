import { Utensils, Clock, Flame, Check } from "lucide-react";

export const DailyDinnerScreen = () => (
  <div className="px-3.5 pt-1 pb-2">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Tonight · Tuesday</p>
        <h3 className="text-[16px] font-serif font-semibold text-foreground leading-tight">What's for dinner</h3>
      </div>
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-coral/15 text-[8px] font-bold text-coral">
        <Flame className="w-2.5 h-2.5" /> 5-day streak
      </span>
    </div>

    {/* Hero meal card */}
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-background/60 mb-3">
      <div className="h-20 bg-gradient-to-br from-primary/20 via-sage/20 to-accent/20 flex items-center justify-center">
        <div className="w-11 h-11 rounded-2xl bg-card/80 backdrop-blur-sm flex items-center justify-center">
          <Utensils className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[12px] font-bold text-foreground leading-tight">Chicken grain bowls</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-muted-foreground">
            <Clock className="w-2.5 h-2.5" /> 10 min · leftovers
          </span>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full bg-sky/15 text-[7px] font-bold uppercase text-sky">
            Reuses Mon
          </span>
        </div>
      </div>
    </div>

    {/* Check-in */}
    <p className="text-[10px] font-bold text-foreground mb-1.5">How did tonight go?</p>
    <div className="flex flex-wrap gap-1">
      {[
        { label: "Cooked it", on: true },
        { label: "Everyone liked it", on: true },
        { label: "Too much work", on: false },
      ].map((c) => (
        <span
          key={c.label}
          className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[9px] font-semibold ${
            c.on ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/60 text-muted-foreground"
          }`}
        >
          {c.on && <Check className="w-2.5 h-2.5" />}
          {c.label}
        </span>
      ))}
    </div>
  </div>
);

export default DailyDinnerScreen;
