import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Flame, Brain, Sparkles, TrendingUp, CalendarDays, Utensils, Package, Store } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DinnerCheckInPreview from "./DinnerCheckInPreview";
import { GlassCard, IconTile } from "./primitives";

const rotatingWords = [
  "Dinner decisions",
  "Sports nights",
  "Picky eaters",
  "Leftover overload",
  "Grocery runs",
  "Takeout traps",
  "Busy weeknights",
  "5 pm panic",
];

const WeeklyPlanCard = () => (
  <GlassCard size="md" halo="primary" outerClassName="w-[140px]">
    <div className="flex items-center gap-1.5 mb-2">
      <IconTile size="xs" gradient="from-primary to-sage-dark">
        <CalendarDays className="w-3 h-3 text-primary-foreground" />
      </IconTile>
      <span className="text-[11px] font-bold text-foreground">This Week</span>
    </div>
    <div className="space-y-1.5">
      {[
        { day: "Mon", icon: Utensils, mode: "Cook", g: "from-primary to-sage-dark" },
        { day: "Tue", icon: Package, mode: "Leftover", g: "from-sky to-primary" },
        { day: "Wed", icon: Store, mode: "Takeout", g: "from-coral to-accent" },
      ].map((d) => (
        <div key={d.day} className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold text-muted-foreground w-6">{d.day}</span>
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase text-primary-foreground bg-gradient-to-r ${d.g}`}>
            <d.icon className="w-2 h-2" />
            {d.mode}
          </span>
        </div>
      ))}
    </div>
    <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-primary">
      <TrendingUp className="w-2.5 h-2.5" />
      Reality: 84
    </div>
  </GlassCard>
);

const SystemLearningCard = () => (
  <GlassCard size="md" halo="sky" outerClassName="w-[150px]">
    <div className="flex items-center gap-1.5 mb-2">
      <IconTile size="xs" gradient="from-sky to-primary">
        <Sparkles className="w-3 h-3 text-primary-foreground" />
      </IconTile>
      <span className="text-[10px] font-bold text-foreground">System Learning</span>
    </div>
    <div className="space-y-1.5">
      <p className="text-[9px] text-muted-foreground leading-snug flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-sky shrink-0" />
        Kids prefer low-spice
      </p>
      <p className="text-[9px] text-muted-foreground leading-snug flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        Wed → takeout works
      </p>
      <p className="text-[9px] text-muted-foreground leading-snug flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        Thu under 25 min
      </p>
    </div>
  </GlassCard>
);

const StreakBadge = () => (
  <GlassCard size="sm" halo="coral" padding="xs" outerClassName="inline-block">
    <div className="flex items-center gap-1.5">
      <Flame className="w-4 h-4 text-coral" />
      <span className="text-[11px] font-bold text-foreground">5-day streak 🔥</span>
    </div>
  </GlassCard>
);

const PhoneMockup = () => (
  <div className="relative w-[200px]" style={{ perspective: "800px" }}>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
      <div className="w-[200px] h-[400px] rounded-[40px] bg-gradient-to-b from-primary/15 via-sky/8 to-accent/10 blur-[50px]" />
    </div>
    <div
      className="rounded-[24px] p-[2px] shadow-[0_20px_60px_-15px_hsl(var(--foreground)/0.3)]"
      style={{
        transform: "rotateY(-3deg) rotateX(1deg)",
        background: "linear-gradient(145deg, hsl(var(--foreground)/0.8), hsl(var(--foreground)/0.6), hsl(var(--foreground)/0.7))",
      }}
    >
      <div className="rounded-[22px] bg-background overflow-hidden">
        <div className="flex items-center justify-between px-3.5 pt-1.5 pb-0.5">
          <span className="text-[8px] font-semibold text-foreground/60">9:41</span>
          <div className="w-14 h-3.5 bg-foreground/85 rounded-full" />
          <div className="w-2.5 h-1.5 border border-foreground/40 rounded-[2px]">
            <div className="w-1.5 h-full bg-primary/50 rounded-[1px]" />
          </div>
        </div>
        <div className="px-1 pb-1.5 pt-0.5">
          <DinnerCheckInPreview />
        </div>
        <div className="flex justify-center pb-1">
          <div className="w-16 h-[3px] bg-foreground/20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-24 pb-2 md:pt-28 md:pb-4 px-4 relative gradient-mesh">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/10 via-sky/8 to-transparent blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-32 -left-16 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-coral/8 via-accent/6 to-transparent blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full glass uppercase tracking-wider text-primary">
                Built to learn your family
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold tracking-tight text-foreground leading-[1.15] mb-4">
              <span className="relative inline-block h-[1.3em] overflow-hidden align-bottom" style={{ minWidth: "3ch" }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    className="inline-block"
                    style={{ paddingBottom: "0.25em" }}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="bg-gradient-to-r from-primary via-sage-dark to-primary bg-clip-text text-transparent">{rotatingWords[wordIndex]}</span>
                    <span className="text-foreground">,</span>
                  </motion.span>
                </AnimatePresence>
              </span>{" "}
              <span className="relative inline-block">
                <span>handled</span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-primary/50 to-primary/20 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                />
              </span>
              .
              <br />
              <span className="text-muted-foreground text-[0.55em] font-sans font-normal">
                Every single week.
              </span>
            </h1>




            <ul className="space-y-1.5 mb-4 max-w-lg">
              {[
                { icon: CalendarDays, text: "Automatic weekly plan: cook, leftovers, takeout, dine out." },
                { icon: Brain, text: "Learns your family: picky eaters, sports nights, budgets." },
                { icon: Sparkles, text: "Groceries and leftovers optimized so you waste less food." },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>

            <p className="text-sm text-muted-foreground/70 mb-6 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary/60" />
              5 minutes to set up · Smarter every week after that
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Button size="lg" className="text-base px-8 h-12 rounded-xl bg-gradient-to-r from-primary to-sage-dark hover:from-primary/90 hover:to-sage-dark/90 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]" asChild>
                <Link to="/signup">
                  Plan this week's dinners <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground/50 sm:self-center">
                Free · No credit card · 2 min signup
              </p>
            </div>

            {/* Social proof badge */}
            <motion.div
              className="mt-5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              <div className="relative inline-flex">
                <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-primary/20 via-border/40 to-sky/15" />
                <div className="relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-background/95 backdrop-blur-sm border border-border/50 shadow-md">
                  <div className="flex -space-x-1.5">
                    {[
                      { icon: Clock, bg: "from-primary to-sage-dark" },
                      { icon: Sparkles, bg: "from-sky to-primary" },
                      { icon: Flame, bg: "from-coral to-accent" },
                    ].map((item, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.bg} border-2 border-background flex items-center justify-center`}
                      >
                        <item.icon className="w-3 h-3 text-primary-foreground" />
                      </span>
                    ))}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs font-semibold text-foreground cursor-help">
                          Families reclaim <span className="text-primary">2+ hours</span> of dinner stress every week.
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[240px] text-center">
                        <p className="text-xs">Source: BLS Consumer Expenditure Survey, 2024</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Desktop: Phone + floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="hidden md:flex items-center justify-center gap-3"
          >
            {/* Left column — Weekly Plan card */}
            <motion.div
              className="self-start mt-12 shrink-0 hidden lg:block"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <WeeklyPlanCard />
            </motion.div>

            {/* Center — Phone with streak badge */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              >
                <StreakBadge />
              </motion.div>
              <PhoneMockup />
            </div>

            {/* Right column — System Learning card */}
            <motion.div
              className="self-end mb-10 shrink-0 hidden lg:block"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <SystemLearningCard />
            </motion.div>
          </motion.div>

          {/* Mobile — Phone + cards below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="md:hidden flex flex-col items-center gap-4"
          >
            {/* Streak badge */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <StreakBadge />
            </motion.div>

            {/* Phone */}
            <PhoneMockup />

            {/* Cards row below phone */}
            <div className="flex items-start justify-center gap-3 w-full max-w-[340px]">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <WeeklyPlanCard />
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <SystemLearningCard />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
