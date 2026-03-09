import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

interface CheckInStreakProps {
  householdId: string;
  /** Set of plan_day_ids checked in this session — triggers recount */
  checkedInCount: number;
}

const CheckInStreak = ({ householdId, checkedInCount }: CheckInStreakProps) => {
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    computeStreak();
  }, [householdId, checkedInCount]);

  const computeStreak = async () => {
    // Get all check-in dates (distinct days) ordered descending
    const { data } = await supabase
      .from("evening_checkins")
      .select("created_at")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) {
      setStreak(0);
      setMessage("");
      return;
    }

    // Extract unique dates (in local timezone)
    const uniqueDates = [
      ...new Set(
        data.map((r) => {
          const d = new Date(r.created_at);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        })
      ),
    ].sort((a, b) => (a > b ? -1 : 1)); // descending

    // Count consecutive days ending today or yesterday
    const today = new Date();
    const todayStr = formatDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    // Streak must include today or yesterday
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      setStreak(0);
      setMessage("");
      return;
    }

    let count = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1] + "T00:00:00");
      const curr = new Date(uniqueDates[i] + "T00:00:00");
      const diffMs = prev.getTime() - curr.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        count++;
      } else {
        break;
      }
    }

    setStreak(count);
    setMessage(getStreakMessage(count));
  };

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const getStreakMessage = (n: number): string => {
    if (n >= 21) return "Legendary. Three weeks straight!";
    if (n >= 14) return "Two-week streak. Unstoppable.";
    if (n >= 7) return "Full week! The habit is forming.";
    if (n >= 5) return "Five days strong 💪";
    if (n >= 3) return "Building momentum!";
    if (n === 2) return "Two in a row — keep it going!";
    return "First check-in! Come back tomorrow.";
  };

  if (streak === 0) return null;

  const flameColor =
    streak >= 7 ? "text-orange-500" : streak >= 3 ? "text-amber-500" : "text-muted-foreground";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border"
      >
        <motion.div
          animate={streak >= 3 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Flame className={`w-4 h-4 ${flameColor}`} />
        </motion.div>
        <span className="text-sm font-semibold text-foreground">{streak}</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default CheckInStreak;
