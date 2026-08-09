import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Lock, Check, CalendarHeart, ShieldCheck } from "lucide-react";
import { useHouseholdProgress } from "@/hooks/useHouseholdProgress";
import { streakLine, type MomentumStats } from "@/lib/gamification";

interface MomentumCardProps {
  householdId: string;
  /** Nights logged in the current plan week. */
  weekLogged: number;
  weekTotal?: number;
  /** Change this whenever a check-in is saved to refresh the stats. */
  refreshKey?: unknown;
  onViewRecap?: () => void;
}

const StatPill = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex-1 min-w-0 rounded-xl bg-muted/40 px-3 py-2.5 text-center">
    <p className="text-base font-serif font-semibold text-foreground leading-none">{value}</p>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 mt-1 truncate">{label}</p>
  </div>
);

/**
 * The "come back tomorrow" panel: household level, streak with its
 * recovery state, week ring, lifetime stats and the next unlock.
 */
const MomentumCard = ({
  householdId,
  weekLogged,
  weekTotal = 7,
  refreshKey,
  onViewRecap,
}: MomentumCardProps) => {
  const { records, loading, stats } = useHouseholdProgress(householdId, refreshKey);

  const m: MomentumStats = useMemo(
    () => stats(weekLogged, weekTotal),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [records, weekLogged, weekTotal],
  );

  if (loading || m.totalCheckIns === 0) return null;

  const isSunday = new Date().getDay() === 0;
  const flameTone =
    m.streak.current >= 7 ? "text-accent" : m.streak.current >= 3 ? "text-accent/80" : "text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="glass-card border-border/40 rounded-2xl overflow-hidden">
        <CardContent className="p-5 sm:p-6 space-y-4">
          {/* Level header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground/60 uppercase">
                Your momentum
              </p>
              <h3 className="font-serif font-semibold text-lg text-foreground mt-1 leading-snug">
                Level {m.level.level} · {m.level.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{m.level.blurb}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 rounded-full bg-muted/50 border border-border px-2.5 py-1.5">
              <motion.div
                animate={m.streak.current >= 3 ? { scale: [1, 1.18, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Flame className={`w-4 h-4 ${flameTone}`} />
              </motion.div>
              <span className="text-sm font-semibold text-foreground">{m.streak.current}</span>
            </div>
          </div>

          {/* Level progress */}
          <div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(m.level.progress * 100)}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
            {m.level.next && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {m.level.next - m.totalCheckIns} more dinner
                {m.level.next - m.totalCheckIns === 1 ? "" : "s"} to reach{" "}
                <span className="text-foreground font-medium">{m.level.nextTitle}</span>
              </p>
            )}
          </div>

          {/* Week ring */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground/70 font-medium">
                This week
              </span>
              <span className="text-[11px] text-muted-foreground">
                {m.weekLogged}/{m.weekTotal} logged
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: m.weekTotal }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < m.weekLogged ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>

          {/* Streak state / recovery */}
          <div className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5">
            {m.streak.usedGrace ? (
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            ) : (
              <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            )}
            <p className="text-[11px] text-muted-foreground leading-snug">{streakLine(m.streak)}</p>
          </div>

          {/* Lifetime stats */}
          <div className="flex gap-2">
            <StatPill label="Dinners logged" value={m.totalCheckIns} />
            <StatPill label="Best streak" value={m.streak.longest} />
            <StatPill label="Wins" value={m.wins} />
            <StatPill label="Perfect weeks" value={m.perfectWeeks} />
          </div>

          {/* Next unlock */}
          {m.nextMilestone ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border px-3 py-2.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {m.nextMilestone.emoji} {m.nextMilestone.title}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {m.nextMilestone.count - m.totalCheckIns} more to unlock · {m.nextMilestone.reward}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2.5">
              <Trophy className="w-3.5 h-3.5 text-accent shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Every milestone unlocked. You've logged {m.totalCheckIns} dinners.
              </p>
            </div>
          )}

          {/* Sunday ritual */}
          {isSunday && onViewRecap && (
            <button
              onClick={onViewRecap}
              className="w-full min-h-[48px] rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            >
              <CalendarHeart className="w-4 h-4" />
              Your week in dinners is ready
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MomentumCard;
