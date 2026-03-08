/**
 * Time-saved calculation engine.
 * Estimates minutes saved per week based on actual plan structure and user behavior.
 * All estimates are rule-based and tied to concrete actions.
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
 * Compute time saved from a single week's plan data.
 */
export function computeTimeSaved(
  days: PlanDay[],
  opts: {
    hasGroceryList: boolean;
    checkinCount: number;
    totalPlansCompleted: number;
  }
): TimeSavedResult {
  if (!days.length) {
    return { totalMinutesSaved: 0, breakdown: [], factors: [] };
  }

  const cookNights = days.filter(d => d.meal_mode === "cook").length;
  const leftoverNights = days.filter(d => d.meal_mode === "leftovers").length;
  const takeoutNights = days.filter(d => ["takeout", "dine_out"].includes(d.meal_mode)).length;
  const emergencyNights = days.filter(d => d.meal_mode === "emergency").length;
  const plannedNights = days.filter(d => d.meal_name).length;

  // Detect shared ingredients (simple heuristic: same cuisine type on different days)
  const cuisines = days.map(d => d.cuisine_type).filter(Boolean);
  const cuisineCounts: Record<string, number> = {};
  cuisines.forEach(c => { cuisineCounts[c!] = (cuisineCounts[c!] || 0) + 1; });
  const sharedIngredientGroups = Object.values(cuisineCounts).filter(c => c > 1).length;

  const factors: SavingsFactor[] = [];

  // 1. Decision time saved (pre-planned meals eliminate daily "what's for dinner")
  const decisionSaved = Math.round(BASELINE.decidingWhatToCook * (plannedNights / 7) * 0.85);
  if (plannedNights >= 5) {
    factors.push({ label: `${plannedNights} pre-planned dinners eliminated daily decision fatigue`, minutesSaved: decisionSaved });
  } else if (plannedNights > 0) {
    factors.push({ label: `${plannedNights} planned dinners reduced decision time`, minutesSaved: decisionSaved });
  }

  // 2. Grocery list
  const grocerySaved = opts.hasGroceryList ? Math.round(BASELINE.buildingGroceryList * 0.9) : 0;
  if (opts.hasGroceryList) {
    factors.push({ label: `Grocery list was built automatically from ${cookNights} planned dinners`, minutesSaved: grocerySaved });
  }

  // 3. Shopping efficiency from shared ingredients
  const shoppingBase = BASELINE.shoppingComparing;
  const shoppingSaved = opts.hasGroceryList
    ? Math.round(shoppingBase * (0.4 + sharedIngredientGroups * 0.15))
    : Math.round(shoppingBase * 0.2);
  if (sharedIngredientGroups > 0) {
    factors.push({ label: `Repeated ingredients across ${sharedIngredientGroups} cuisine group${sharedIngredientGroups > 1 ? "s" : ""} simplified shopping`, minutesSaved: Math.round(sharedIngredientGroups * 4) });
  }

  // 4. Coordination saved
  const coordSaved = Math.round(BASELINE.coordinatingFamily * (plannedNights / 7) * 0.7);

  // 5. Pantry / waste reduction
  const pantrySaved = opts.hasGroceryList ? Math.round(BASELINE.checkingPantryWaste * 0.6) : Math.round(BASELINE.checkingPantryWaste * 0.2);

  // 6. Replanning reduction
  const replanBase = BASELINE.replanningChanges;
  let replanSaved = 0;
  if (leftoverNights > 0) {
    const leftoverSave = Math.min(leftoverNights * 5, 15);
    replanSaved += leftoverSave;
    factors.push({ label: `${leftoverNights} leftover night${leftoverNights > 1 ? "s" : ""} reduced extra cooking and planning`, minutesSaved: leftoverSave });
  }
  if (takeoutNights > 0) {
    const takeoutSave = Math.min(takeoutNights * 4, 12);
    replanSaved += takeoutSave;
    factors.push({ label: `${takeoutNights} pre-planned takeout night${takeoutNights > 1 ? "s" : ""} prevented last-minute scrambling`, minutesSaved: takeoutSave });
  }
  replanSaved += Math.round(replanBase * 0.3);

  // 7. Check-in learning bonus
  if (opts.checkinCount > 0) {
    const checkinBonus = Math.min(opts.checkinCount * 2, 10);
    factors.push({ label: `${opts.checkinCount} Dinner Check-In${opts.checkinCount > 1 ? "s" : ""} helped the system learn faster`, minutesSaved: checkinBonus });
  }

  // Build breakdown for chart
  const breakdown: TimeSavingsBreakdown[] = [
    { category: "Deciding what to cook", withoutApp: BASELINE.decidingWhatToCook, withApp: BASELINE.decidingWhatToCook - decisionSaved },
    { category: "Building grocery list", withoutApp: BASELINE.buildingGroceryList, withApp: BASELINE.buildingGroceryList - grocerySaved },
    { category: "Shopping & comparing", withoutApp: BASELINE.shoppingComparing, withApp: BASELINE.shoppingComparing - shoppingSaved },
    { category: "Coordinating with family", withoutApp: BASELINE.coordinatingFamily, withApp: BASELINE.coordinatingFamily - coordSaved },
    { category: "Checking pantry / waste", withoutApp: BASELINE.checkingPantryWaste, withApp: BASELINE.checkingPantryWaste - pantrySaved },
    { category: "Replanning after changes", withoutApp: BASELINE.replanningChanges, withApp: BASELINE.replanningChanges - replanSaved },
  ];

  const totalMinutesSaved = breakdown.reduce((sum, b) => sum + (b.withoutApp - b.withApp), 0);

  return { totalMinutesSaved, breakdown, factors };
}

/** Format minutes as hours string, e.g. "2.6 hours" */
export function formatHours(minutes: number): string {
  const hrs = minutes / 60;
  if (hrs < 1) return `${minutes} min`;
  return `${hrs.toFixed(1)} hours`;
}
