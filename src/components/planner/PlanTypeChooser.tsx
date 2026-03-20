import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Zap } from "lucide-react";
import { DAYS } from "./types";

interface PlanTypeChooserProps {
  remainingDays: number;
  todayDow: number;
  onChooseFullWeek: () => void;
  onChoosePartialWeek: () => void;
  /** Pre-highlight a recommended option based on saved preference */
  recommended?: "full_week" | "partial_week" | null;
}

const PlanTypeChooser = ({ remainingDays, todayDow, onChooseFullWeek, onChoosePartialWeek, recommended }: PlanTypeChooserProps) => {
  const remainingDayNames = Array.from({ length: remainingDays }, (_, i) => DAYS[(todayDow + i) % 7]);
  const preview = remainingDayNames.length <= 4 ? remainingDayNames.join(", ") : `${remainingDayNames.slice(0, 3).join(", ")}…`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="text-center mb-4">
        <h2 className="text-lg font-serif font-semibold text-foreground">
          What would you like to plan?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          It's {DAYS[todayDow]} — {remainingDays} day{remainingDays !== 1 ? "s" : ""} left this week.
        </p>
      </div>

      {/* Option: Plan next week */}
      <motion.button
        onClick={onChooseFullWeek}
        className="w-full text-left group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card className={`transition-all group-hover:shadow-md ${recommended === "full_week" ? "border-primary/40 bg-primary/[0.03] shadow-sm" : "border-primary/20 hover:border-primary/40"}`}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Plan next week</p>
                {recommended === "full_week" && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Your usual</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start fresh with a full Monday–Sunday plan
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.button>

      {/* Option: Plan remaining days */}
      <motion.button
        onClick={onChoosePartialWeek}
        className="w-full text-left group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className={`transition-all group-hover:shadow-md ${recommended === "partial_week" ? "border-primary/40 bg-primary/[0.03] shadow-sm" : "border-border hover:border-primary/30"}`}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Plan the next few days</p>
                {recommended === "partial_week" && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Your usual</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quick plan for {preview}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.button>
    </motion.div>
  );
};

export default PlanTypeChooser;
