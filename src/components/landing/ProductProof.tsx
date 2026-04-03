import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Utensils, Package, Store, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const WEEK_PREVIEW = [
  { day: "Mon", date: "10", mode: "Cook", meal: "Lemon chicken bowls", time: "30 min", icon: Utensils, modeGradient: "from-primary to-sage-dark" },
  { day: "Tue", date: "11", mode: "Leftovers", meal: "Leftover taco bowls", time: "5 min", icon: Package, modeGradient: "from-sky to-primary" },
  { day: "Wed", date: "12", mode: "Takeout", meal: "Family sushi takeout", time: "—", icon: Store, modeGradient: "from-accent to-coral" },
  { day: "Thu", date: "13", mode: "Cook", meal: "Sheet pan salmon", time: "25 min", icon: Utensils, modeGradient: "from-primary to-sage-dark" },
  { day: "Fri", date: "14", mode: "Dine Out", meal: "Dinner out", time: "—", icon: UtensilsCrossed, modeGradient: "from-violet to-primary" },
  { day: "Sat", date: "15", mode: "Cook", meal: "Slow cooker chili", time: "15 min", icon: Utensils, modeGradient: "from-primary to-sage-dark" },
  { day: "Sun", date: "16", mode: "Leftovers", meal: "Leftover chili nachos", time: "10 min", icon: Package, modeGradient: "from-sky to-primary" },
];

const ProductProof = () => {
  const { fadeUp, viewport, initialState, isMobile } = useScrollReveal();

  return (
    <section className="py-10 md:py-14 px-4 relative">
      <MidPageDecorations />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-5"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-3">
            It learns from real life, not just recipes.
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Most meal apps stop at planning. Family Food OS keeps learning after
            dinner, so each week's dinners fit your family better.
          </p>
        </motion.div>

        <motion.div
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={2}
        >
          <p className="text-center text-sm font-medium text-muted-foreground mb-3">
            Here's what a real family's week looks like →
          </p>
          <div className="max-w-2xl mx-auto">
            <WeeklyPlanCard isMobile={isMobile} viewport={viewport} />
          </div>
          <div className="text-center mt-5">
            <Button size="lg" className="text-base px-8 h-12 rounded-xl bg-gradient-to-r from-primary to-sage-dark hover:from-primary/90 hover:to-sage-dark/90 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]" asChild>
              <Link to="/signup">This could be your week. Start free <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

function WeeklyPlanCard({ isMobile, viewport }: { isMobile: boolean; viewport: { once: boolean; amount: number } }) {
  return (
    <div className="relative">
      {/* Liquid glass border */}
      <div className="absolute -inset-[1px] rounded-[18px] bg-gradient-to-br from-primary/25 via-sky/15 to-accent/20 blur-[0.5px]" />
      <div className="relative rounded-2xl glass-strong overflow-hidden flex flex-col w-full min-h-[406px] shadow-xl">
        <div className="px-6 pt-4 pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em] mb-1">Your Week</p>
              <h3 className="text-[17px] font-serif font-semibold text-foreground leading-tight">March 10 – 16</h3>
            </div>
            <div className="flex items-center gap-1.5 pl-3 pr-3.5 py-1.5 rounded-full glass text-primary text-[11px] font-bold tracking-wide">
              <TrendingUp className="w-3 h-3" />
              Reality Score: 84
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 border-b border-border/30">
          <div className="w-11" />
          <div className="w-[80px]"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Mode</span></div>
          <div className="flex-1"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Meal</span></div>
          <div className="w-12 text-right"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Prep</span></div>
        </div>
        <div className="flex-1">
          {WEEK_PREVIEW.map((day, i) => (
            <motion.div
              key={day.day}
              className="flex items-center gap-4 px-6 py-2.5 border-b border-border/20 last:border-b-0 group transition-colors hover:bg-primary/[0.03]"
              initial={{ opacity: 0, x: isMobile ? 0 : -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
            >
              <div className="w-11 flex items-baseline gap-1.5">
                <span className="text-[13px] font-bold text-foreground">{day.day}</span>
                <span className="text-[10px] text-muted-foreground/60 font-medium">{day.date}</span>
              </div>
              <div className="w-[80px]">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-to-r ${day.modeGradient}`}>
                  <day.icon className="w-2.5 h-2.5" />
                  {day.mode}
                </span>
              </div>
              <span className="text-[13px] text-foreground/80 flex-1 truncate font-medium">{day.meal}</span>
              <span className="text-[11px] text-muted-foreground/50 w-12 text-right font-medium tabular-nums">{day.time}</span>
            </motion.div>
          ))}
        </div>
        <div className="px-6 py-2.5 border-t border-border/30">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium">4 cook · 2 leftover · 1 out</span>
            <span className="font-bold text-primary">~2,400 cal avg</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductProof;
