import { motion } from "framer-motion";
import { Flame, Sparkles, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MilestoneShareCard from "./MilestoneShareCard";
import {
  crossedStreakMilestone,
  getLevel,
  getNextMilestone,
  streakLine,
  type StreakResult,
} from "@/lib/gamification";

const ConfettiParticle = ({ index, total }: { index: number; total: number }) => {
  const angle = (index / total) * 360;
  const distance = 60 + Math.random() * 110;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const colors = ["bg-accent", "bg-primary", "bg-sage", "bg-warm", "bg-primary/70", "bg-accent/70"];
  const size = 4 + Math.random() * 6;
  const rotation = Math.random() * 360;
  return (
    <motion.div
      className={`absolute rounded-sm ${colors[index % colors.length]}`}
      style={{ width: size, height: size, top: "35%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x: [0, x * 0.6, x],
        y: [0, y * 0.6 - 40, y + 80],
        opacity: [1, 1, 0],
        scale: [0, 1.15, 0.5],
        rotate: [0, rotation, rotation * 2],
      }}
      transition={{ duration: 1.3 + Math.random() * 0.6, ease: "easeOut" }}
    />
  );
};

interface CheckInRewardProps {
  /** Streak state *after* tonight's log. */
  streak: StreakResult;
  /** Streak value before tonight's log, for milestone detection. */
  previousStreak: number;
  /** Distinct nights logged, all-time, including tonight. */
  totalCheckIns: number;
  /** Nights logged in the current week, including tonight. */
  weekLogged: number;
  weekTotal?: number;
  /** The learning line generated from what they picked. */
  smartLine: string;
  /** Household name, printed on the shareable milestone card. */
  householdName?: string;
}

/**
 * The reward moment: shown for a few seconds right after a dinner is
 * logged. Streak, week ring, level progress and the next unlock — the
 * reason to come back tomorrow.
 */
const CheckInReward = ({
  streak,
  previousStreak,
  totalCheckIns,
  weekLogged,
  weekTotal = 7,
  smartLine,
  householdName,
}: CheckInRewardProps) => {
  const milestone = crossedStreakMilestone(previousStreak, streak.current);
  const level = getLevel(totalCheckIns);
  const nextMilestone = getNextMilestone(totalCheckIns);
  const celebrate = Boolean(milestone) || weekLogged === weekTotal;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden bg-primary/[0.04] border-primary/15">
        {celebrate && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 26 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} total={26} />
            ))}
          </div>
        )}
        <CardContent className="relative p-5 sm:p-6 space-y-4">
          {/* Headline */}
          <div className="flex items-start gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
            >
              {streak.current > 0 ? (
                <Flame className="w-4.5 h-4.5 text-accent" />
              ) : (
                <Sparkles className="w-4 h-4 text-primary" />
              )}
            </motion.div>
            <div className="min-w-0">
              <p className="font-serif font-semibold text-base text-foreground leading-snug">
                {milestone
                  ? `${milestone}-night streak!`
                  : weekLogged === weekTotal
                    ? "Perfect week. Every dinner logged."
                    : `Logged. ${streak.current} night${streak.current === 1 ? "" : "s"} in a row.`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{smartLine}</p>
            </div>
          </div>

          {/* Week ring */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground/70 font-medium">
                This week
              </span>
              <span className="text-[11px] text-muted-foreground">
                {weekLogged}/{weekTotal} nights
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: weekTotal }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0.4, opacity: 0.4 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className={`h-1.5 flex-1 rounded-full ${i < weekLogged ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>

          {/* Level progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-foreground">
                Level {level.level} · {level.title}
              </span>
              {level.next && (
                <span className="text-[11px] text-muted-foreground">
                  {level.next - totalCheckIns} to {level.nextTitle}
                </span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(level.progress * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Next unlock */}
          {nextMilestone && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                <span className="text-foreground font-medium">
                  {nextMilestone.count - totalCheckIns} more night
                  {nextMilestone.count - totalCheckIns === 1 ? "" : "s"}
                </span>{" "}
                → {nextMilestone.reward}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground/70">{streakLine(streak)}</p>
            {celebrate && (
              <MilestoneShareCard
                data={{
                  value: milestone ? String(milestone) : `${weekLogged}/${weekTotal}`,
                  unit: milestone ? "nights in a row" : "dinners logged",
                  headline: milestone ? `${milestone}-night dinner streak` : "A perfect week of dinners",
                  subline: milestone
                    ? "Real dinners, logged as they actually happened."
                    : "Every night of the week, logged and learned from.",
                  levelTitle: `Level ${level.level} · ${level.title}`,
                  householdName,
                }}
              />
            )}
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CheckInReward;
