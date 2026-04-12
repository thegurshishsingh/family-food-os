import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/cb3b18e2-2443-4f09-9a29-12bfcf41aa76.jpg";

const PAIN_POINTS = [
  "What's for dinner tonight?",
  "I forgot to defrost the chicken...",
  "The kids won't eat that!",
  "We just had takeout twice this week",
  "I'm so tired of planning meals",
  "There's nothing in the fridge",
];

const MobileWelcome = () => {
  const [painIdx, setPainIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPainIdx((prev) => (prev + 1) % PAIN_POINTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="block md:hidden min-h-screen bg-background flex flex-col items-center justify-between px-6 py-12 safe-top safe-bottom">
      {/* Top: Logo */}
      <motion.div
        className="flex flex-col items-center gap-3 pt-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src={logoImg} alt="Family Food OS" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
        <span className="font-serif text-2xl font-semibold text-foreground">Family Food OS</span>
      </motion.div>

      {/* Middle: rotating pain points + benefits */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-sm">
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={painIdx}
              className="text-lg text-muted-foreground italic text-center font-serif"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              "{PAIN_POINTS[painIdx]}"
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-full space-y-3">
          {[
            { icon: CalendarDays, text: "AI-powered weekly dinner plans" },
            { icon: ShoppingCart, text: "Auto-generated grocery lists" },
            { icon: Sparkles, text: "Learns your family's preferences" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom: CTA */}
      <motion.div
        className="w-full max-w-sm space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <Button asChild className="w-full h-14 text-base font-semibold rounded-xl shadow-md">
          <Link to="/signup">Get Started</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default MobileWelcome;
