import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock, Gauge, Timer, ChefHat, PackageOpen, Truck } from "lucide-react";
import { PhoneFrame, WeeklyPlanScreen } from "./screens";
import { FloatingStatCard } from "./primitives";
import { useMealMode } from "./MealModeContext";

const rotatingWords = [
  "decided.",
  "handled.",
  "sorted.",
  "planned.",
  "covered.",
];


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
  const { mode, setMode } = useMealMode();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCardClick = (mode: "cook" | "leftovers" | "takeout") => {
    setMode(mode);
    scrollTo("plans-that-fit");
  };

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
                Never Wonder What's For Dinner
              </span>
            </div>

            <h1 className="text-[2.6rem] leading-[1.1] sm:text-5xl md:text-6xl font-serif font-semibold tracking-tight text-foreground mb-5">
              <span className="block">A whole week of</span>
              <span className="block whitespace-nowrap">
                dinners,{" "}
                <span className="relative inline-block h-[1.1em] leading-[1.1em] overflow-hidden align-bottom">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      className="inline-block leading-[1.1em] bg-gradient-to-r from-primary via-sage-dark to-primary bg-clip-text text-transparent"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
            </h1>

            <div className="space-y-1.5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-6">
              <p>Automatic weekly plan: cook, leftovers, takeout, dine out.</p>
              <p>Learns your family: picky eaters, sports nights, budgets.</p>
              <p>Groceries and leftovers optimized so you waste less food.</p>
            </div>

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

            {/* Floating zoom card: reality score (top-left) */}
            <motion.div
              className="absolute top-8 -left-3 sm:-left-8 w-[150px]"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <FloatingStatCard
                icon={Gauge}
                label="Reality score"
                value="84"
                unit="/100"
                tone="primary"
                trend="up"
                trendTone="primary"
                showArrow
              />
            </motion.div>

            {/* Floating zoom card: time saved (bottom-right) */}
            <motion.div
              className="absolute bottom-10 -right-3 sm:-right-8 w-[164px]"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <FloatingStatCard
                icon={Timer}
                label="Time saved"
                value="2.5"
                unit="hrs"
                tone="sky"
                sparkline={[3, 5, 4, 7, 6, 9, 8, 11]}
                showArrow
              />
            </motion.div>
          </motion.div>
        </div>
        {/* Three feature callouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 md:mt-16"
        >
          {[
            {
              icon: ChefHat,
              title: "Cook",
              sentence: "Fresh recipes matched to your time, skill, and what's in season.",
              tone: "from-primary/10 to-sage/5",
              iconColor: "text-primary",
              mode: "cook" as const,
            },
            {
              icon: PackageOpen,
              title: "Leftovers",
              sentence: "Smartly reused so nothing rots in the back of the fridge.",
              tone: "from-accent/10 to-warm/5",
              iconColor: "text-accent",
              mode: "leftovers" as const,
            },
            {
              icon: Truck,
              title: "Takeout",
              sentence: "Planned into the week so you don't guilt-order at 6 pm.",
              tone: "from-sky/10 to-primary/5",
              iconColor: "text-sky",
              mode: "takeout" as const,
            },
          ].map((card) => (
            <button
              key={card.title}
              onClick={() => handleCardClick(card.mode)}
              className={`relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br ${card.tone} backdrop-blur-sm p-5 text-left cursor-pointer transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30`}
            >
              <card.icon className={`w-5 h-5 ${card.iconColor} mb-2.5`} strokeWidth={2} />
              <h3 className="text-sm font-semibold text-foreground mb-1">{card.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{card.sentence}</p>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
