import { motion } from "framer-motion";
import { CalendarDays, Sparkles, TrendingUp, Clock, Utensils } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const WEEK_PREVIEW = [
  { day: "Mon", mode: "Cook", meal: "Lemon chicken bowls", modeColor: "bg-primary/90 text-primary-foreground" },
  { day: "Tue", mode: "Leftovers", meal: "Leftover taco bowls", modeColor: "bg-secondary text-secondary-foreground" },
  { day: "Wed", mode: "Takeout", meal: "Family sushi takeout", modeColor: "bg-accent/85 text-accent-foreground" },
  { day: "Thu", mode: "Cook", meal: "Sheet pan salmon", modeColor: "bg-primary/90 text-primary-foreground" },
  { day: "Fri", mode: "Dine Out", meal: "Dinner out", modeColor: "bg-warm text-primary-foreground" },
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
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container max-w-6xl">
        {/* Section header */}
        <motion.div
          className="text-center mb-14 md:mb-18"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
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

        {/* Split layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* LEFT — Weekly Planner Preview */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="flex"
          >
            <div className="rounded-2xl border border-border bg-card shadow-[0_2px_24px_-4px_hsl(var(--foreground)/0.06)] overflow-hidden flex flex-col w-full">
              {/* Card header */}
              <div className="px-6 pt-6 pb-5 border-b border-border/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Your Week
                    </p>
                    <h3 className="text-lg font-serif font-semibold text-foreground mt-1">
                      March 10 – 14
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-semibold border border-primary/12">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Reality Score: 84
                  </div>
                </div>
              </div>

              {/* Day rows */}
              <div className="flex-1">
                {WEEK_PREVIEW.map((day, i) => (
                  <motion.div
                    key={day.day}
                    className="flex items-center gap-4 px-6 py-3.5 border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
                  >
                    <div className="w-10">
                      <span className="text-[13px] font-bold text-foreground tracking-tight">
                        {day.day}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide ${day.modeColor}`}
                    >
                      {day.mode}
                    </span>
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      {day.meal}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Card footer */}
              <div className="px-6 py-3.5 bg-muted/25 border-t border-border/60">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tracking-wide">3 cook · 1 leftover · 1 out</span>
                  <span className="font-semibold text-primary">~2,400 cal avg/day</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Dinner Check-In */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
            className="flex"
          >
            <div className="rounded-2xl border border-border bg-card shadow-[0_2px_24px_-4px_hsl(var(--foreground)/0.06)] overflow-hidden flex flex-col w-full">
              {/* Card header */}
              <div className="px-6 pt-6 pb-5 border-b border-border/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-foreground">
                      Dinner Check-In
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      A 10-second nightly ritual that helps the system learn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Check-in body */}
              <div className="px-6 py-6 flex-1 flex flex-col">
                <p className="text-sm font-semibold text-foreground mb-4">
                  How did dinner go tonight?
                </p>

                {/* Chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {CHECKIN_CHIPS.map((chip) => (
                    <span
                      key={chip.label}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-default ${
                        chip.active
                          ? "border-primary/40 bg-primary/10 text-primary shadow-[0_1px_4px_0_hsl(var(--primary)/0.1)]"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>

                {/* Smart response */}
                <div className="rounded-xl bg-sage-light/70 border border-primary/10 px-4 py-4 mb-6">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground font-medium leading-relaxed">
                      Got it. Thursdays should stay low-effort for your family.
                    </p>
                  </div>
                </div>

                {/* Weekly learnings */}
                <div className="mt-auto">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    This week's learning
                  </p>
                  <div className="space-y-2.5">
                    {LEARNINGS.map((item, i) => (
                      <motion.div
                        key={item.text}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                      >
                        <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                          <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground leading-snug">
                          {item.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductProof;
