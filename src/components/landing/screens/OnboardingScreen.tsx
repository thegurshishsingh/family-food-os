import { Users, Salad, Wallet, Check, ChevronRight } from "lucide-react";

const MEMBERS = [
  { name: "You", tag: "No restrictions" },
  { name: "Maya", tag: "Vegetarian" },
  { name: "Leo (7)", tag: "Picky · mild only" },
];

const DIET = ["Vegetarian", "Nut-free", "Low-spice", "High-protein"];

export const OnboardingScreen = () => (
  <div className="px-3.5 pt-1 pb-2">
    {/* Progress */}
    <div className="flex items-center gap-1.5 mb-3">
      {[true, true, false].map((done, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${done ? "bg-primary" : "bg-muted"}`}
        />
      ))}
    </div>
    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Step 2 of 3</p>
    <h3 className="text-[16px] font-serif font-semibold text-foreground leading-tight mb-3">
      Who's at the table?
    </h3>

    {/* Household */}
    <div className="rounded-xl border border-border/50 bg-background/60 p-2.5 mb-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Users className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-bold text-foreground">Household</span>
      </div>
      <div className="space-y-1.5">
        {MEMBERS.map((m) => (
          <div key={m.name} className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground">{m.name}</span>
            <span className="text-[9px] text-muted-foreground">{m.tag}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Diet chips */}
    <div className="rounded-xl border border-border/50 bg-background/60 p-2.5 mb-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Salad className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-bold text-foreground">Diet & exclusions</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {DIET.map((d, i) => (
          <span
            key={d}
            className={`inline-flex items-center gap-0.5 px-1.5 py-[3px] rounded-full text-[9px] font-semibold ${
              i < 2 ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/60 text-muted-foreground"
            }`}
          >
            {i < 2 && <Check className="w-2 h-2" />}
            {d}
          </span>
        ))}
      </div>
    </div>

    {/* Budget */}
    <div className="rounded-xl border border-border/50 bg-background/60 p-2.5 mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Wallet className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-bold text-foreground">Weekly budget</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted relative">
        <div className="absolute inset-y-0 left-0 w-[58%] rounded-full bg-gradient-to-r from-primary to-sage-dark" />
        <div className="absolute top-1/2 left-[58%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-card border-2 border-primary" />
      </div>
      <p className="text-[9px] text-muted-foreground mt-1.5">~$140 / week</p>
    </div>

    <div className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary to-sage-dark py-2.5">
      <span className="text-[11px] font-bold text-primary-foreground">Decide the week for me</span>
      <ChevronRight className="w-3 h-3 text-primary-foreground" />
    </div>
  </div>
);

export default OnboardingScreen;
