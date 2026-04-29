import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, X, ChevronLeft, Hand, ArrowUpDown } from "lucide-react";

const COACH_MARK_KEY = "dinnerwise_swipe_coach_seen";

interface SwipeCoachMarkProps {
  show: boolean;
}

const SwipeCoachMark = ({ show }: SwipeCoachMarkProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    const seen = localStorage.getItem(COACH_MARK_KEY);
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(COACH_MARK_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-foreground text-background rounded-xl px-4 py-3 mx-1 mb-3 shadow-lg"
        >
          {/* Arrow pointing down */}
          <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-foreground rotate-45 rounded-sm" />

          <button
            onClick={dismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <p className="text-xs font-semibold mb-2.5">Quick gestures</p>

          <div className="flex flex-col gap-2">
            {/* Swipe left hint */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-accent shrink-0">
                <ChevronLeft className="w-3.5 h-3.5 animate-pulse" />
                <ChevronLeft className="w-3.5 h-3.5 animate-pulse -ml-2" />
              </div>
              <div className="flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px]">Swipe left to swap</span>
              </div>
            </div>

            {/* Long press hint */}
            <div className="flex items-center gap-2">
              <Hand className="w-3.5 h-3.5 text-primary-foreground shrink-0" />
              <span className="text-[11px]">Hold to view nutrition, ingredients & instructions</span>
            </div>

            {/* Reorder hint */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-primary-foreground shrink-0" />
              <span className="text-[11px]">Tap the arrows to reorder meals</span>
            </div>
          </div>

          <button
            onClick={dismiss}
            className="mt-2.5 text-[11px] font-medium text-background/60 hover:text-background/90 transition-colors"
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwipeCoachMark;
