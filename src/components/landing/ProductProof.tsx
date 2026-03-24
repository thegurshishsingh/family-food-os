import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarDays, Sparkles, TrendingUp, Clock, Utensils, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const WEEK_PREVIEW = [
  { day: "Mon", date: "10", mode: "Cook", meal: "Lemon chicken bowls", time: "30 min", modeColor: "bg-primary text-primary-foreground" },
  { day: "Tue", date: "11", mode: "Leftovers", meal: "Leftover taco bowls", time: "5 min", modeColor: "bg-secondary text-secondary-foreground" },
  { day: "Wed", date: "12", mode: "Takeout", meal: "Family sushi takeout", time: "—", modeColor: "bg-accent text-accent-foreground" },
  { day: "Thu", date: "13", mode: "Cook", meal: "Sheet pan salmon", time: "25 min", modeColor: "bg-primary text-primary-foreground" },
  { day: "Fri", date: "14", mode: "Dine Out", meal: "Dinner out", time: "—", modeColor: "bg-warm text-primary-foreground" },
  { day: "Sat", date: "15", mode: "Cook", meal: "Slow cooker chili", time: "15 min", modeColor: "bg-primary text-primary-foreground" },
  { day: "Sun", date: "16", mode: "Leftovers", meal: "Leftover chili nachos", time: "10 min", modeColor: "bg-secondary text-secondary-foreground" },
];

const CHECKIN_CHIPS = [
  { label: "Cooked it", active: true },
  { label: "Ordered out instead", active: false },
  { label: "Kids liked it", active: true },
  { label: "Too much work", active: false },
  { label: "Great leftovers", active: false },
];

const LEARNINGS = [
  { icon: CalendarDays, text: "Wednesdays often become takeout" },
  { icon: Utensils, text: "Kids prefer low-spice meals" },
  { icon: Clock, text: "Thursdays should stay under 25 min" },
];

const ProductProof = () => {
  const { fadeUp, viewport, initialState, isMobile } = useScrollReveal();

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container max-w-6xl">
        {/* Section header */}
        <motion.div
          className="text-center mb-6 md:mb-8"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
            It learns from real life, not just recipes.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Most meal apps stop at planning. Family Food OS keeps learning after
            dinner, so each week fits your family better.
          </p>
        </motion.div>

        {/* Dinner Check-In moved FIRST with headline */}
        <motion.div
          className="mb-6"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={1}
        >
          <p className="text-center text-lg md:text-xl font-serif font-semibold text-foreground mb-6">
            The 10-second habit that makes every week better than the last.
          </p>
          <div className="max-w-xl mx-auto">
            <DinnerCheckInCard isMobile={isMobile} viewport={viewport} />
          </div>
        </motion.div>

        {/* Weekly Planner Preview */}
        <motion.div
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={2}
        >
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            Here's what a real family's week looks like →
          </p>
          <div className="max-w-2xl mx-auto">
            <WeeklyPlanCard isMobile={isMobile} viewport={viewport} />
          </div>
          <div className="text-center mt-6">
            <Button size="lg" className="text-base px-8 h-12 rounded-xl" asChild>
              <Link to="/signup">This could be your week. Start free <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ---------- Sub-components ---------- */

function WeeklyPlanCard({ isMobile, viewport }: { isMobile: boolean; viewport: { once: boolean; amount: number } }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-[0_4px_32px_-8px_hsl(var(--foreground)/0.08),0_1px_3px_0_hsl(var(--foreground)/0.04)] overflow-hidden flex flex-col w-full">
      <div className="px-6 pt-5 pb-4 border-b border-border/60 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em] mb-1">Your Week</p>
            <h3 className="text-[17px] font-serif font-semibold text-foreground leading-tight">March 10 – 14</h3>
          </div>
          <div className="flex items-center gap-1.5 pl-3 pr-3.5 py-1.5 rounded-full bg-primary/8 text-primary text-[11px] font-bold border border-primary/15 tracking-wide">
            <TrendingUp className="w-3 h-3" />
            Reality Score: 84
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 px-6 py-2 bg-muted/15 border-b border-border/40">
        <div className="w-11" />
        <div className="w-[72px]"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Mode</span></div>
        <div className="flex-1"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Meal</span></div>
        <div className="w-12 text-right"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Prep</span></div>
      </div>
      <div className="flex-1">
        {WEEK_PREVIEW.map((day, i) => (
          <motion.div
            key={day.day}
            className="flex items-center gap-4 px-6 py-3 border-b border-border/30 last:border-b-0 group transition-colors hover:bg-muted/15"
            initial={{ opacity: 0, x: isMobile ? 0 : -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
          >
            <div className="w-11 flex items-baseline gap-1.5">
              <span className="text-[13px] font-bold text-foreground">{day.day}</span>
              <span className="text-[10px] text-muted-foreground/60 font-medium">{day.date}</span>
            </div>
            <div className="w-[72px]">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${day.modeColor}`}>{day.mode}</span>
            </div>
            <span className="text-[13px] text-foreground/80 flex-1 truncate font-medium">{day.meal}</span>
            <span className="text-[11px] text-muted-foreground/50 w-12 text-right font-medium tabular-nums">{day.time}</span>
          </motion.div>
        ))}
      </div>
      <div className="px-6 py-3 bg-muted/20 border-t border-border/50">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-medium">4 cook · 2 leftover · 1 out</span>
          <span className="font-bold text-primary">~2,400 cal avg</span>
        </div>
      </div>
    </div>
  );
}

function DinnerCheckInCard({ isMobile, viewport }: { isMobile: boolean; viewport: { once: boolean; amount: number } }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-[0_4px_32px_-8px_hsl(var(--foreground)/0.08),0_1px_3px_0_hsl(var(--foreground)/0.04)] overflow-hidden flex flex-col w-full">
      <div className="px-6 pt-5 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-[0_1px_4px_0_hsl(var(--primary)/0.08)]">
            <Sparkles className="w-[17px] h-[17px] text-primary" />
          </div>
          <div>
            <h3 className="text-[17px] font-serif font-semibold text-foreground leading-tight">Dinner Check-In</h3>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed font-medium">A 10-second nightly ritual that helps the system learn.</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 flex-1 flex flex-col">
        <p className="text-[13px] font-bold text-foreground mb-4 tracking-tight">How did dinner go tonight?</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {CHECKIN_CHIPS.map((chip) => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[11px] font-semibold border transition-all cursor-default ${
                chip.active
                  ? "border-primary/30 bg-primary/12 text-primary shadow-[0_1px_6px_-1px_hsl(var(--primary)/0.15),inset_0_1px_0_hsl(var(--primary-foreground)/0.1)]"
                  : "border-border/70 bg-background text-muted-foreground/70 hover:border-border"
              }`}
            >
              {chip.active && <Check className="w-3 h-3 text-primary" />}
              {chip.label}
            </span>
          ))}
        </div>
        <div className="h-px bg-border/40 mb-5" />
        <div className="rounded-xl bg-sage-light/80 border border-primary/12 px-4 py-3.5 mb-5 shadow-[0_1px_4px_-1px_hsl(var(--primary)/0.06)]">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
            <p className="text-[13px] text-foreground font-semibold leading-relaxed">
              Got it. Thursdays should stay low-effort for your family.
            </p>
          </div>
        </div>
        <div className="mt-auto pt-1">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-3">This week's learning</p>
          <div className="space-y-2">
            {LEARNINGS.map((item, i) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, y: isMobile ? 0 : 4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <div className="w-6 h-6 rounded-md bg-muted/40 flex items-center justify-center shrink-0">
                  <item.icon className="w-3 h-3 text-muted-foreground/60" />
                </div>
                <span className="text-[12px] text-muted-foreground/80 leading-snug font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductProof;
