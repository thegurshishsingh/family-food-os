import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckInNudgeProps {
  householdId: string;
  planId: string;
}

const CheckInNudge = ({ householdId, planId }: CheckInNudgeProps) => {
  const [show, setShow] = useState(false);
  const [mealName, setMealName] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkIfNeeded();
  }, [planId]);

  const checkIfNeeded = async () => {
    // Only show after 4pm local time
    const hour = new Date().getHours();
    if (hour < 16) return;

    const jsDay = new Date().getDay();
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    const { data: dayData } = await supabase
      .from("plan_days")
      .select("id, meal_name")
      .eq("plan_id", planId)
      .eq("day_of_week", dayOfWeek)
      .limit(1);

    if (!dayData || dayData.length === 0 || !dayData[0].meal_name) return;

    // Check if already checked in
    const { data: existing } = await supabase
      .from("evening_checkins")
      .select("id")
      .eq("plan_day_id", dayData[0].id)
      .limit(1);

    if (!existing || existing.length === 0) {
      setMealName(dayData[0].meal_name);
      setShow(true);
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3"
        >
          <MessageCircle className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              How did tonight go?
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Quick check-in for <span className="font-medium">{mealName}</span>
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1.5">
            <Link to="/checkin">Check in</Link>
          </Button>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckInNudge;
