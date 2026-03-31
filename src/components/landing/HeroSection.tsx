import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import DinnerCheckInPreview from "./DinnerCheckInPreview";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-8 md:pt-36 md:pb-16 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">🍽️</span>
              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-sage-light text-primary border border-primary/10 uppercase tracking-wider">
                For real families
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold tracking-tight text-foreground leading-[1.08] mb-5">
              "What's for{" "}
              <span className="relative inline-block">
                <span className="text-primary">dinner</span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-[3px] bg-primary/30 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                />
              </span>
              ?"
              <br />
              <span className="text-muted-foreground text-[0.6em] font-sans font-normal">
                Finally answered. Every night.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-3 max-w-lg">
              Stop the 5pm panic. Family Food OS learns what your family
              actually eats and plans your whole week — cook nights, takeout,
              leftovers, all of it.
            </p>

            <p className="text-sm text-muted-foreground/70 mb-8 flex items-center gap-1.5">
              <span>⏱️</span> 5 minutes to set up · Smarter every week after that
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Button size="lg" className="text-base px-8 h-12 rounded-xl" asChild>
                <Link to="/signup">
                  Plan this week's dinners <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground/50 sm:self-center">
                Free · No credit card · 2 min signup
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["👩‍🍳", "👨‍👧", "👩‍👦‍👦", "👨‍👩‍👧"].map((e, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-full bg-sage-light border-2 border-background flex items-center justify-center text-sm"
                  >
                    {e}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Families save 4+ hrs</span>{" "}
                of dinner decisions every week
              </p>
            </div>
          </motion.div>

          {/* Right — Check-in card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -top-4 -left-4 text-4xl opacity-60 select-none hidden md:block">🫶</div>
            <div className="absolute -bottom-3 -right-3 text-3xl opacity-50 select-none hidden md:block">✨</div>
            <p className="text-center text-xs text-muted-foreground/60 mb-3 font-medium">
              ↓ After dinner, it learns in 10 seconds
            </p>
            <DinnerCheckInPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
