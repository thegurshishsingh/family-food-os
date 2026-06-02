import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, animate, useReducedMotion } from "framer-motion";
import {
  Utensils,
  Package,
  Bike,
  UtensilsCrossed,
  TrendingUp,
  Sparkles,
  Hand,
  Check,
  Clock,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { PhoneFrame } from "./screens";
import { FloatingStatCard } from "./primitives";
import { cn } from "@/lib/utils";

/* ── Meal modes ────────────────────────────────────────────────────────── */

type Mode = "cook" | "leftovers" | "takeout" | "dineout";

const MODE_META: Record<Mode, { label: string; icon: typeof Utensils; cls: string }> = {
  cook: { label: "Cook", icon: Utensils, cls: "bg-primary/10 text-primary" },
  leftovers: { label: "Leftovers", icon: Package, cls: "bg-sky/15 text-sky" },
  takeout: { label: "Takeout", icon: Bike, cls: "bg-coral/15 text-coral" },
  dineout: { label: "Dine out", icon: UtensilsCrossed, cls: "bg-accent/20 text-accent-foreground" },
};

type Option = { mode: Mode; meal: string; prep: number; time: string };

type DayPlan = { day: string; options: Option[] };

/* Each night offers a few realistic swaps across modes. */
const DAYS: DayPlan[] = [
  {
    day: "Mon",
    options: [
      { mode: "cook", meal: "Sheet-pan chicken & veg", prep: 30, time: "30 min" },
      { mode: "leftovers", meal: "Chicken grain bowls", prep: 10, time: "10 min" },
      { mode: "takeout", meal: "Thai green curry", prep: 0, time: "Order in" },
    ],
  },
  {
    day: "Tue",
    options: [
      { mode: "leftovers", meal: "Taco salad bowls", prep: 8, time: "8 min" },
      { mode: "cook", meal: "15-min garlic pasta", prep: 15, time: "15 min" },
      { mode: "takeout", meal: "Sushi platter", prep: 0, time: "Order in" },
    ],
  },
  {
    day: "Wed",
    options: [
      { mode: "takeout", meal: "Burrito bowls", prep: 0, time: "Order in" },
      { mode: "cook", meal: "Family taco bar", prep: 25, time: "25 min" },
      { mode: "dineout", meal: "Pizza night out", prep: 0, time: "Booked" },
    ],
  },
  {
    day: "Thu",
    options: [
      { mode: "cook", meal: "Salmon & rice", prep: 25, time: "25 min" },
      { mode: "leftovers", meal: "Taco bowls, round 2", prep: 7, time: "7 min" },
      { mode: "takeout", meal: "Ramen delivery", prep: 0, time: "Order in" },
    ],
  },
  {
    day: "Fri",
    options: [
      { mode: "dineout", meal: "Dinner out", prep: 0, time: "Booked" },
      { mode: "cook", meal: "Homemade pizza", prep: 35, time: "35 min" },
      { mode: "takeout", meal: "Friday pizza", prep: 0, time: "Order in" },
    ],
  },
];

/* Sensible starting mix → a believable ~78 score. */
const DEFAULT_SELECTION = [0, 0, 0, 0, 0];

/* ── Reality scoring ───────────────────────────────────────────────────── */

function scorePlan(selected: number[]) {
  const chosen = selected.map((idx, d) => DAYS[d].options[idx]);
  const cookNights = chosen.filter((c) => c.mode === "cook").length;
  const totalPrep = chosen.reduce((s, c) => s + c.prep, 0);
  const variety = new Set(chosen.map((c) => c.mode)).size;

  let score = 100 - totalPrep / 3 - Math.max(0, cookNights - 3) * 7 + (variety - 1) * 2;
  score = Math.round(Math.min(98, Math.max(52, score)));

  const message =
    score >= 82 ? "Very doable" : score >= 68 ? "Doable week" : "Ambitious week";

  return { score, cookNights, totalPrep, message };
}

/* ── Animated reality ring ─────────────────────────────────────────────── */

const RealityRing = ({ score }: { score: number }) => {
  const reduce = useReducedMotion();
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg viewBox="0 0 52 52" className="w-14 h-14 -rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="4.5" />
        <motion.circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp value={score} className="text-[15px] font-bold text-foreground leading-none" />
        <span className="text-[6.5px] font-bold uppercase tracking-wider text-primary mt-0.5">Reality</span>
      </div>
    </div>
  );
};

/* ── Count-up number ───────────────────────────────────────────────────── */

/**
 * Writes the animated value straight to the DOM node via a motion ref so the
 * tween never triggers a React re-render — critical on low-end Android where
 * several count-ups animate at once.
 */
const CountUp = ({ value, className }: { value: number; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reduce || prev.current === value) {
      node.textContent = String(value);
      prev.current = value;
      return;
    }

    const controls = animate(prev.current, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = String(Math.round(v));
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
};


/* ── Interactive in-phone plan ─────────────────────────────────────────── */

const PlanScreen = ({
  selected,
  openDay,
  onToggleDay,
  onPick,
  score,
  message,
}: {
  selected: number[];
  openDay: number | null;
  onToggleDay: (d: number) => void;
  onPick: (d: number, optIdx: number) => void;
  score: number;
  message: string;
}) => {
  const reduce = useReducedMotion();
  const swapTextTransition = reduce ? { duration: 0 } : { duration: 0.18 };
  const revealTransition = reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };
  return (
  <div className="px-3 pt-1 pb-3">

    {/* Header */}
    <div className="flex items-center justify-between mb-2.5">
      <div>
        <p className="text-[8.5px] font-semibold uppercase tracking-wider text-muted-foreground">This week</p>
        <h3 className="text-[15px] font-serif font-semibold text-foreground leading-tight">Your dinner plan</h3>
        <p className="text-[8.5px] font-bold text-primary mt-0.5">{message}</p>
      </div>
      <RealityRing score={score} />
    </div>

    {/* Days */}
    <div className="space-y-1.5">
      {DAYS.map((d, di) => {
        const opt = d.options[selected[di]];
        const meta = MODE_META[opt.mode];
        const Icon = meta.icon;
        const isOpen = openDay === di;
        return (
          <div key={d.day}>
            <button
              type="button"
              onClick={() => onToggleDay(di)}
              className={cn(
                "w-full flex items-center gap-2 rounded-xl px-2.5 py-2 border text-left transition-colors",
                isOpen
                  ? "border-primary/40 bg-primary/[0.07]"
                  : "border-border/50 bg-background/60 hover:border-primary/25",
              )}
            >
              <span className="w-7 text-[10px] font-bold text-muted-foreground shrink-0">{d.day}</span>
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={opt.meal}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={swapTextTransition}
                    style={{ willChange: "transform, opacity", backfaceVisibility: "hidden" }}
                    className="text-[11px] font-semibold text-foreground truncate leading-tight transform-gpu"
                  >
                    {opt.meal}
                  </motion.p>
                </AnimatePresence>

                <span
                  className={cn(
                    "mt-0.5 inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded-full text-[7px] font-bold uppercase",
                    meta.cls,
                  )}
                >
                  <Icon className="w-2 h-2" />
                  {meta.label}
                </span>
              </div>
              <span className="text-[8px] font-semibold text-muted-foreground/70 shrink-0">{opt.time}</span>
            </button>

            {/* Swap options */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-1 pt-1.5 pb-0.5 pl-9 pr-1">
                    {d.options.map((o, oi) => {
                      const om = MODE_META[o.mode];
                      const OIcon = om.icon;
                      const active = selected[di] === oi;
                      return (
                        <button
                          key={o.meal}
                          type="button"
                          onClick={() => onPick(di, oi)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-2 py-1.5 border text-left transition-colors",
                            active
                              ? "border-primary/40 bg-primary/[0.08]"
                              : "border-border/40 bg-card hover:bg-muted/40",
                          )}
                        >
                          <span
                            className={cn(
                              "w-4 h-4 rounded-md flex items-center justify-center shrink-0",
                              om.cls,
                            )}
                          >
                            <OIcon className="w-2.5 h-2.5" />
                          </span>
                          <span className="text-[10px] font-medium text-foreground flex-1 truncate">{o.meal}</span>
                          {active ? (
                            <Check className="w-3 h-3 text-primary shrink-0" strokeWidth={3} />
                          ) : (
                            <span className="text-[7.5px] font-semibold text-muted-foreground/60 shrink-0">{o.time}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>

    {/* Hint */}
    <div className="mt-2.5 flex items-center justify-center gap-1 text-[8px] font-semibold text-muted-foreground/70">
      <Hand className="w-2.5 h-2.5" />
      Tap a night to swap the meal
    </div>
  </div>
);

/* ── Section ───────────────────────────────────────────────────────────── */

const InteractiveWeeklyPlanner = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();
  const [selected, setSelected] = useState<number[]>(DEFAULT_SELECTION);
  const [openDay, setOpenDay] = useState<number | null>(0);

  const { score, cookNights, totalPrep, message } = useMemo(() => scorePlan(selected), [selected]);

  const pick = (d: number, optIdx: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[d] = optIdx;
      return next;
    });
    setOpenDay(null);
  };

  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-0 w-[460px] h-[460px] rounded-full bg-gradient-to-l from-primary/[0.06] to-transparent blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Copy */}
          <motion.div
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 mb-5 text-muted-foreground/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Try it live
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-5 tracking-tight leading-[1.1]">
              Reshape any week{" "}
              <span className="italic text-sage-dark">in seconds.</span>
            </h2>
            <p className="text-muted-foreground/80 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Tap any night to swap a cook for leftovers, takeout, or a night out.
              Watch the meal change and your Reality Score recalculate — instantly,
              just like the real app.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-md">
              <div className="rounded-2xl border border-border/60 bg-card/60 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Score</p>
                <p className="flex items-baseline gap-0.5">
                  <CountUp value={score} className="text-2xl font-bold text-foreground tabular-nums leading-none" />
                  <span className="text-[11px] font-semibold text-muted-foreground">/100</span>
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/60 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Cook</p>
                <p className="flex items-baseline gap-0.5">
                  <CountUp value={cookNights} className="text-2xl font-bold text-foreground tabular-nums leading-none" />
                  <span className="text-[11px] font-semibold text-muted-foreground">/ {DAYS.length}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/60 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Prep</p>
                <p className="flex items-baseline gap-0.5">
                  <CountUp value={totalPrep} className="text-2xl font-bold text-foreground tabular-nums leading-none" />
                  <span className="text-[11px] font-semibold text-muted-foreground">min</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Interactive phone stage */}
          <motion.div
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={1}
          >
            <div className="relative mx-auto w-fit">
              {/* Pastel bordered panel (matches the page's showcase language) */}
              <div className="relative rounded-3xl border border-border/60 overflow-hidden bg-gradient-to-b from-primary/[0.1] via-primary/[0.03] to-background px-6 sm:px-8 py-10 sm:py-12">
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
                  <div className="w-[78%] h-[68%] rounded-full blur-3xl bg-gradient-to-b from-primary/20 to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <PhoneFrame widthClassName="w-[258px] sm:w-[280px]" glow={false}>
                    <PlanScreen
                      selected={selected}
                      openDay={openDay}
                      onToggleDay={(d) => setOpenDay((cur) => (cur === d ? null : d))}
                      onPick={pick}
                      score={score}
                      message={message}
                    />
                  </PhoneFrame>
                </div>
              </div>

              {/* Live floating cards */}
              <div className="absolute z-20 top-10 -left-4 sm:-left-9 w-[148px]">
                <FloatingStatCard
                  icon={TrendingUp}
                  label="Reality score"
                  value={String(score)}
                  unit="/100"
                  tone="primary"
                  status={message}
                  statusTone="primary"
                  showArrow
                />
              </div>
              <div className="hidden sm:block absolute z-20 bottom-16 -right-9 w-[150px]">
                <FloatingStatCard
                  icon={Clock}
                  label="Weekly prep"
                  value={String(totalPrep)}
                  unit="min"
                  tone="sky"
                  showArrow
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveWeeklyPlanner;
