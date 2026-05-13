import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Quote, Star, Utensils, Package, Store, UtensilsCrossed } from "lucide-react";
import { IconTile } from "./primitives";
import { useMealMode, MealMode } from "./MealModeContext";

const VOICES: Record<MealMode, {
  gradient: string;
  badge: string;
  icon: typeof Utensils;
  name: string;
  family: string;
  quote: string;
  stars: number;
}> = {
  cook: {
    gradient: "from-primary to-sage-dark",
    badge: "Cook nights",
    icon: Utensils,
    name: "Sarah M.",
    family: "Mom of 3, ages 2–8",
    quote: "I used to dread 5pm every day. Now cook nights feel intentional — 30 minutes, kids actually eat it. My husband thought I hired a chef.",
    stars: 5,
  },
  leftovers: {
    gradient: "from-sky to-primary",
    badge: "Leftover nights",
    icon: Package,
    name: "James R.",
    family: "Single dad, daughter age 6",
    quote: "The leftover planning alone saves me $60 a week. Monday's roast becomes Wednesday's tacos and my daughter doesn't even notice.",
    stars: 5,
  },
  takeout: {
    gradient: "from-accent to-coral",
    badge: "Takeout nights",
    icon: Store,
    name: "Priya & Dev K.",
    family: "Dual-income, toddler + baby",
    quote: "We went from random Uber Eats 5x/week to one planned takeout night that actually fits our budget. It feels like a treat again, not a default.",
    stars: 5,
  },
  dineout: {
    gradient: "from-violet to-primary",
    badge: "Dine out nights",
    icon: UtensilsCrossed,
    name: "Maya & Tom L.",
    family: "Parents of 2, busy weekends",
    quote: "The plan blocks Friday for dine out, so Saturday's groceries don't go to waste. We finally relax instead of stress-cooking around our reservation.",
    stars: 5,
  },
};

const FamilyVoices = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();
  const { mode } = useMealMode();
  const v = VOICES[mode];

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-b from-primary/4 via-violet/3 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-3xl relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <IconTile size="xl" gradient="from-primary/15 to-violet/10" className="mb-4">
            <Quote className="w-6 h-6 text-primary" />
          </IconTile>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-3 tracking-tight leading-[1.1]">
            Real families, real weeks
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg max-w-md mx-auto">
            One story for each kind of dinner night.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative p-6 md:p-8 rounded-2xl glass-card hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-to-r ${v.gradient}`}>
                <v.icon className="w-3 h-3" />
                {v.badge}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: v.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-lemon text-lemon" />
                ))}
              </div>
            </div>
            <p className="text-lg md:text-xl text-foreground/85 leading-relaxed font-serif italic mb-6">
              "{v.quote}"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${v.gradient} flex items-center justify-center text-primary-foreground text-sm font-bold`}>
                {v.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{v.name}</p>
                <p className="text-[12px] text-muted-foreground/80">{v.family}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center mt-5 text-xs text-muted-foreground/60">
          Tap any mode above to hear from a different family.
        </p>
      </div>
    </section>
  );
};

export default FamilyVoices;
