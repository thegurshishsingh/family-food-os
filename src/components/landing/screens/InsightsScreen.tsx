import { Brain, TrendingUp, Heart, X } from "lucide-react";

const LEARNINGS = [
  { icon: Heart, text: "Kids loved the taco bar — saved to favorites", cls: "text-primary bg-primary/10" },
  { icon: X, text: "Spicy curry got refused — dialing heat down", cls: "text-coral bg-coral/15" },
  { icon: TrendingUp, text: "Wednesday takeout keeps the week realistic", cls: "text-sky bg-sky/15" },
];

export const InsightsScreen = () => (
  <div className="px-3.5 pt-1 pb-2">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center">
        <Brain className="w-4 h-4 text-primary-foreground" />
      </div>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Week 6</p>
        <h3 className="text-[15px] font-serif font-semibold text-foreground leading-tight">What we learned</h3>
      </div>
    </div>

    <div className="space-y-2 mb-3">
      {LEARNINGS.map((l) => (
        <div key={l.text} className="flex items-start gap-2 rounded-xl border border-border/50 bg-background/60 px-2.5 py-2">
          <span className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${l.cls}`}>
            <l.icon className="w-2.5 h-2.5" />
          </span>
          <p className="text-[10px] font-medium text-foreground leading-snug">{l.text}</p>
        </div>
      ))}
    </div>

    <div className="rounded-xl bg-primary/[0.06] border border-primary/15 px-2.5 py-2">
      <p className="text-[10px] font-semibold text-foreground leading-snug">
        Next week's plan is already adapting to your family.
      </p>
    </div>
  </div>
);

export default InsightsScreen;
