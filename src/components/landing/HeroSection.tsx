import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CalendarDays, Brain, Sparkles, Flame, Clock } from "lucide-react";
import { PhoneFrame, WeeklyPlanScreen } from "./screens";
import { GlassCard, IconTile } from "./primitives";

const rotatingWords = [
  "decided.",
  "handled.",
  "off your plate.",
  "on autopilot.",
];

const StreakBadge = () => (
  <GlassCard size="sm" halo="coral" padding="xs" outerClassName="inline-block">
    <div className="flex items-center gap-1.5">
      <Flame className="w-4 h-4 text-coral" />
      <span className="text-[11px] font-bold text-foreground">5-day streak 🔥</span>
    </div>
  </GlassCard>
);

const SystemLearningCard = () => (
  <GlassCard size="md" halo="sky" outerClassName="w-[156px]">
    <div className="flex items-center gap-1.5 mb-2">
      <IconTile size="xs" gradient="from-sky to-primary">
        <Sparkles className="w-3 h-3 text-primary-foreground" />
      </IconTile>
      <span className="text-[10px] font-bold text-foreground">Learns your family</span>
    </div>
    <div className="space-y-1.5">
      {[
        { c: "bg-sky", t: "Kids prefer low-spice" },
        { c: "bg-primary", t: "Wed → takeout works" },
        { c: "bg-accent", t: "Thu under 25 min" },
      ].map((x) => (
        <p key={x.t} className="text-[9px] text-muted-foreground leading-snug flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${x.c} shrink-0`} />
          {x.t}
        </p>
      ))}
    </div>
  </GlassCard>
);

const RatingStrip = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex -space-x-2">
      {["from-primary to-sage-dark", "from-sky to-primary", "from-coral to-accent", "from-accent to-warm"].map((g, i) => (
        <span key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-background`} />
      ))}
    </div>
    <div>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground font-medium">
        Loved by busy families reclaiming their evenings
      </p>
    </div>
  </div>
);

const HeroSection = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-24 pb-12 md:pt-28 md:pb-20 px-4 relative gradient-mesh overflow-hidden">
      {/* Ambient sky wash */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[420px] rounded-full bg-gradient-to-b from-sage/15 via-primary/8 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-accent/10 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-8 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-primary leading-none">
                The weekly dinner system
              </span>
            </div>

            <h1 className="text-[2.6rem] leading-[1.02] sm:text-5xl md:text-6xl font-serif font-semibold tracking-tight text-foreground mb-5">
              A whole week of
              <br />
              dinners,{" "}
              <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    className="inline-block bg-gradient-to-r from-primary via-sage-dark to-primary bg-clip-text text-transparent"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-6">
              Dinner isn't a recipe problem — it's a coordination problem. Family Food OS
              plans cook, leftovers, takeout and dine-out nights around your real week,
              then learns what your family actually eats.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <Button
                size="lg"
                className="text-base px-7 h-12 rounded-xl bg-gradient-to-r from-primary to-sage-dark hover:from-primary/90 hover:to-sage-dark/90 shadow-[0_8px_28px_-8px_hsl(var(--primary)/0.5)]"
                asChild
              >
                <Link to="/signup">
                  Plan this week's dinners <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary/60" />
                5-min setup · smarter every week
              </p>
            </div>

            <RatingStrip />
          </motion.div>

          {/* Right — Phone (Weekly Plan) + floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <PhoneFrame widthClassName="w-[250px] sm:w-[270px]">
                <WeeklyPlanScreen />
              </PhoneFrame>
            </motion.div>

            {/* Floating: streak (top-left) */}
            <motion.div
              className="absolute top-6 -left-2 sm:left-0 hidden xs:block"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <StreakBadge />
            </motion.div>

            {/* Floating: learning (bottom-right) */}
            <motion.div
              className="absolute bottom-8 -right-2 sm:-right-4 hidden xs:block"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <SystemLearningCard />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
