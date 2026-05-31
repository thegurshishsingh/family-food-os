import { Clock, Wallet, Trash2, Sparkles } from "lucide-react";

const STATS = [
  { icon: Clock, value: "2.5 hrs", label: "Saved this week", cls: "from-primary to-sage-dark" },
  { icon: Wallet, value: "$72", label: "Less on takeout", cls: "from-sky to-primary" },
  { icon: Trash2, value: "−40%", label: "Food wasted", cls: "from-coral to-accent" },
];

export const SavingsScreen = () => (
  <div className="px-3.5 pt-1 pb-2">
    <div className="text-center mb-3">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[8px] font-bold uppercase tracking-wider text-primary mb-1.5">
        <Sparkles className="w-2.5 h-2.5" /> Weekly recap
      </span>
      <h3 className="text-[16px] font-serif font-semibold text-foreground leading-tight">
        Here's what the system gave back
      </h3>
    </div>

    <div className="space-y-2 mb-3">
      {STATS.map((s) => (
        <div key={s.label} className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/60 px-2.5 py-2.5">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.cls} flex items-center justify-center shrink-0`}>
            <s.icon className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-[17px] font-bold text-foreground leading-none">{s.value}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="rounded-xl bg-primary/[0.06] border border-primary/15 px-2.5 py-2">
      <p className="text-[10px] font-semibold text-foreground leading-snug">
        That's 5 fewer "what's for dinner?" spirals — and a calmer week.
      </p>
    </div>
  </div>
);

export default SavingsScreen;
