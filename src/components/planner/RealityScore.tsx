import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { WeeklyPlan } from "./types";

interface RealityScoreProps {
  plan: WeeklyPlan;
}

const RealityScore = ({ plan }: RealityScoreProps) => {
  if (plan.reality_score === null) return null;

  const isLow = (plan.reality_score || 0) < 60;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`mb-6 ${isLow ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-sage-light"}`}>
        <CardContent className="py-4 flex items-start gap-3">
          {isLow ? (
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          ) : (
            <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-medium text-sm text-foreground">
              Reality Score: {plan.reality_score}/100
            </p>
            {plan.reality_message && (
              <p className="text-sm text-muted-foreground mt-0.5">{plan.reality_message}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RealityScore;
