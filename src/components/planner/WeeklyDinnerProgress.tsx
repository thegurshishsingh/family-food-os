import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { DAYS, type PlanDay } from "./types";

interface WeeklyDinnerProgressProps {
  days: PlanDay[];
  checkedInDays: Set<string>;
}

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WeeklyDinnerProgress = ({ days, checkedInDays }: WeeklyDinnerProgressProps) => {
  const jsDay = new Date().getDay();
  const todayDow = jsDay === 0 ? 6 : jsDay - 1;

  const completedCount = useMemo(
    () => days.filter((d) => checkedInDays.has(d.id)).length,
    [days, checkedInDays]
  );

  const allComplete = completedCount === 7;

  const getMessage = () => {
    if (allComplete) return "Great week. Your family ran dinner smoothly all week.";
    if (completedCount === 0) return "Dinner check-ins help the system improve next week's plan.";
    if (completedCount >= 5) return "Your week is running smoothly.";
    return `${completedCount} of 7 dinners logged this week`;
  };

  if (days.length === 0) return null;

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardContent className="py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Week progress
          </p>
          <AnimatePresence>
            {allComplete && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2.5 py-0.5"
              >
                <CheckCircle2 className="w-3 h-3" />
                Week completed
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-between gap-1">
          {SHORT_DAYS.map((label, i) => {
            const day = days.find((d) => d.day_of_week === i);
            const isComplete = day ? checkedInDays.has(day.id) : false;
            const isToday = i === todayDow;

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <motion.div
                  className={`
                    rounded-full border-2 flex items-center justify-center transition-colors duration-300
                    ${isToday ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5"}
                    ${
                      isComplete
                        ? "bg-primary border-primary"
                        : isToday
                        ? "border-primary/50 bg-primary/10"
                        : "border-border bg-transparent"
                    }
                  `}
                  initial={false}
                  animate={
                    isComplete
                      ? { scale: [1, 1.3, 1], transition: { duration: 0.35 } }
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
                </motion.div>
                <span
                  className={`text-[10px] sm:text-xs leading-none ${
                    isToday
                      ? "font-semibold text-foreground"
                      : isComplete
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Connecting line behind dots */}
        <div className="relative -mt-[29px] sm:-mt-[33px] mx-auto px-2 sm:px-3 pointer-events-none mb-5">
          <div className="h-0.5 bg-border rounded-full" />
          <motion.div
            className="absolute top-0 left-0 h-0.5 bg-primary/40 rounded-full"
            style={{ marginLeft: "inherit", marginRight: "inherit" }}
            initial={false}
            animate={{ width: `${(completedCount / 7) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Summary text */}
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          {getMessage()}
        </p>
      </CardContent>
    </Card>
  );
};

export default WeeklyDinnerProgress;
