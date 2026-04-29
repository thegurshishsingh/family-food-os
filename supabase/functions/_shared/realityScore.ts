// Deterministic Reality Score calculator.
// Runs AFTER the AI generates the plan, producing a transparent, signal-based 0-100 score.
// We deliberately do NOT trust the AI's self-reported score — it gets recomputed here.

export type ScoreInputs = {
  days: Array<{
    day_of_week: number;
    meal_mode: "cook" | "leftovers" | "takeout" | "dine_out" | "emergency";
    meal_name?: string;
    prep_time_minutes?: number | null;
    calories?: number | null;
    cuisine_type?: string | null;
    takeout_budget?: number | null;
  }>;
  household: {
    num_adults: number;
    num_children: number;
    child_age_bands?: string[] | null;
  };
  preferences?: {
    cooking_time_tolerance?: string | null; // minimal | low | medium | high
    weekly_grocery_budget?: number | null;
    preferred_takeout_frequency?: number | null;
    cuisines_liked?: string[] | null;
    cuisines_disliked?: string[] | null;
    allergies?: string[] | null;
    foods_to_avoid?: string[] | null;
    health_goal?: string | null;
  } | null;
  contextFlags?: string[]; // e.g. ["chaotic_week", "newborn_in_house"]
  // Recent behavioral signals (last 28 days)
  signals?: {
    totalCheckins: number;
    effortTooMuchRate: number;   // 0-1
    cookThroughRate: number | null; // 0-1, null if not enough data
    kidsRefusedRate: number;     // 0-1
    orderedOutRate: number;      // 0-1
    dislikedMealsCount: number;  // 28d window
    lovedMealsCount: number;     // 28d window
  };
};

export type ScoreResult = {
  score: number;          // 0-100
  message: string;        // user-facing summary
  internal_breakdown: Record<string, number>; // for debugging / future UI
};

const TOLERANCE_MAX_PREP: Record<string, number> = {
  minimal: 15,
  low: 25,
  medium: 40,
  high: 60,
};

export function computeRealityScore(inputs: ScoreInputs): ScoreResult {
  const { days, household, preferences, contextFlags = [], signals } = inputs;
  const breakdown: Record<string, number> = {};

  if (!days.length) {
    return { score: 80, message: "Plan ready.", internal_breakdown: {} };
  }

  // Start from a neutral 75 and adjust.
  let score = 75;

  const cookDays = days.filter(d => d.meal_mode === "cook");
  const convenienceDays = days.filter(d =>
    d.meal_mode === "leftovers" || d.meal_mode === "takeout" || d.meal_mode === "dine_out" || d.meal_mode === "emergency"
  );
  const cookRatio = cookDays.length / days.length;

  // 1. Cook-to-convenience balance (target: 50-75% cook for most families)
  let cookAdj = 0;
  if (cookRatio > 0.85) cookAdj = -10;          // almost everything is cook → hard
  else if (cookRatio > 0.7) cookAdj = -3;
  else if (cookRatio >= 0.4) cookAdj = +6;      // sweet spot
  else if (cookRatio >= 0.2) cookAdj = +2;
  else cookAdj = -4;                             // too few cook nights — defeats the purpose
  breakdown.cook_balance = cookAdj;
  score += cookAdj;

  // 2. Prep time vs tolerance
  const tolerance = preferences?.cooking_time_tolerance || "medium";
  const maxPrep = TOLERANCE_MAX_PREP[tolerance] ?? 40;
  const cookPreps = cookDays.map(d => d.prep_time_minutes || 30);
  const avgPrep = cookPreps.length ? cookPreps.reduce((a, b) => a + b, 0) / cookPreps.length : 0;
  const overTolerance = cookPreps.filter(p => p > maxPrep).length;
  let prepAdj = 0;
  if (avgPrep > maxPrep + 15) prepAdj = -12;
  else if (avgPrep > maxPrep) prepAdj = -6;
  else if (avgPrep <= maxPrep * 0.7) prepAdj = +5;
  if (overTolerance >= 3) prepAdj -= 4;
  breakdown.prep_time = prepAdj;
  score += prepAdj;

  // 3. Cuisine variety (no clustering, no consecutive repeats)
  const cuisines = cookDays.map(d => d.cuisine_type).filter(Boolean) as string[];
  const uniqueCuisines = new Set(cuisines).size;
  let varietyAdj = 0;
  if (cookDays.length >= 4) {
    const varietyRatio = uniqueCuisines / cookDays.length;
    if (varietyRatio >= 0.75) varietyAdj = +4;
    else if (varietyRatio >= 0.5) varietyAdj = +1;
    else varietyAdj = -4;
  }
  // consecutive same-cuisine penalty
  let consecutiveRepeats = 0;
  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1];
    const curr = days[i];
    if (prev.cuisine_type && curr.cuisine_type && prev.cuisine_type === curr.cuisine_type) {
      consecutiveRepeats++;
    }
  }
  if (consecutiveRepeats > 0) varietyAdj -= consecutiveRepeats * 3;
  breakdown.variety = varietyAdj;
  score += varietyAdj;

  // 4. Calorie spread (no extreme spikes/dips)
  const cals = days.map(d => d.calories || 0).filter(c => c > 0);
  let calAdj = 0;
  if (cals.length >= 3) {
    const avgCal = cals.reduce((a, b) => a + b, 0) / cals.length;
    const variance = cals.reduce((s, c) => s + Math.pow(c - avgCal, 2), 0) / cals.length;
    const stdev = Math.sqrt(variance);
    if (stdev / avgCal < 0.2) calAdj = +2;
    else if (stdev / avgCal > 0.5) calAdj = -3;
  }
  breakdown.nutrition = calAdj;
  score += calAdj;

  // 5. Family / context adjustments
  let contextAdj = 0;
  const hardContexts = ["chaotic_week", "newborn_in_house", "sick_week", "one_parent_traveling"];
  const activeHard = contextFlags.filter(t => hardContexts.includes(t)).length;
  if (activeHard > 0) {
    // In hard weeks, cook-heavy plans are punished more, convenience-heavy plans rewarded
    if (cookRatio > 0.6) contextAdj = -8 * activeHard;
    else if (cookRatio < 0.4) contextAdj = +4;
  }
  if (household.num_children >= 2 && cookRatio > 0.7 && avgPrep > 30) {
    contextAdj -= 4; // many kids + lots of cooking + slow meals = unrealistic
  }
  breakdown.context = contextAdj;
  score += contextAdj;

  // 6. Behavioral learning (last 28 days)
  let learningAdj = 0;
  if (signals && signals.totalCheckins >= 3) {
    if (signals.effortTooMuchRate > 0.4 && avgPrep > 25) learningAdj -= 8;
    if (signals.effortTooMuchRate > 0.4 && avgPrep <= 20) learningAdj += 3; // we adapted
    if (signals.cookThroughRate !== null) {
      if (signals.cookThroughRate < 0.5 && cookRatio > 0.6) learningAdj -= 6;
      if (signals.cookThroughRate > 0.75) learningAdj += 4;
    }
    if (signals.kidsRefusedRate > 0.3 && household.num_children > 0) learningAdj -= 4;
    if (signals.orderedOutRate > 0.3 && cookRatio > 0.6) learningAdj -= 5;
  }
  breakdown.learning = learningAdj;
  score += learningAdj;

  // Clamp
  score = Math.max(20, Math.min(100, Math.round(score)));

  return {
    score,
    message: buildMessage(score, { cookRatio, avgPrep, tolerance, contextFlags, signals }),
    internal_breakdown: breakdown,
  };
}

function buildMessage(
  score: number,
  ctx: { cookRatio: number; avgPrep: number; tolerance: string; contextFlags: string[]; signals?: ScoreInputs["signals"] }
): string {
  const cookPct = Math.round(ctx.cookRatio * 100);
  const prep = Math.round(ctx.avgPrep);

  if (score >= 85) {
    return `This week looks very doable — ${cookPct}% cook nights at ~${prep} min average. A realistic rhythm.`;
  }
  if (score >= 70) {
    return `Solid balance. ${cookPct}% cook nights at ~${prep} min — manageable with the convenience nights built in.`;
  }
  if (score >= 55) {
    const hint = ctx.signals && ctx.signals.effortTooMuchRate > 0.4
      ? "Recent check-ins suggest cook nights have felt heavy — consider swapping one for leftovers or takeout."
      : "A few nights run long. If energy dips, swap one cook night for leftovers.";
    return `Moderately ambitious. ${hint}`;
  }
  return `This plan is ambitious for the week's constraints. We'd recommend trimming a cook night or shortening the longer recipes.`;
}
