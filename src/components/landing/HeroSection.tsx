import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Flame, Brain, Sparkles, TrendingUp, CalendarDays, Utensils, Package, Store } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DinnerCheckInPreview from "./DinnerCheckInPreview";
import { GlassCard, IconTile } from "./primitives";

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
  return (
    <section className="pt-28 pb-8 md:pt-36 md:pb-16 px-4 relative">
      {/* Soft editorial backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-sage/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full bg-accent/[0.06] blur-3xl" />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-px bg-primary/40" />
              <span className="inline-block text-[11px] font-medium uppercase tracking-[0.22em] text-primary/80">
                A weekly dinner system
              </span>
            </div>

            <h1 className="text-[2.5rem] sm:text-5xl md:text-[4rem] lg:text-[4.5rem] font-serif font-medium tracking-[-0.02em] text-foreground leading-[1.02] mb-6">
              Never wonder<br />
              what's for dinner<br />
              <span className="italic text-primary">again.</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-xl mb-8 font-light">
              Family Food OS builds a weekly dinner plan around your real life,
              then learns what worked so next week gets easier.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <Button
                size="lg"
                className="text-base px-9 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.5)] transition-all hover:shadow-[0_10px_36px_-8px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5"
                asChild
              >
                <Link to="/signup">
                  Start your week <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground/70 sm:self-center">
                Free to start · 5 min setup
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-3 text-sm text-muted-foreground/80"
            >
              <Clock className="w-4 h-4 text-primary/60" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      Families reclaim <span className="text-foreground font-medium">2+ hours</span> of dinner stress every week.
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[240px] text-center">
                    <p className="text-xs">Source: BLS Consumer Expenditure Survey, 2024</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
