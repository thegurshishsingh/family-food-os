/**
 * Time-saved calculation engine.
 *
 * Strategy: rule-based baselines (what an unplanned week typically costs)
 * scaled by a per-week CONFIDENCE FACTOR so we don't over-claim early on.
 *
 * Confidence is built from real signals tied to that specific week:
 *   - Did the plan have most nights filled in?
 *   - Was there a synced grocery list?
 *   - Did the family check in / cook through what was planned?
 *
 * Early weeks (no check-ins, partial plan) get conservative credit.
 * Mature weeks (full plan, grocery list, multiple check-ins) approach
 * the full theoretical savings.
 */

import type { PlanDay } from "@/components/planner/types";

export type TimeSavingsBreakdown = {
  category: string;
  withoutApp: number; // minutes
  withApp: number;    // minutes
};

export type SavingsFactor = {
  label: string;
  minutesSaved: number;
};

export type TimeSavedResult = {
  totalMinutesSaved: number;
  breakdown: TimeSavingsBreakdown[];
  factors: SavingsFactor[];
  /** 0..1 — how strongly the underlying signals back this number. */
  confidence: number;
};

// Baseline estimates (minutes without the app, per week)
const BASELINE = {
  decidingWhatToCook: 45,      // ~6 min/day deciding
  buildingGroceryList: 30,     // manual list building
  shoppingComparing: 25,       // extra time browsing without a plan
  coordinatingFamily: 20,      // texting, discussing
  checkingPantryWaste: 20,     // checking what's there, avoiding waste
  replanningChanges: 25,       // scrambling when plans fall apart
};

/**
 * Compute a 0..1 confidence factor for a single week based on real signals.
 * Each component caps at its weight so we never exceed 1.0.
 *
 *  - Plan completeness     up to 0.40   (planned nights / 7)
 *  - Grocery list synced   0.20 flat
 *  - Check-in coverage     up to 0.30   (checkins / planned cook nights)
 *  - History bonus         up to 0.10   (caps at 4+ weeks)
 */
function computeConfidence(opts: {
  plannedNights: number;
  cookNights: number;
  /** Real engagement: user checked items off the list, or grocery list
   *  was updated via swaps. Mere existence of an auto-generated list
   *  doesn't count — we want proof the family actually used it. */
  groceryListUsed: boolean;
  checkinCount: number;
  totalPlansCompleted: number;
}): number {
  const planComponent = Math.min(opts.plannedNights / 7, 1) * 0.4;
  const groceryComponent = opts.groceryListUsed ? 0.2 : 0;
  const checkinDenom = Math.max(1, opts.cookNights);
  // Cap check-ins at planned cook nights to prevent overcounting
  // (e.g. multiple check-ins on the same plan_day, or check-ins on
  // already-deleted plan_days from earlier swaps).
  const cappedCheckins = Math.min(opts.checkinCount, opts.cookNights);
  const checkinComponent = Math.min(cappedCheckins / checkinDenom, 1) * 0.3;
  const historyComponent = Math.min(opts.totalPlansCompleted / 4, 1) * 0.1;
  const raw = planComponent + groceryComponent + checkinComponent + historyComponent;
  // Floor at 0.35 so a barely-touched week still gets a small honest credit;
  // ceiling at 1.0.
  return Math.max(0.35, Math.min(1, raw));
}

/**
 * Compute time saved from a single week's plan data.
 */
export function computeTimeSaved(
  days: PlanDay[],
  opts: {
    /** True only when the family actually engaged with the grocery list
     *  (checked items off, or list was modified by a meal swap). The
     *  mere existence of an auto-generated list is not a signal. */
    groceryListUsed: boolean;
    checkinCount: number;
    totalPlansCompleted: number;
  }
): TimeSavedResult {
  if (!days.length) {
    return { totalMinutesSaved: 0, breakdown: [], factors: [], confidence: 0 };
  }

  const cookNights = days.filter(d => d.meal_mode === "cook").length;
  const leftoverNights = days.filter(d => d.meal_mode === "leftovers").length;
  const takeoutNights = days.filter(d => ["takeout", "dine_out"].includes(d.meal_mode)).length;
  const plannedNights = days.filter(d => d.meal_name).length;

  // Detect shared ingredients (simple heuristic: same cuisine type on different days)
  const cuisines = days.map(d => d.cuisine_type).filter(Boolean);
  const cuisineCounts: Record<string, number> = {};
  cuisines.forEach(c => { cuisineCounts[c!] = (cuisineCounts[c!] || 0) + 1; });
  const sharedIngredientGroups = Object.values(cuisineCounts).filter(c => c > 1).length;

  const confidence = computeConfidence({
    plannedNights,
    cookNights,
    groceryListUsed: opts.groceryListUsed,
    checkinCount: opts.checkinCount,
    totalPlansCompleted: opts.totalPlansCompleted,
  });

  // ── Raw (theoretical) savings per category ──
  const rawDecision = BASELINE.decidingWhatToCook * (plannedNights / 7) * 0.85;
  const rawGrocery = opts.groceryListUsed ? BASELINE.buildingGroceryList * 0.9 : 0;
  const rawShopping = opts.groceryListUsed
    ? BASELINE.shoppingComparing * (0.4 + sharedIngredientGroups * 0.15)
    : BASELINE.shoppingComparing * 0.2;
  const rawCoord = BASELINE.coordinatingFamily * (plannedNights / 7) * 0.7;
  const rawPantry = opts.groceryListUsed ? BASELINE.checkingPantryWaste * 0.6 : BASELINE.checkingPantryWaste * 0.2;

  let rawReplan = BASELINE.replanningChanges * 0.3;
  if (leftoverNights > 0) rawReplan += Math.min(leftoverNights * 5, 15);
  if (takeoutNights > 0) rawReplan += Math.min(takeoutNights * 4, 12);

  // ── Apply confidence scaling ──
  const scale = (n: number) => Math.round(n * confidence);
  const decisionSaved = scale(rawDecision);
  const grocerySaved = scale(rawGrocery);
  const shoppingSaved = scale(rawShopping);
  const coordSaved = scale(rawCoord);
  const pantrySaved = scale(rawPantry);
  const replanSaved = scale(rawReplan);

  // Cap check-in count at planned cook nights for honest labels.
  const cappedCheckins = Math.min(opts.checkinCount, Math.max(cookNights, 1));

  // ── User-facing factors (already-scaled, with signal sources) ──
  const factors: SavingsFactor[] = [];

  if (plannedNights >= 5) {
    factors.push({ label: `${plannedNights} pre-planned dinners eliminated daily decision fatigue`, minutesSaved: decisionSaved });
  } else if (plannedNights > 0) {
    factors.push({ label: `${plannedNights} planned dinners reduced decision time`, minutesSaved: decisionSaved });
  }

  if (opts.groceryListUsed) {
    factors.push({ label: `Grocery list was actively used while shopping for ${cookNights} planned dinners`, minutesSaved: grocerySaved });
  }

  if (sharedIngredientGroups > 0) {
    factors.push({
      label: `Repeated ingredients across ${sharedIngredientGroups} cuisine group${sharedIngredientGroups > 1 ? "s" : ""} simplified shopping`,
      minutesSaved: Math.round(sharedIngredientGroups * 4 * confidence),
    });
  }

  if (leftoverNights > 0) {
    factors.push({
      label: `${leftoverNights} leftover night${leftoverNights > 1 ? "s" : ""} reduced extra cooking and planning`,
      minutesSaved: Math.round(Math.min(leftoverNights * 5, 15) * confidence),
    });
  }
  if (takeoutNights > 0) {
    factors.push({
      label: `${takeoutNights} pre-planned takeout night${takeoutNights > 1 ? "s" : ""} prevented last-minute scrambling`,
      minutesSaved: Math.round(Math.min(takeoutNights * 4, 12) * confidence),
    });
  }

  if (cappedCheckins > 0) {
    const checkinBonus = Math.round(Math.min(cappedCheckins * 2, 10) * confidence);
    factors.push({ label: `${cappedCheckins} Dinner Check-In${cappedCheckins > 1 ? "s" : ""} helped the system learn faster`, minutesSaved: checkinBonus });
  }

  // Build breakdown for chart (uses scaled values)
  const breakdown: TimeSavingsBreakdown[] = [
    { category: "Deciding what to cook", withoutApp: BASELINE.decidingWhatToCook, withApp: BASELINE.decidingWhatToCook - decisionSaved },
    { category: "Building grocery list", withoutApp: BASELINE.buildingGroceryList, withApp: BASELINE.buildingGroceryList - grocerySaved },
    { category: "Shopping & comparing", withoutApp: BASELINE.shoppingComparing, withApp: BASELINE.shoppingComparing - shoppingSaved },
    { category: "Coordinating with family", withoutApp: BASELINE.coordinatingFamily, withApp: BASELINE.coordinatingFamily - coordSaved },
    { category: "Checking pantry / waste", withoutApp: BASELINE.checkingPantryWaste, withApp: BASELINE.checkingPantryWaste - pantrySaved },
    { category: "Replanning after changes", withoutApp: BASELINE.replanningChanges, withApp: BASELINE.replanningChanges - replanSaved },
  ];

  const totalMinutesSaved = breakdown.reduce((sum, b) => sum + (b.withoutApp - b.withApp), 0);

  return { totalMinutesSaved, breakdown, factors, confidence };
}

/** Format minutes as hours string, e.g. "2.6 hours" */
export function formatHours(minutes: number): string {
  const hrs = minutes / 60;
  if (hrs < 1) return `${minutes} min`;
  return `${hrs.toFixed(1)} hours`;
}

// ─────────────────────────────────────────────────────────────
// Cumulative helper — sums per-week actuals across all plans.
// ─────────────────────────────────────────────────────────────

export type WeekInputs = {
  planId: string;
  days: PlanDay[];
  /** True only when the family engaged with this week's grocery list
   *  (items checked off, or list updated via a swap). */
  groceryListUsed: boolean;
  checkinCount: number;
};

/**
 * Compute total minutes saved across many weeks by running the engine
 * on each week individually and summing the results. This is more
 * accurate than `thisWeek × totalWeeks` because savings vary by how
 * complete each week's plan + execution was.
 */
export function computeCumulativeMinutesSaved(weeks: WeekInputs[]): number {
  if (!weeks.length) return 0;
  let total = 0;
  for (let i = 0; i < weeks.length; i++) {
    const w = weeks[i];
    const r = computeTimeSaved(w.days, {
      groceryListUsed: w.groceryListUsed,
      checkinCount: w.checkinCount,
      totalPlansCompleted: i + 1, // history grows week by week
    });
    total += r.totalMinutesSaved;
  }
  return total;
}

