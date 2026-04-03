import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Flame, ShoppingCart, Brain, Sparkles, TrendingUp, CalendarDays, Utensils, Package } from "lucide-react";
import DinnerCheckInPreview from "./DinnerCheckInPreview";
import { HeroFoodDecorations } from "./FloatingFoodDecorations";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-6 md:pt-32 md:pb-10 px-4 relative overflow-hidden gradient-mesh">
      {/* Animated decorative orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/10 via-sky/8 to-transparent blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-32 -left-16 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-coral/8 via-accent/6 to-transparent blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-gradient-to-bl from-violet/6 to-transparent blur-3xl animate-pulse-soft" style={{ animationDelay: "3s" }} />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
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
                  className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-primary/50 to-sky/30 rounded-full"
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
                  { icon: ShoppingCart, bg: "from-primary to-sky" },
                  { icon: Sparkles, bg: "from-violet to-primary" },
                  { icon: Clock, bg: "from-lemon to-accent" },
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

          {/* Right — Phone mockup with floating glass screens */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            {/* Floating food decorations around the phone */}
            <HeroFoodDecorations />

            {/* Ambient glow behind phone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[320px] h-[420px] md:w-[380px] md:h-[500px] rounded-[40px] bg-gradient-to-br from-primary/15 via-sky/10 to-violet/12 blur-[60px]" />
            </div>

            {/* Phone frame */}
            <div className="relative z-10 w-[280px] md:w-[300px]">
              {/* Phone bezel */}
              <div className="rounded-[32px] bg-gradient-to-b from-foreground/90 to-foreground/80 p-[3px] shadow-2xl shadow-foreground/20">
                <div className="rounded-[29px] bg-background overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5 bg-gradient-to-b from-primary/5 to-transparent">
                    <span className="text-[10px] font-semibold text-foreground/70">9:41</span>
                    <div className="w-20 h-5 bg-foreground/90 rounded-full mx-auto" /> {/* Notch */}
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-2 border border-foreground/50 rounded-sm">
                        <div className="w-2 h-full bg-primary/60 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Phone content — DinnerCheckIn */}
                  <div className="px-2 pb-3 pt-1">
                    <DinnerCheckInPreview />
                  </div>
                </div>
              </div>
              {/* Phone bottom bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-foreground/30 rounded-full" />
            </div>

            {/* Floating glass card — Weekly Plan (left) */}
            <motion.div
              className="absolute -left-6 md:-left-12 top-[15%] z-20 hidden md:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-primary/25 via-sky/15 to-transparent blur-[0.5px]" />
                <div className="relative w-[160px] rounded-xl glass-strong p-3 shadow-lg border border-border/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-sky flex items-center justify-center">
                      <CalendarDays className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-bold text-foreground">This Week</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { day: "Mon", icon: Utensils, mode: "Cook", gradient: "from-primary to-sage-dark" },
                      { day: "Tue", icon: Package, mode: "Leftovers", gradient: "from-sky to-primary" },
                      { day: "Wed", icon: Utensils, mode: "Cook", gradient: "from-primary to-sage-dark" },
                    ].map((d) => (
                      <div key={d.day} className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-muted-foreground w-6">{d.day}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-primary-foreground bg-gradient-to-r ${d.gradient}`}>
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
                </div>
              </div>
            </motion.div>

            {/* Floating glass card — Learning (right) */}
            <motion.div
              className="absolute -right-4 md:-right-10 bottom-[18%] z-20 hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-violet/25 via-coral/15 to-transparent blur-[0.5px]" />
                <div className="relative w-[170px] rounded-xl glass-strong p-3 shadow-lg border border-border/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet to-primary flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-bold text-foreground">System Learning</span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] text-muted-foreground leading-snug">
                      🧒 Kids prefer low-spice meals
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-snug">
                      📅 Wed → takeout night works
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-snug">
                      ⏱ Thu meals under 25 min
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating glass card — Streak (top-right) */}
            <motion.div
              className="absolute right-2 md:right-0 -top-2 md:top-[2%] z-20"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-coral/20 via-lemon/15 to-transparent blur-[0.5px]" />
                <div className="relative rounded-xl glass-strong px-3 py-2 shadow-lg border border-border/20">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-coral" />
                    <span className="text-[11px] font-bold text-foreground">5-day streak</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
