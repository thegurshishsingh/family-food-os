import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Star, Zap } from "lucide-react";

const MILESTONES = [3, 5, 7, 14, 21, 30, 50, 100];
const MILESTONE_CONFIG: Record<number, { icon: typeof Trophy; title: string; subtitle: string; gradient: string }> = {
  3: { icon: Zap, title: "3-day streak!", subtitle: "You're building a habit.", gradient: "from-amber-400 to-orange-500" },
  5: { icon: Star, title: "5 days strong!", subtitle: "Halfway to a full week.", gradient: "from-amber-500 to-orange-600" },
  7: { icon: Trophy, title: "Full week! 🎉", subtitle: "The habit is real. Keep going.", gradient: "from-orange-500 to-red-500" },
  14: { icon: Trophy, title: "Two weeks! 🏆", subtitle: "Unstoppable. Your family's rhythm is locked in.", gradient: "from-red-500 to-pink-500" },
  21: { icon: Trophy, title: "Three weeks! 👑", subtitle: "Legendary status. You've mastered the dinner check-in.", gradient: "from-pink-500 to-purple-500" },
  30: { icon: Trophy, title: "30-day streak! 🌟", subtitle: "A whole month. You're an inspiration.", gradient: "from-purple-500 to-indigo-500" },
  50: { icon: Trophy, title: "50 days! 💎", subtitle: "Elite tier. Dinner planning is second nature.", gradient: "from-indigo-500 to-blue-500" },
  100: { icon: Trophy, title: "100 days! 🔥", subtitle: "Absolutely legendary. Take a bow.", gradient: "from-blue-500 to-cyan-500" },
};

interface CheckInStreakProps {
  householdId: string;
  checkedInCount: number;
}

// Confetti particle component
const ConfettiParticle = ({ index, total }: { index: number; total: number }) => {
  const angle = (index / total) * 360;
  const distance = 80 + Math.random() * 120;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const colors = [
    "bg-amber-400", "bg-orange-500", "bg-red-400", "bg-pink-400",
    "bg-purple-400", "bg-indigo-400", "bg-blue-400", "bg-emerald-400",
  ];
  const color = colors[index % colors.length];
  const size = 4 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      className={`absolute rounded-sm ${color}`}
      style={{ width: size, height: size, top: "50%", left: "50%", originX: 0.5, originY: 0.5 }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x: [0, x * 0.6, x],
        y: [0, y * 0.6 - 40, y + 60],
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.6],
        rotate: [0, rotation, rotation * 2],
      }}
      transition={{ duration: 1.4 + Math.random() * 0.6, ease: "easeOut" }}
    />
  );
};

const CheckInStreak = ({ householdId, checkedInCount }: CheckInStreakProps) => {
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState("");
  const [milestoneHit, setMilestoneHit] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevStreakRef = useRef<number | null>(null);

  useEffect(() => {
    computeStreak();
  }, [householdId, checkedInCount]);

  const computeStreak = async () => {
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

    const uniqueDates = [
      ...new Set(
        data.map((r) => {
          const d = new Date(r.created_at);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        })
      ),
    ].sort((a, b) => (a > b ? -1 : 1));

    const today = new Date();
    const todayStr = formatDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      setStreak(0);
      setMessage("");
      return;
    }

    let count = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1] + "T00:00:00");
      const curr = new Date(uniqueDates[i] + "T00:00:00");
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        count++;
      } else {
        break;
      }
    }

    // Only check milestones after initial load (not on mount)
    const prevStreak = prevStreakRef.current;
    if (prevStreak !== null && count > prevStreak) {
      const crossedMilestone = MILESTONES.find((m) => count >= m && prevStreak < m);
      if (crossedMilestone) {
        setMilestoneHit(crossedMilestone);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
        setTimeout(() => setMilestoneHit(null), 4000);
      }
    }
    prevStreakRef.current = count;

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

  const currentMilestone = milestoneHit ? MILESTONE_CONFIG[milestoneHit] : null;

  return (
    <div className="relative">
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

      {/* Milestone celebration overlay */}
      <AnimatePresence>
        {milestoneHit && currentMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute left-0 top-full mt-3 z-50"
          >
            <div className={`relative overflow-visible rounded-2xl bg-gradient-to-br ${currentMilestone.gradient} p-[1px] shadow-xl`}>
              <div className="rounded-2xl bg-background/95 backdrop-blur-sm px-6 py-4 min-w-[260px]">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <currentMilestone.icon className="w-8 h-8 text-amber-500" />
                  </motion.div>
                  <div>
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="font-serif font-bold text-lg text-foreground"
                    >
                      {currentMilestone.title}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-muted-foreground"
                    >
                      {currentMilestone.subtitle}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Confetti burst */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <ConfettiParticle key={i} index={i} total={28} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckInStreak;
