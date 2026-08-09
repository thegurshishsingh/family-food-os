// ============================================================
// Gamification / momentum engine
// ============================================================
// Everything here is derived from existing `evening_checkins`
// rows — no extra tables, no extra writes. Pure functions so the
// same numbers can be reused by cards, recaps and celebrations.
// ============================================================

export interface CheckInRecord {
  created_at: string;
  outcome?: string | null;
}

export interface StreakResult {
  /** Current consecutive-day streak (a single missed day is forgiven once). */
  current: number;
  /** Best streak ever recorded. */
  longest: number;
  /** True when the streak is only alive because of the one-time grace day. */
  usedGrace: boolean;
  /** True when they haven't logged today yet but the streak is still alive. */
  atRisk: boolean;
  /** True when a streak was recently broken and can be restarted today. */
  broken: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  blurb: string;
  /** Dinners logged needed to reach this level. */
  floor: number;
  /** Dinners logged needed for the next level (null at max). */
  next: number | null;
  nextTitle: string | null;
  /** 0-1 progress towards the next level. */
  progress: number;
}

export interface Milestone {
  count: number;
  title: string;
  reward: string;
  emoji: string;
}

export interface MomentumStats {
  totalCheckIns: number;
  streak: StreakResult;
  level: LevelInfo;
  weekLogged: number;
  weekTotal: number;
  perfectWeeks: number;
  wins: number;
  nextMilestone: Milestone | null;
  milestonesUnlocked: Milestone[];
}

export const LEVELS: { level: number; title: string; blurb: string; floor: number }[] = [
  { level: 1, title: "Getting Started", blurb: "Your first dinners on the record.", floor: 0 },
  { level: 2, title: "Rhythm Finder", blurb: "A week of real data. Patterns incoming.", floor: 7 },
  { level: 3, title: "Week Runner", blurb: "Three weeks in. Your plans fit your life now.", floor: 21 },
  { level: 4, title: "Dinner Captain", blurb: "Fifty dinners. You run this kitchen.", floor: 50 },
  { level: 5, title: "Kitchen Veteran", blurb: "A hundred dinners logged. Serious rhythm.", floor: 100 },
  { level: 6, title: "Household Legend", blurb: "Two hundred dinners. Nothing surprises you.", floor: 200 },
];

export const MILESTONES: Milestone[] = [
  { count: 3, title: "First 3 dinners", reward: "Your plan starts learning your household.", emoji: "🌱" },
  { count: 7, title: "A full week logged", reward: "Weekly Dinner Pattern unlocked.", emoji: "📈" },
  { count: 14, title: "Two weeks", reward: "Smarter swaps based on what actually worked.", emoji: "🔁" },
  { count: 30, title: "30 dinners", reward: "Family Food Profile gets real depth.", emoji: "🧭" },
  { count: 50, title: "50 dinners", reward: "Long-term trends unlocked.", emoji: "📊" },
  { count: 100, title: "100 dinners", reward: "Legend status. You've built the habit.", emoji: "🏆" },
];

export const STREAK_MILESTONES = [3, 5, 7, 14, 21, 30, 50, 100];

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((da - db) / 86_400_000);
}

/**
 * Current streak with a single forgiven miss ("life happens" day).
 * Once the grace day is spent, the next gap ends the streak.
 */
export function computeStreak(records: CheckInRecord[], now = new Date()): StreakResult {
  const keys = [...new Set(records.map((r) => toDateKey(new Date(r.created_at))))].sort((a, b) =>
    a > b ? -1 : 1,
  );

  const longest = computeLongestStreak(keys);

  if (keys.length === 0) {
    return { current: 0, longest: 0, usedGrace: false, atRisk: false, broken: false };
  }

  const todayKey = toDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoKey = toDateKey(twoDaysAgo);

  const loggedToday = keys[0] === todayKey;
  const alive = loggedToday || keys[0] === yesterdayKey || keys[0] === twoDaysAgoKey;

  if (!alive) {
    return { current: 0, longest, usedGrace: false, atRisk: false, broken: longest > 0 };
  }

  // A stale head (2 days ago) already burns the grace day.
  let usedGrace = keys[0] === twoDaysAgoKey;
  let count = 1;
  for (let i = 1; i < keys.length; i++) {
    const gap = daysBetween(keys[i - 1], keys[i]);
    if (gap === 1) {
      count++;
    } else if (gap === 2 && !usedGrace) {
      usedGrace = true;
      count++;
    } else {
      break;
    }
  }

  return { current: count, longest: Math.max(longest, count), usedGrace, atRisk: !loggedToday, broken: false };
}

function computeLongestStreak(sortedDescKeys: string[]): number {
  if (sortedDescKeys.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedDescKeys.length; i++) {
    if (daysBetween(sortedDescKeys[i - 1], sortedDescKeys[i]) === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function getLevel(totalCheckIns: number): LevelInfo {
  let current = LEVELS[0];
  for (const l of LEVELS) if (totalCheckIns >= l.floor) current = l;
  const nextLevel = LEVELS.find((l) => l.floor > current.floor) ?? null;
  const span = nextLevel ? nextLevel.floor - current.floor : 1;
  const done = totalCheckIns - current.floor;
  return {
    level: current.level,
    title: current.title,
    blurb: current.blurb,
    floor: current.floor,
    next: nextLevel ? nextLevel.floor : null,
    nextTitle: nextLevel ? nextLevel.title : null,
    progress: nextLevel ? Math.min(1, Math.max(0, done / span)) : 1,
  };
}

export function getNextMilestone(totalCheckIns: number): Milestone | null {
  return MILESTONES.find((m) => m.count > totalCheckIns) ?? null;
}

export function getUnlockedMilestones(totalCheckIns: number): Milestone[] {
  return MILESTONES.filter((m) => m.count <= totalCheckIns);
}

/** The streak milestone that was crossed by going from `prev` to `next`. */
export function crossedStreakMilestone(prev: number, next: number): number | null {
  return STREAK_MILESTONES.find((m) => next >= m && prev < m) ?? null;
}

const POSITIVE_OUTCOMES = new Set(["cooked_loved", "cooked_fine", "leftovers"]);

export function computeMomentum(
  records: CheckInRecord[],
  opts: { weekLogged?: number; weekTotal?: number; now?: Date } = {},
): MomentumStats {
  const now = opts.now ?? new Date();
  const totalCheckIns = new Set(records.map((r) => toDateKey(new Date(r.created_at)))).size;
  const streak = computeStreak(records, now);
  const wins = records.filter((r) => r.outcome && POSITIVE_OUTCOMES.has(r.outcome)).length;

  // Perfect weeks = ISO weeks with 7 distinct logged days.
  const perWeek = new Map<string, Set<string>>();
  for (const r of records) {
    const d = new Date(r.created_at);
    const monday = new Date(d);
    const dow = (d.getDay() + 6) % 7;
    monday.setDate(d.getDate() - dow);
    const key = toDateKey(monday);
    if (!perWeek.has(key)) perWeek.set(key, new Set());
    perWeek.get(key)!.add(toDateKey(d));
  }
  const perfectWeeks = [...perWeek.values()].filter((s) => s.size >= 7).length;

  return {
    totalCheckIns,
    streak,
    level: getLevel(totalCheckIns),
    weekLogged: opts.weekLogged ?? 0,
    weekTotal: opts.weekTotal ?? 7,
    perfectWeeks,
    wins,
    nextMilestone: getNextMilestone(totalCheckIns),
    milestonesUnlocked: getUnlockedMilestones(totalCheckIns),
  };
}

/** Encouraging, non-shaming line for the current streak state. */
export function streakLine(s: StreakResult): string {
  if (s.current === 0 && s.broken) return "Streak reset — one log tonight starts it again.";
  if (s.current === 0) return "Log tonight to start your streak.";
  if (s.usedGrace && s.atRisk) return "Streak saver used. Log tonight to lock it in.";
  if (s.usedGrace) return "Missed a night — we kept your streak alive.";
  if (s.atRisk) return "Still alive. Log tonight to keep it going.";
  if (s.current >= 30) return "A full month of dinners. Extraordinary.";
  if (s.current >= 21) return "Three weeks straight. Legendary.";
  if (s.current >= 14) return "Two weeks. Unstoppable.";
  if (s.current >= 7) return "A full week. The habit is real.";
  if (s.current >= 5) return "Five nights strong.";
  if (s.current >= 3) return "Momentum is building.";
  if (s.current === 2) return "Two in a row — keep it going.";
  return "First night on the board.";
}
