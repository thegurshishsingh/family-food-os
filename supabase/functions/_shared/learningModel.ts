// ============================================================
// Layered Learning Model
// ============================================================
// Aggregates feedback, check-ins, and execution signals into
// structured insights the AI can reason over — and the UI can
// surface as "What we learned this week".
//
// Memory horizon: weighted layers
//   - Last 28 days  ×3
//   - Last 90 days  ×2
//   - All-time      ×1
//
// All counts in the public Insight object are *weighted* sums.
// ============================================================

const DAY_MS = 24 * 60 * 60 * 1000;

type FeedbackRow = {
  meal_name: string;
  feedback: string; // loved | kids_refused | too_hard | great_leftovers | reorder | ...
  created_at: string;
  plan_day_id?: string | null;
};

type CheckinRow = {
  tags: string[] | null;
  effort_level: string | null;
  outcome?: string | null;     // canonical structured outcome (added 2026-04)
  plan_day_id: string;
  created_at: string;
};

type PlanDayRow = {
  id: string;
  day_of_week: number;
  meal_name: string | null;
  cuisine_type: string | null;
  prep_time_minutes: number | null;
  meal_mode: string;
  was_swapped?: boolean | null;
};

export type LearningInsights = {
  // Per-cuisine sentiment
  cuisinesLoved: { cuisine: string; score: number }[];
  cuisinesAvoided: { cuisine: string; score: number }[];

  // Per-protein sentiment (heuristic from meal name)
  proteinsLoved: { protein: string; score: number }[];
  proteinsAvoided: { protein: string; score: number }[];

  // Per-day-of-week patterns (0=Mon..6=Sun)
  dayPatterns: {
    day_of_week: number;
    effortTooHardRate: number;
    kidsRefusedRate: number;
    orderedOutRate: number;
    sampleSize: number;
  }[];

  // Plan execution (across all weeks observed)
  cookThroughRate: number | null;     // cooked / (cooked + ordered_out)
  swapRate: number;                   // swapped meals / total cook plan_days observed
  effortOverloadRate: number;         // % check-ins marked too_much

  // Tolerance drift — has the family started skipping/swapping long-prep meals?
  prepToleranceDrift: "tightening" | "stable" | "loosening" | null;
  recommendedMaxPrep: number | null;  // suggested cap based on what they actually cook

  // Hard rules derived from feedback
  hardExcludeMeals: string[];         // disliked 2+ times in last 28 days
  softAvoidMeals: string[];           // disliked 1x in last 28 days
  lovedMeals: string[];               // any love in last 90 days

  // Confidence
  totalFeedback: number;
  totalCheckins: number;
};

// ─── Helpers ─────────────────────────────────────────────────

function weightForAge(createdAt: string, now: number): number {
  const ageDays = (now - new Date(createdAt).getTime()) / DAY_MS;
  if (ageDays <= 28) return 3;
  if (ageDays <= 90) return 2;
  return 1;
}

// Best-effort protein extraction from a meal name.
const PROTEIN_KEYWORDS: Array<[string, RegExp]> = [
  ["chicken",   /\b(chicken|poulet|rotisserie)\b/i],
  ["beef",      /\b(beef|steak|burger|brisket|meatball|meatloaf)\b/i],
  ["pork",      /\b(pork|bacon|ham|sausage|chorizo|prosciutto)\b/i],
  ["seafood",   /\b(salmon|tuna|cod|shrimp|prawn|fish|tilapia|halibut|scallop|crab|lobster|seafood)\b/i],
  ["turkey",    /\b(turkey)\b/i],
  ["lamb",      /\b(lamb)\b/i],
  ["tofu",      /\b(tofu|tempeh|seitan)\b/i],
  ["eggs",      /\b(egg|frittata|omelet|quiche|shakshuka)\b/i],
  ["beans",     /\b(bean|lentil|chickpea|hummus|dal|chili)\b/i],
  ["pasta",     /\b(pasta|spaghetti|lasagna|fettuccine|penne|ravioli|gnocchi|noodle|ramen|udon)\b/i],
  ["pizza",     /\b(pizza|flatbread|calzone)\b/i],
  ["vegetable", /\b(veggie|vegetable|salad|stir.?fry)\b/i],
];

function extractProtein(mealName: string | null | undefined): string | null {
  if (!mealName) return null;
  for (const [label, re] of PROTEIN_KEYWORDS) {
    if (re.test(mealName)) return label;
  }
  return null;
}

const POSITIVE_FEEDBACK = new Set(["loved", "reorder", "great_leftovers"]);
const NEGATIVE_FEEDBACK = new Set(["kids_refused", "too_hard", "not_again"]);

const POSITIVE_TAGS = new Set(["everyone_liked", "easy_win", "great_leftovers", "cooked_it"]);
const NEGATIVE_TAGS = new Set(["kids_refused", "too_hard", "not_again", "ordered_out"]);

// ─── Main entry point ────────────────────────────────────────

export function computeLearningInsights(args: {
  feedback: FeedbackRow[];
  checkins: CheckinRow[];
  planDays: PlanDayRow[];   // all plan_days the user has had (for swap rate, day patterns)
  now?: number;
}): LearningInsights {
  const now = args.now ?? Date.now();
  const dayMap = new Map(args.planDays.map(d => [d.id, d]));
  const twentyEightDaysAgo = now - 28 * DAY_MS;

  // ── Cuisine + protein sentiment from feedback ──
  const cuisineSent: Record<string, number> = {};
  const proteinSent: Record<string, number> = {};
  // Also build meal-level dislike counts for hard-exclude rule
  const dislikeCounts: Record<string, { count: number; lastAt: string }> = {};
  const lovedNames = new Set<string>();

  for (const f of args.feedback) {
    const w = weightForAge(f.created_at, now);
    const direction = POSITIVE_FEEDBACK.has(f.feedback) ? +1 : NEGATIVE_FEEDBACK.has(f.feedback) ? -1 : 0;
    if (direction === 0) continue;

    // Find the linked plan_day for cuisine
    const pd = f.plan_day_id ? dayMap.get(f.plan_day_id) : undefined;
    const cuisine = pd?.cuisine_type;
    if (cuisine) cuisineSent[cuisine] = (cuisineSent[cuisine] ?? 0) + direction * w;

    const protein = extractProtein(pd?.meal_name) ?? extractProtein(f.meal_name);
    if (protein) proteinSent[protein] = (proteinSent[protein] ?? 0) + direction * w;

    // Loved/dislike tracking (unweighted, recency window only)
    const created = new Date(f.created_at).getTime();
    if (direction > 0 && created >= now - 90 * DAY_MS) lovedNames.add(f.meal_name);
    if (NEGATIVE_FEEDBACK.has(f.feedback) && created >= twentyEightDaysAgo) {
      const cur = dislikeCounts[f.meal_name] ?? { count: 0, lastAt: f.created_at };
      cur.count += 1;
      if (f.created_at > cur.lastAt) cur.lastAt = f.created_at;
      dislikeCounts[f.meal_name] = cur;
    }
  }

  const cuisinesLoved = Object.entries(cuisineSent)
    .filter(([_, s]) => s > 0).sort((a, b) => b[1] - a[1])
    .slice(0, 5).map(([cuisine, score]) => ({ cuisine, score: Math.round(score * 10) / 10 }));
  const cuisinesAvoided = Object.entries(cuisineSent)
    .filter(([_, s]) => s < 0).sort((a, b) => a[1] - b[1])
    .slice(0, 5).map(([cuisine, score]) => ({ cuisine, score: Math.round(score * 10) / 10 }));
  const proteinsLoved = Object.entries(proteinSent)
    .filter(([_, s]) => s > 0).sort((a, b) => b[1] - a[1])
    .slice(0, 5).map(([protein, score]) => ({ protein, score: Math.round(score * 10) / 10 }));
  const proteinsAvoided = Object.entries(proteinSent)
    .filter(([_, s]) => s < 0).sort((a, b) => a[1] - b[1])
    .slice(0, 5).map(([protein, score]) => ({ protein, score: Math.round(score * 10) / 10 }));

  const hardExcludeMeals = Object.entries(dislikeCounts)
    .filter(([_, v]) => v.count >= 2).map(([n]) => n);
  const softAvoidMeals = Object.entries(dislikeCounts)
    .filter(([_, v]) => v.count === 1).map(([n]) => n);
  const lovedMeals = Array.from(lovedNames);

  // ── Per-day-of-week patterns from check-ins ──
  type DayAcc = { tooHard: number; kidsRefused: number; orderedOut: number; total: number };
  const dayAcc: Record<number, DayAcc> = {};
  let totalTooMuch = 0, totalCooked = 0, totalOrderedOut = 0;

  for (const c of args.checkins) {
    const pd = dayMap.get(c.plan_day_id);
    if (!pd) continue;
    const dow = pd.day_of_week;
    if (!dayAcc[dow]) dayAcc[dow] = { tooHard: 0, kidsRefused: 0, orderedOut: 0, total: 0 };
    const acc = dayAcc[dow];
    acc.total += 1;
    if (c.effort_level === "too_much") { acc.tooHard += 1; totalTooMuch += 1; }
    const tags = c.tags ?? [];
    if (tags.includes("kids_refused")) acc.kidsRefused += 1;
    if (tags.includes("ordered_out")) { acc.orderedOut += 1; totalOrderedOut += 1; }
    if (tags.includes("cooked_it")) totalCooked += 1;
  }

  const dayPatterns = Object.entries(dayAcc).map(([dow, v]) => ({
    day_of_week: Number(dow),
    effortTooHardRate: v.total ? v.tooHard / v.total : 0,
    kidsRefusedRate: v.total ? v.kidsRefused / v.total : 0,
    orderedOutRate: v.total ? v.orderedOut / v.total : 0,
    sampleSize: v.total,
  })).filter(p => p.sampleSize >= 2);

  // ── Plan execution ──
  const totalCheckins = args.checkins.length;
  const cookThroughRate = (totalCooked + totalOrderedOut) > 0
    ? totalCooked / (totalCooked + totalOrderedOut) : null;
  const effortOverloadRate = totalCheckins ? totalTooMuch / totalCheckins : 0;

  // Swap rate: across cook plan_days
  const cookPlanDays = args.planDays.filter(d => d.meal_mode === "cook");
  const swappedCount = cookPlanDays.filter(d => d.was_swapped === true).length;
  const swapRate = cookPlanDays.length ? swappedCount / cookPlanDays.length : 0;

  // ── Prep tolerance drift ──
  // Look at prep times of cook days that were NOT swapped + had positive check-ins
  // vs prep times of cook days that WERE swapped or had too_hard.
  let acceptedPrepSum = 0, acceptedPrepN = 0;
  let rejectedPrepSum = 0, rejectedPrepN = 0;
  for (const pd of cookPlanDays) {
    if (!pd.prep_time_minutes) continue;
    const checkin = args.checkins.find(c => c.plan_day_id === pd.id);
    const tags = checkin?.tags ?? [];
    const accepted = !pd.was_swapped &&
      (POSITIVE_TAGS.has("cooked_it") && tags.includes("cooked_it"));
    const rejected = pd.was_swapped || checkin?.effort_level === "too_much" || tags.includes("too_hard") || tags.includes("ordered_out");
    if (accepted) { acceptedPrepSum += pd.prep_time_minutes; acceptedPrepN += 1; }
    else if (rejected) { rejectedPrepSum += pd.prep_time_minutes; rejectedPrepN += 1; }
  }
  let prepToleranceDrift: LearningInsights["prepToleranceDrift"] = null;
  let recommendedMaxPrep: number | null = null;
  if (acceptedPrepN >= 3 || rejectedPrepN >= 3) {
    const avgAccepted = acceptedPrepN ? acceptedPrepSum / acceptedPrepN : null;
    const avgRejected = rejectedPrepN ? rejectedPrepSum / rejectedPrepN : null;
    if (avgAccepted !== null && avgRejected !== null) {
      if (avgRejected - avgAccepted > 8) prepToleranceDrift = "tightening";
      else if (avgAccepted - avgRejected > 8) prepToleranceDrift = "loosening";
      else prepToleranceDrift = "stable";
    } else if (avgAccepted !== null) {
      prepToleranceDrift = "stable";
    } else {
      prepToleranceDrift = "tightening";
    }
    if (avgAccepted !== null) {
      recommendedMaxPrep = Math.round(avgAccepted + 5);
    } else if (avgRejected !== null) {
      recommendedMaxPrep = Math.max(15, Math.round(avgRejected - 10));
    }
  }

  return {
    cuisinesLoved, cuisinesAvoided,
    proteinsLoved, proteinsAvoided,
    dayPatterns,
    cookThroughRate, swapRate, effortOverloadRate,
    prepToleranceDrift, recommendedMaxPrep,
    hardExcludeMeals, softAvoidMeals, lovedMeals,
    totalFeedback: args.feedback.length,
    totalCheckins,
  };
}

// ─── Render insights as a prompt block for the AI ────────────

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function renderInsightsForPrompt(ins: LearningInsights): string {
  const lines: string[] = [];
  lines.push("\n📊 LEARNING MODEL — Aggregated signals from this family's history (recent feedback weighted 3×, mid-term 2×, all-time 1×). Use these as soft preferences:");

  if (ins.cuisinesLoved.length || ins.cuisinesAvoided.length) {
    lines.push("\n  CUISINE SENTIMENT:");
    if (ins.cuisinesLoved.length) lines.push(`    ❤️ Loved: ${ins.cuisinesLoved.map(c => `${c.cuisine} (+${c.score})`).join(", ")} → favor these`);
    if (ins.cuisinesAvoided.length) lines.push(`    👎 Avoided: ${ins.cuisinesAvoided.map(c => `${c.cuisine} (${c.score})`).join(", ")} → use sparingly or skip`);
  }

  if (ins.proteinsLoved.length || ins.proteinsAvoided.length) {
    lines.push("\n  PROTEIN SENTIMENT:");
    if (ins.proteinsLoved.length) lines.push(`    ❤️ Loved: ${ins.proteinsLoved.map(p => `${p.protein} (+${p.score})`).join(", ")}`);
    if (ins.proteinsAvoided.length) lines.push(`    👎 Avoided: ${ins.proteinsAvoided.map(p => `${p.protein} (${p.score})`).join(", ")} → minimize or substitute`);
  }

  if (ins.dayPatterns.length) {
    lines.push("\n  DAY-OF-WEEK PATTERNS:");
    for (const p of ins.dayPatterns) {
      const notes: string[] = [];
      if (p.effortTooHardRate > 0.4) notes.push(`feels too hard ${Math.round(p.effortTooHardRate * 100)}% of the time → SIMPLIFY`);
      if (p.kidsRefusedRate > 0.3) notes.push(`kids refuse ${Math.round(p.kidsRefusedRate * 100)}% → kid-friendly required`);
      if (p.orderedOutRate > 0.3) notes.push(`family orders out ${Math.round(p.orderedOutRate * 100)}% → consider takeout`);
      if (notes.length) lines.push(`    ${DAY_NAMES[p.day_of_week]}: ${notes.join("; ")} (n=${p.sampleSize})`);
    }
  }

  lines.push("\n  EXECUTION SIGNALS:");
  if (ins.cookThroughRate !== null) {
    const pct = Math.round(ins.cookThroughRate * 100);
    lines.push(`    Cook-through rate: ${pct}% — ${pct >= 75 ? "plan calibrated well" : pct >= 50 ? "moderate; simplify further" : "low; plan is too ambitious, drastically simplify"}`);
  }
  if (ins.swapRate > 0) {
    const pct = Math.round(ins.swapRate * 100);
    lines.push(`    Swap rate: ${pct}% of cook meals get swapped${pct > 25 ? " → AI suggestions are missing the mark, lean on saved meals + loved cuisines" : ""}`);
  }
  if (ins.effortOverloadRate > 0.3) {
    lines.push(`    Effort overload: ${Math.round(ins.effortOverloadRate * 100)}% of meals felt too hard → cut average prep time`);
  }
  if (ins.prepToleranceDrift && ins.recommendedMaxPrep) {
    lines.push(`    Prep tolerance: ${ins.prepToleranceDrift} → keep cook nights under ~${ins.recommendedMaxPrep} min`);
  }

  if (ins.hardExcludeMeals.length) {
    lines.push(`\n  🚫 HARD EXCLUDE (disliked 2+ times in 28d) — never include these or close variations:\n${ins.hardExcludeMeals.map(m => `    - ${m}`).join("\n")}`);
  }
  if (ins.softAvoidMeals.length) {
    lines.push(`  Soft-avoid (disliked once recently): ${ins.softAvoidMeals.slice(0, 8).join(", ")}`);
  }
  if (ins.lovedMeals.length) {
    lines.push(`  ❤️ Loved (recent 90d) — variations welcome: ${ins.lovedMeals.slice(0, 10).join(", ")}`);
  }

  return lines.join("\n");
}

// ─── Render insights for the user-facing UI card ─────────────

export type UserInsight = {
  icon: "love" | "warn" | "trend" | "info";
  text: string;
};

export function renderInsightsForUser(ins: LearningInsights): UserInsight[] {
  const out: UserInsight[] = [];

  // Cuisine love
  if (ins.cuisinesLoved.length >= 1 && ins.cuisinesLoved[0].score >= 3) {
    const top = ins.cuisinesLoved.slice(0, 2).map(c => c.cuisine).join(" and ");
    out.push({ icon: "love", text: `Your family loves ${top} nights — we'll keep them in rotation.` });
  }

  // Cuisine avoidance
  if (ins.cuisinesAvoided.length >= 1 && ins.cuisinesAvoided[0].score <= -3) {
    out.push({ icon: "warn", text: `${ins.cuisinesAvoided[0].cuisine} hasn't landed well — we'll use it sparingly.` });
  }

  // Protein avoidance (often more striking for users than cuisine)
  if (ins.proteinsAvoided.length >= 1 && ins.proteinsAvoided[0].score <= -3) {
    out.push({ icon: "warn", text: `${capitalize(ins.proteinsAvoided[0].protein)} dishes have gotten pushback — we're cutting back.` });
  }

  // Protein love
  if (ins.proteinsLoved.length >= 1 && ins.proteinsLoved[0].score >= 4) {
    out.push({ icon: "love", text: `${capitalize(ins.proteinsLoved[0].protein)} meals are reliably popular — leaning into them.` });
  }

  // Hard exclude — explicit
  if (ins.hardExcludeMeals.length > 0) {
    const meal = ins.hardExcludeMeals[0];
    out.push({ icon: "warn", text: `"${meal}" got a thumbs-down twice — pulled from rotation for now.` });
  }

  // Day patterns
  const hardDay = ins.dayPatterns.find(p => p.effortTooHardRate > 0.5);
  if (hardDay) {
    out.push({ icon: "trend", text: `${DAY_NAMES[hardDay.day_of_week]}s tend to feel heavy — picking simpler meals for that day.` });
  }
  const takeoutDay = ins.dayPatterns.find(p => p.orderedOutRate > 0.4);
  if (takeoutDay) {
    out.push({ icon: "trend", text: `You usually order out on ${DAY_NAMES[takeoutDay.day_of_week]} — building that in by default.` });
  }

  // Execution signals
  if (ins.cookThroughRate !== null && ins.cookThroughRate < 0.5 && ins.totalCheckins >= 5) {
    out.push({ icon: "warn", text: `Plans have been a stretch lately — we're trimming cook nights to better fit your week.` });
  } else if (ins.cookThroughRate !== null && ins.cookThroughRate >= 0.8 && ins.totalCheckins >= 5) {
    out.push({ icon: "love", text: `You're cooking ${Math.round(ins.cookThroughRate * 100)}% of planned meals — strong execution.` });
  }

  if (ins.swapRate > 0.3) {
    out.push({ icon: "info", text: `Many AI suggestions are getting swapped — leaning more on your saved meals.` });
  }

  if (ins.prepToleranceDrift === "tightening" && ins.recommendedMaxPrep) {
    out.push({ icon: "trend", text: `Shorter recipes are working better lately — capping cook times at ~${ins.recommendedMaxPrep} min.` });
  } else if (ins.prepToleranceDrift === "loosening") {
    out.push({ icon: "trend", text: `You've handled longer recipes well — adding a slightly more involved meal where it fits.` });
  }

  // Limit to top 3 so the card stays scannable
  return out.slice(0, 3);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
