import { useMemo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type PlanDay } from "./types";

interface WeeklyDinnerProgressProps {
  days: PlanDay[];
  checkedInDays: Set<string>;
  onRetroCheckin?: (day: PlanDay) => void;
}

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CelebrationBurst = () => {
  const rays = Array.from({ length: 8 });
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.8, ease: "easeOut" }}
    >
      {rays.map((_, i) => {
        const angle = (i * 360) / rays.length;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * 28,
              y: Math.sin(rad) * 28,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          />
        );
      })}
    </motion.div>
  );
};

const WeeklyDinnerProgress = ({ days, checkedInDays, onRetroCheckin }: WeeklyDinnerProgressProps) => {
  const jsDay = new Date().getDay();
  const todayDow = jsDay === 0 ? 6 : jsDay - 1;
  const prevCountRef = useRef<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [justCompletedDay, setJustCompletedDay] = useState<number | null>(null);

  const completedCount = useMemo(
    () => days.filter((d) => checkedInDays.has(d.id)).length,
    [days, checkedInDays]
  );

  const allComplete = completedCount === 7;

  useEffect(() => {
    if (prevCountRef.current !== null && completedCount > prevCountRef.current) {
      const newlyChecked = days.find(
        (d) => checkedInDays.has(d.id) && d.day_of_week !== undefined
      );
      if (newlyChecked) {
        setJustCompletedDay(newlyChecked.day_of_week);
        setTimeout(() => setJustCompletedDay(null), 800);
      }
      if (completedCount === 7) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2500);
      }
    }
    prevCountRef.current = completedCount;
  }, [completedCount, days, checkedInDays]);

  const getMessage = () => {
    if (allComplete) return "Great week. Your family ran dinner smoothly all week.";
    if (completedCount === 0) return "Dinner check-ins help the system improve next week's plan.";
    if (completedCount >= 5) return "Your week is running smoothly.";
    return `${completedCount} of 7 dinners logged this week`;
  };

  if (days.length === 0) return null;

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm relative overflow-hidden">
      <AnimatePresence>
        {allComplete && (
          <motion.div
            className="absolute inset-0 bg-primary/[0.04] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      <CardContent className="py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Week progress
          </p>
          <AnimatePresence mode="wait">
            {allComplete && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2.5 py-0.5"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
                Week completed
                {showCelebration && <CelebrationBurst />}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots with connecting line */}
        <div className="relative">
          {/* Background line */}
          <div className="absolute top-[10px] sm:top-[12px] left-[7%] right-[7%] h-0.5 bg-border rounded-full" />
          {/* Filled line */}
          <motion.div
            className="absolute top-[10px] sm:top-[12px] left-[7%] h-0.5 bg-primary/40 rounded-full"
            initial={false}
            animate={{ width: `${(completedCount / 7) * 86}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {/* Dots */}
          <div className="relative flex items-start justify-between">
            {SHORT_DAYS.map((label, i) => {
              const day = days.find((d) => d.day_of_week === i);
              const isComplete = day ? checkedInDays.has(day.id) : false;
              const isToday = i === todayDow;
              const justCompleted = justCompletedDay === i;

              const isPast = i < todayDow;
              const canRetroCheckin = isPast && !isComplete && !!day && !!onRetroCheckin;

              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <div className="relative">
                    <motion.button
                      type="button"
                      disabled={!canRetroCheckin}
                      onClick={() => canRetroCheckin && day && onRetroCheckin(day)}
                      title={canRetroCheckin ? `Check in for ${label}` : undefined}
                      className={`
                        rounded-full border-2 flex items-center justify-center transition-colors duration-300
                        ${isToday ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5"}
                        ${
                          isComplete
                            ? "bg-primary border-primary"
                            : isToday
                            ? "border-primary/50 bg-primary/10"
                            : canRetroCheckin
                            ? "border-primary/30 bg-primary/5 cursor-pointer hover:border-primary/60 hover:bg-primary/10 active:scale-110"
                            : "border-border bg-background"
                        }
                      `}
                      initial={false}
                      animate={
                        justCompleted
                          ? { scale: [1, 1.4, 1], transition: { duration: 0.4 } }
                          : {}
                      }
                    >
                      {isComplete && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                        </motion.div>
                      )}
                      {canRetroCheckin && (
                        <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary/40" />
                      )}
                    </motion.button>
                    <AnimatePresence>
                      {justCompleted && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-primary"
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs leading-none ${
                      isToday
                        ? "font-semibold text-foreground"
                        : isComplete
                        ? "font-medium text-primary"
                        : canRetroCheckin
                        ? "font-medium text-primary/60 cursor-pointer"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={getMessage()}
            className="text-xs sm:text-sm text-muted-foreground text-center mt-4"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {getMessage()}
          </motion.p>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default WeeklyDinnerProgress;
