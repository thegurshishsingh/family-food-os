import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Calendar,
  Brain,
  TrendingUp,
  Recycle,
  Check,
  X,
  Utensils,
  Package,
  Store,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/* ── Punchy 3-row comparison ────────────────────────────── */
const COMPARE = [
  {
    outcome: "Plans for your real life",
    them: "7 random recipes every week",
    us: "A structured week: cook, leftovers, takeout & dine-out nights",
  },
  {
    outcome: "Learns from your actual dinners",
    them: "Starts fresh — forgets everything",
    us: "Tracks what worked and adapts next week automatically",
  },
  {
    outcome: "Cuts decision fatigue",
    them: "You still decide what, when & how",
    us: "One tap on Sunday, dinner handled all week",
  },
];

/* ── Visual metaphor: recipe grid vs structured week ───── */
const RecipeGridMock = () => (
  <div className="space-y-2">
    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
      Typical recipe app
    </p>
    <div className="grid grid-cols-3 gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-lg bg-muted/60 border border-border/30 flex items-center justify-center"
        >
          <Utensils className="w-3 h-3 text-muted-foreground/30" />
        </div>
      ))}
    </div>
    <p className="text-[9px] text-muted-foreground/50 italic text-center mt-1">
      "Pick one... any one... 😩"
    </p>
  </div>
);

const StructuredWeekMock = () => {
  const days = [
    { day: "Mon", icon: Utensils, mode: "Cook", g: "from-primary to-sage-dark" },
    { day: "Tue", icon: Package, mode: "Leftover", g: "from-sky to-primary" },
    { day: "Wed", icon: Store, mode: "Takeout", g: "from-accent to-coral" },
    { day: "Thu", icon: Utensils, mode: "Cook", g: "from-primary to-sage-dark" },
    { day: "Fri", icon: UtensilsCrossed, mode: "Dine out", g: "from-violet to-primary" },
    { day: "Sat", icon: Utensils, mode: "Cook", g: "from-primary to-sage-dark" },
    { day: "Sun", icon: Package, mode: "Leftover", g: "from-sky to-primary" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
        Family Food OS
      </p>
      <div className="space-y-1">
        {days.map((d) => (
          <div key={d.day} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground w-7">
              {d.day}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-primary-foreground bg-gradient-to-r ${d.g}`}
            >
              <d.icon className="w-2 h-2" />
              {d.mode}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-primary/70 font-semibold text-center mt-1">
        Every day handled ✓
      </p>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────── */
const WhyDifferent = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-14 md:py-20 px-4 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] rounded-full bg-gradient-to-tl from-violet/5 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-3 tracking-tight leading-[1.1]">
            Week-first vs recipe-first
          </h2>
          <p className="text-muted-foreground/80 text-base max-w-lg mx-auto leading-relaxed">
            Recipe apps give you ingredients. We give you a dinner system that runs your week.
          </p>
        </motion.div>

        {/* Visual metaphor: side by side */}
        <motion.div
          className="grid grid-cols-2 gap-4 md:gap-6 max-w-md mx-auto mb-10"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={1}
        >
          <div className="rounded-2xl border border-border/40 bg-muted/20 p-4">
            <RecipeGridMock />
          </div>
          <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/15 via-sky/10 to-transparent pointer-events-none" />
            <div className="relative">
              <StructuredWeekMock />
            </div>
          </div>
        </motion.div>

        {/* Comparison rows */}
        <motion.div
          className="rounded-2xl overflow-hidden border border-border/30 bg-background/95 backdrop-blur-sm shadow-xl mb-10"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={2}
        >
          {/* Header row */}
          <div className="grid grid-cols-[1fr,1fr,1fr] text-center border-b border-border/30">
            <div className="px-4 py-3">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.15em]">
                What matters
              </span>
            </div>
            <div className="px-4 py-3 border-x border-border/20">
              <span className="text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-[0.15em]">
                Other apps
              </span>
            </div>
            <div className="px-4 py-3 bg-primary/[0.04]">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.15em]">
                Family Food OS
              </span>
            </div>
          </div>

          {COMPARE.map((row, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-[1fr,1fr,1fr] border-b border-border/15 last:border-b-0"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              {/* Outcome */}
              <div className="px-4 py-3.5 flex items-center">
                <span className="text-sm font-semibold text-foreground leading-snug">
                  {row.outcome}
                </span>
              </div>
              {/* Them */}
              <div className="px-4 py-3.5 flex items-start gap-2 border-x border-border/15">
                <div className="w-4 h-4 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-2.5 h-2.5 text-destructive/60" />
                </div>
                <span className="text-xs text-muted-foreground leading-snug">
                  {row.them}
                </span>
              </div>
              {/* Us */}
              <div className="px-4 py-3.5 flex items-start gap-2 bg-primary/[0.03]">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-sky flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
                <span className="text-xs text-foreground font-medium leading-snug">
                  {row.us}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reality Score callout */}
        <motion.div
          className="relative rounded-2xl border border-violet/20 bg-background/95 backdrop-blur-sm p-5 md:p-6 mb-10 max-w-2xl mx-auto"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={3}
        >
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-violet/15 via-primary/10 to-transparent pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet to-primary flex items-center justify-center shrink-0 shadow-md">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-foreground mb-1 flex items-center gap-2">
                Reality Score™
                <span className="text-[10px] font-bold text-violet bg-violet/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Unique
                </span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Shows how realistic your week is for your actual life — and nudges you if you're over-committing.
                Planning 6 cook nights with a newborn? We'll gently suggest&hellip; don't.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Leftovers strategy callout */}
        <motion.div
          className="relative rounded-2xl border border-sky/20 bg-background/95 backdrop-blur-sm p-5 md:p-6 max-w-2xl mx-auto"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={4}
        >
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-sky/15 via-primary/10 to-transparent pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky to-primary flex items-center justify-center shrink-0 shadow-md">
              <Recycle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-foreground mb-1">
                Leftovers are a strategy, not an afterthought
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Monday's roast becomes Wednesday's tacos. Your grocery list auto-adjusts — buy once, eat twice.
                Less waste, less spending, less stress.
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky/10 text-sky font-semibold">
                  <Package className="w-3 h-3" /> 2 leftover nights/week
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                  <Sparkles className="w-3 h-3" /> Grocery list adapts
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyDifferent;
