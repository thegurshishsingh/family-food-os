import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Flame, ShoppingCart, Brain, Sparkles, TrendingUp, CalendarDays, Utensils, Package, Store } from "lucide-react";
import DinnerCheckInPreview from "./DinnerCheckInPreview";

const HeroSection = () => {
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
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full glass text-primary uppercase tracking-wider">
                Built to learn your family
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold tracking-tight text-foreground leading-[1.08] mb-4">
              Dinner,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-sage-dark to-primary bg-clip-text text-transparent">handled</span>
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

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-2 max-w-lg">
              Most families spend 30 minutes every night figuring out dinner.
              Family Food OS learns your family and handles it for you — automatically.
            </p>

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

            {/* Social proof */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  { icon: Flame, bg: "from-coral to-accent" },
                  { icon: ShoppingCart, bg: "from-primary to-sage-dark" },
                  { icon: Sparkles, bg: "from-primary to-sky" },
                  { icon: Clock, bg: "from-accent to-primary" },
                ].map((item, i) => (
                  <span
                    key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.bg} border-2 border-background flex items-center justify-center`}
                  >
                    <item.icon className="w-3.5 h-3.5 text-primary-foreground" />
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Families save 4+ hrs</span>{" "}
                of dinner decisions every week
              </p>
            </div>
          </motion.div>

          {/* Right — Phone + floating cards composition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="hidden md:grid grid-cols-[130px_190px_140px] grid-rows-[auto_1fr_auto] gap-x-3 gap-y-2 items-center justify-center"
          >
            {/* Row 1: empty | streak badge | empty */}
            <div />
            <motion.div
              className="justify-self-center"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <div className="relative inline-block">
                <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-br from-coral/30 via-lemon/20 to-accent/25 blur-[0.5px]" />
                <div className="relative rounded-lg glass-strong px-3 py-1.5 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-coral" />
                    <span className="text-[10px] font-bold text-foreground">5-day streak</span>
                  </div>
                </div>
              </div>
            </motion.div>
            <div />

            {/* Row 2: weekly plan | phone | system learning */}
            <motion.div
              className="self-start mt-4"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-primary/30 via-sky/25 to-accent/20 blur-[0.5px]" />
                <div className="relative rounded-xl glass-strong p-2.5 shadow-lg">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center">
                      <CalendarDays className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                    <span className="text-[9px] font-bold text-foreground">This Week</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { day: "Mon", icon: Utensils, mode: "Cook", gradient: "from-primary to-sage-dark" },
                      { day: "Tue", icon: Package, mode: "Leftovers", gradient: "from-sky to-primary" },
                      { day: "Wed", icon: Store, mode: "Takeout", gradient: "from-coral to-accent" },
                    ].map((d) => (
                      <div key={d.day} className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold text-muted-foreground w-5">{d.day}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase text-primary-foreground bg-gradient-to-r ${d.gradient}`}>
                          <d.icon className="w-2 h-2" />
                          {d.mode}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[8px] font-bold text-primary">
                    <TrendingUp className="w-2.5 h-2.5" />
                    Reality: 84
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Phone */}
            <div className="relative" style={{ perspective: "800px" }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                <div className="w-[200px] h-[400px] rounded-[40px] bg-gradient-to-b from-primary/15 via-sky/8 to-accent/10 blur-[50px]" />
              </div>
              <div
                className="rounded-[24px] p-[2px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
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

            <motion.div
              className="self-end mb-6"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-sky/30 via-primary/20 to-accent/25 blur-[0.5px]" />
                <div className="relative rounded-xl glass-strong p-2.5 shadow-lg">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-sky to-primary flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                    <span className="text-[9px] font-bold text-foreground">System Learning</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] text-muted-foreground leading-snug flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-sky shrink-0" />
                      Kids prefer low-spice meals
                    </p>
                    <p className="text-[8px] text-muted-foreground leading-snug flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                      Wed → takeout night works
                    </p>
                    <p className="text-[8px] text-muted-foreground leading-snug flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                      Thu meals under 25 min
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Mobile — just phone, no floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="md:hidden flex justify-center"
          >
            <div className="w-[200px]" style={{ perspective: "800px" }}>
              <div
                className="rounded-[24px] p-[2px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
