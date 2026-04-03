import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Flame, ShoppingCart, Brain, Sparkles } from "lucide-react";
import DinnerCheckInPreview from "./DinnerCheckInPreview";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-8 md:pt-36 md:pb-16 px-4 relative overflow-hidden gradient-mesh">
      {/* Animated decorative orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/10 via-sky/8 to-transparent blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-32 -left-16 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-coral/8 via-accent/6 to-transparent blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-gradient-to-bl from-violet/6 to-transparent blur-3xl animate-pulse-soft" style={{ animationDelay: "3s" }} />

        {/* Floating glass orbs */}
        <div className="hidden md:block absolute top-[18%] left-[6%] w-16 h-16 rounded-full glass animate-float opacity-60" />
        <div className="hidden md:block absolute top-[60%] right-[8%] w-10 h-10 rounded-full glass animate-float-slow opacity-40" />
        <div className="hidden md:block absolute bottom-[20%] left-[20%] w-6 h-6 rounded-full bg-gradient-to-r from-coral to-accent opacity-30 animate-float" style={{ animationDelay: "1s" }} />
        <div className="hidden md:block absolute top-[30%] right-[18%] w-4 h-4 rounded-full bg-gradient-to-r from-sky to-primary opacity-25 animate-float-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full glass text-primary uppercase tracking-wider">
                Built to learn your family
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold tracking-tight text-foreground leading-[1.08] mb-5">
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

            <p className="text-lg text-muted-foreground leading-relaxed mb-3 max-w-lg">
              Most families spend 30 minutes every night figuring out dinner.
              Family Food OS learns your family and handles it for you — automatically.
            </p>

            <p className="text-sm text-muted-foreground/70 mb-8 flex items-center gap-1.5">
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

            {/* Social proof with glass pills */}
            <div className="mt-6 flex items-center gap-3">
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

          {/* Right — Check-in card with glass frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Glass frame behind */}
            <div className="absolute -inset-3 rounded-3xl glass opacity-50 hidden md:block" />
            <p className="text-center text-xs text-muted-foreground/60 mb-3 font-medium relative z-10 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary/50" />
              After dinner, it learns in 10 seconds
            </p>
            <div className="relative z-10">
              <DinnerCheckInPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
