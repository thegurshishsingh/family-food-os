import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Quote, Star, Utensils, Package, Store, UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react";
import { IconTile } from "./primitives";
import { useMealMode, MealMode } from "./MealModeContext";

const ORDER: MealMode[] = ["cook", "leftovers", "takeout", "dineout"];

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
    gradient: "from-sage to-primary",
    badge: "Leftover nights",
    icon: Package,
    name: "James R.",
    family: "Single dad, daughter age 6",
    quote: "The leftover planning alone saves me $60 a week. Monday's roast becomes Wednesday's tacos and my daughter doesn't even notice.",
    stars: 5,
  },
  takeout: {
    gradient: "from-accent to-warm",
    badge: "Takeout nights",
    icon: Store,
    name: "Priya & Dev K.",
    family: "Dual-income, toddler + baby",
    quote: "We went from random Uber Eats 5x/week to one planned takeout night that actually fits our budget. It feels like a treat again, not a default.",
    stars: 5,
  },
  dineout: {
    gradient: "from-sage-dark to-primary",
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
  const { mode, setMode } = useMealMode();
  const v = VOICES[mode];
  const idx = ORDER.indexOf(mode);

  const goTo = (delta: number) => {
    const next = (idx + delta + ORDER.length) % ORDER.length;
    setMode(ORDER[next]);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x < -threshold) goTo(1);
    else if (info.offset.x > threshold) goTo(-1);
  };

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-b from-primary/5 via-sage/4 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-3xl relative z-10">
        <motion.div
          className="text-center mb-8 md:mb-10"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <IconTile size="xl" gradient="from-primary/15 to-sage/10" className="mb-4">
            <Quote className="w-6 h-6 text-primary" />
          </IconTile>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-3 tracking-tight leading-[1.1]">
            Real families, real weeks
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg max-w-md mx-auto">
            One story for each kind of dinner night.
          </p>
        </motion.div>

        {/* Mode pills synced with carousel */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {ORDER.map((m) => {
            const isActive = m === mode;
            const meta = VOICES[m];
            const Icon = meta.icon;
            return (
              <motion.button
                key={m}
                onClick={() => setMode(m)}
                whileTap={{ scale: 0.94 }}
                whileHover={{ y: -2 }}
                aria-pressed={isActive}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  isActive ? "text-primary-foreground" : "glass text-foreground/65 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="voices-pill"
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${meta.gradient}`}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-1.5">
                  <Icon className="w-3 h-3" />
                  {meta.badge.replace(" nights", "")}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="relative">
          {/* Arrows (desktop) */}
          <button
            type="button"
            aria-label="Previous story"
            onClick={() => goTo(-1)}
            className="hidden md:flex absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-strong items-center justify-center text-foreground/70 hover:text-primary hover:scale-105 active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next story"
            onClick={() => goTo(1)}
            className="hidden md:flex absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-strong items-center justify-center text-foreground/70 hover:text-primary hover:scale-105 active:scale-95 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-6 md:p-8 rounded-2xl glass-card hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing select-none touch-pan-y"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-to-r ${v.gradient}`}>
                  <v.icon className="w-3 h-3" />
                  {v.badge}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: v.stars }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
              </div>
              <p className="text-lg md:text-xl text-foreground/85 leading-relaxed font-serif italic mb-6">
                "{v.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${v.gradient} flex items-center justify-center text-primary-foreground text-sm font-bold`}>
                  {v.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{v.name}</p>
                  <p className="text-[12px] text-muted-foreground">{v.family}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {ORDER.map((m, i) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-label={`Go to ${VOICES[m].badge}`}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-primary" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>

        <p className="text-center mt-3 text-xs text-muted-foreground/70">
          Swipe, tap a mode, or use the arrows to hear from a different family.
        </p>
      </div>
    </section>
  );
};

export default FamilyVoices;
