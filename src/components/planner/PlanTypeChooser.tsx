import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Zap } from "lucide-react";
import { DAYS } from "./types";

interface PlanTypeChooserProps {
  remainingDays: number;
  todayDow: number;
  onChooseFullWeek: () => void;
  onChoosePartialWeek: () => void;
}

const PlanTypeChooser = ({ remainingDays, todayDow, onChooseFullWeek, onChoosePartialWeek }: PlanTypeChooserProps) => {
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
      <button onClick={onChooseFullWeek} className="w-full text-left group">
        <Card className="border-primary/20 hover:border-primary/40 transition-all group-hover:shadow-md">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Plan next week</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start fresh with a full Monday–Sunday plan
              </p>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Option: Plan remaining days */}
      <button onClick={onChoosePartialWeek} className="w-full text-left group">
        <Card className="border-border hover:border-primary/30 transition-all group-hover:shadow-md">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Plan the next few days</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quick plan for {preview}
              </p>
            </div>
          </CardContent>
        </Card>
      </button>
    </motion.div>
  );
};

export default PlanTypeChooser;
