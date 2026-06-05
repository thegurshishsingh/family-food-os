import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Package, Store, UtensilsCrossed, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { ContentCard } from "./primitives";
import { PhoneFrame } from "./screens";
import { useMealMode, MealMode } from "./MealModeContext";

const MODES: {
  id: MealMode;
  label: string;
  icon: typeof Utensils;
  gradient: string;
}[] = [
  { id: "cook", label: "Cook", icon: Utensils, gradient: "from-primary to-sage-dark" },
  { id: "leftovers", label: "Leftovers", icon: Package, gradient: "from-sky to-primary" },
  { id: "takeout", label: "Takeout", icon: Store, gradient: "from-accent to-coral" },
  { id: "dineout", label: "Dine Out", icon: UtensilsCrossed, gradient: "from-violet to-primary" },
];

const WEEK_PREVIEW = [
  { day: "Mon", date: "10", mode: "cook", label: "Cook", meal: "Lemon chicken bowls", time: "30 min", icon: Utensils, gradient: "from-primary to-sage-dark" },
  { day: "Tue", date: "11", mode: "leftovers", label: "Leftovers", meal: "Leftover taco bowls", time: "5 min", icon: Package, gradient: "from-sky to-primary" },
  { day: "Wed", date: "12", mode: "takeout", label: "Takeout", meal: "Family sushi takeout", time: "—", icon: Store, gradient: "from-accent to-coral" },
  { day: "Thu", date: "13", mode: "cook", label: "Cook", meal: "Sheet pan salmon", time: "25 min", icon: Utensils, gradient: "from-primary to-sage-dark" },
  { day: "Fri", date: "14", mode: "dineout", label: "Dine Out", meal: "Dinner out", time: "—", icon: UtensilsCrossed, gradient: "from-violet to-primary" },
  { day: "Sat", date: "15", mode: "cook", label: "Cook", meal: "Slow cooker chili", time: "15 min", icon: Utensils, gradient: "from-primary to-sage-dark" },
];

const MOCK_CONTENT: Record<MealMode, {
  badge: string;
  title: string;
  meta: string;
  body: { heading: string; items: string[] };
}> = {
  cook: {
    badge: "Cook",
    title: "Cook night",
    meta: "35 min",
    body: { heading: "You'll need", items: ["Chicken thighs", "Jasmine rice", "Lemons · Garlic", "Baby spinach"] },
  },
  leftovers: {
    badge: "Leftovers",
    title: "Leftover night",
    meta: "5 min",
    body: { heading: "From last night", items: ["Roast chicken (saved)", "Rice (reheated)", "Quick salsa", "Tortillas"] },
  },
  takeout: {
    badge: "Takeout",
    title: "Takeout night",
    meta: "Order by 6pm",
    body: { heading: "Suggested order", items: ["Family sushi platter", "Edamame", "Miso soup x2", "Mochi for dessert"] },
  },
  dineout: {
    badge: "Dine Out",
    title: "Dinner out",
    meta: "Reservation 6:30",
    body: { heading: "Quick reminder", items: ["No grocery prep tonight", "Skip Friday lunch leftovers", "Keep Sat ingredients fresh", "Enjoy 🍷"] },
  },
};

const PlansThatFitRealLife = () => {
  const { fadeUp, viewport, initialState, isMobile } = useScrollReveal();
  const { mode, setMode } = useMealMode();
  const active = MODES.find((m) => m.id === mode)!;
  const content = MOCK_CONTENT[mode];

  return (
    <section id="plans-that-fit" className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-accent/4 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-4 tracking-tight leading-[1.1]">
            Plans that fit{" "}
            <span className="italic text-sage-dark">real life.</span>
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            One structured week — cook nights, leftovers, takeout, dine out. Built around how your family actually eats, not just a folder of recipes.
          </p>
        </motion.div>

        {/* Mode tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-2.5 mb-8 md:mb-10"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={1}
        >
          {MODES.map((m) => {
            const isActive = m.id === mode;
            return (
              <motion.button
                key={m.id}
                onClick={() => setMode(m.id)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
                className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "text-primary-foreground shadow-md"
                    : "glass text-foreground/70 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mode-pill"
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${m.gradient}`}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <m.icon className="w-3.5 h-3.5" />
                  {m.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 md:gap-10 items-center">
          {/* Weekly plan card */}
          <motion.div
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={2}
          >
            <ContentCard halo="primary">
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
                <div className="w-[100px]"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Mode</span></div>
                <div className="flex-1"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Meal</span></div>
                <div className="w-12 text-right"><span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Prep</span></div>
              </div>
              <div className="flex-1 min-h-[280px]">
                {WEEK_PREVIEW.map((day, i) => {
                  const dim = day.mode !== mode;
                  return (
                    <motion.button
                      key={day.day}
                      type="button"
                      onClick={() => setMode(day.mode as MealMode)}
                      className="w-full flex items-center gap-4 px-6 py-2.5 border-b border-border/20 last:border-b-0 group transition-colors hover:bg-primary/[0.04] text-left"
                      initial={{ opacity: 0, x: isMobile ? 0 : -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={viewport}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                      animate={{ opacity: dim ? 0.45 : 1 }}
                    >
                      <div className="w-11 flex items-baseline gap-1.5">
                        <span className="text-[13px] font-bold text-foreground">{day.day}</span>
                        <span className="text-[10px] text-muted-foreground/60 font-medium">{day.date}</span>
                      </div>
                      <div className="w-[100px]">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-to-r ${day.gradient}`}>
                          <day.icon className="w-2.5 h-2.5" />
                          {day.label}
                        </span>
                      </div>
                      <span className="text-[13px] text-foreground/80 flex-1 truncate font-medium">{day.meal}</span>
                      <span className="text-[11px] text-muted-foreground/50 w-12 text-right font-medium tabular-nums">{day.time}</span>
                    </motion.button>
                  );
                })}
              </div>
              <div className="px-6 py-2.5 border-t border-border/30">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-medium">3 cook · 1 leftover · 1 takeout · 1 out</span>
                  <span className="font-bold text-primary">~2,400 cal avg</span>
                </div>
              </div>
            </ContentCard>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={3}
          >
            <PhoneFrame widthClassName="w-[252px]">
              <div className="px-4 pt-3 pb-5 min-h-[420px]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">Tonight · Thu</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-to-r ${active.gradient}`}>
                    <active.icon className="w-2.5 h-2.5" />
                    {content.badge}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-[20px] font-serif font-semibold text-foreground mb-3 leading-tight">
                      {content.title}
                    </h4>
                    <div className="relative rounded-2xl bg-muted/50 aspect-[16/10] mb-3 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${active.gradient} opacity-20`} />
                      <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/85 backdrop-blur-sm text-[9px] font-bold text-foreground">
                        <Clock className="w-2.5 h-2.5" />
                        {content.meta}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <p className="text-[9px] font-bold text-foreground/70 uppercase tracking-wider">Tonight</p>
                        <p className="text-[12px] font-serif font-semibold text-foreground leading-tight">{content.title}</p>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em] mb-2">{content.body.heading}</p>
                    <ul className="space-y-1.5">
                      {content.body.items.map((it) => (
                        <li key={it} className="flex items-center gap-2 text-[12px] text-foreground/85">
                          <span className="w-1 h-1 rounded-full bg-primary" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            </PhoneFrame>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-10 md:mt-12"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={4}
        >
          <Button size="lg" className="text-base px-8 h-12 rounded-xl bg-gradient-to-r from-primary to-sage-dark hover:from-primary/90 hover:to-sage-dark/90 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]" asChild>
            <Link to="/signup">This could be your week. Start free <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PlansThatFitRealLife;
