// Shared nutrition normalizer for edge functions.
// AI ingredients are specified PER SINGLE SERVING. This module re-computes
// macros from the ingredient list using a curated per-100g reference table
// and unit→grams conversions, then reconciles them with the AI's reported
// macros (overriding when the AI value is implausibly low/high).

export type Ingredient = {
  name?: string;
  quantity?: string | number | null;
  unit?: string | null;
};

export type Macros = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

// Per 100 g (cooked unless noted). Conservative, rounded values.
type Ref = { cal: number; p: number; c: number; f: number; fib: number };
const REF: Array<{ match: RegExp; ref: Ref }> = [
  // Proteins
  { match: /chicken\s*(breast|tender)/i, ref: { cal: 165, p: 31, c: 0, f: 3.6, fib: 0 } },
  { match: /chicken\s*thigh/i, ref: { cal: 209, p: 26, c: 0, f: 11, fib: 0 } },
  { match: /chicken/i, ref: { cal: 190, p: 28, c: 0, f: 8, fib: 0 } },
  { match: /turkey\s*(ground|mince)/i, ref: { cal: 200, p: 27, c: 0, f: 10, fib: 0 } },
  { match: /turkey/i, ref: { cal: 170, p: 29, c: 0, f: 5, fib: 0 } },
  { match: /(ground\s*beef|beef\s*mince|minced\s*beef)/i, ref: { cal: 250, p: 26, c: 0, f: 17, fib: 0 } },
  { match: /(steak|beef)/i, ref: { cal: 220, p: 27, c: 0, f: 12, fib: 0 } },
  { match: /(pork\s*chop|pork\s*loin|pork)/i, ref: { cal: 220, p: 27, c: 0, f: 12, fib: 0 } },
  { match: /(salmon)/i, ref: { cal: 208, p: 22, c: 0, f: 13, fib: 0 } },
  { match: /(tuna)/i, ref: { cal: 130, p: 28, c: 0, f: 1, fib: 0 } },
  { match: /(shrimp|prawn)/i, ref: { cal: 100, p: 20, c: 1, f: 1.5, fib: 0 } },
  { match: /(cod|tilapia|white\s*fish|haddock)/i, ref: { cal: 100, p: 22, c: 0, f: 1, fib: 0 } },
  { match: /(tofu)/i, ref: { cal: 144, p: 17, c: 3, f: 9, fib: 2 } },
  { match: /(tempeh)/i, ref: { cal: 195, p: 20, c: 8, f: 11, fib: 0 } },
  { match: /(egg)/i, ref: { cal: 155, p: 13, c: 1, f: 11, fib: 0 } },
  // Legumes
  { match: /(chickpea|garbanzo)/i, ref: { cal: 120, p: 7, c: 20, f: 2, fib: 7 } },
  { match: /(black\s*bean|kidney\s*bean|pinto\s*bean|cannellini|navy\s*bean|bean)/i, ref: { cal: 130, p: 8, c: 23, f: 0.5, fib: 7 } },
  { match: /(lentil)/i, ref: { cal: 116, p: 9, c: 20, f: 0.4, fib: 8 } },
  // Grains/starches
  { match: /(brown\s*rice)/i, ref: { cal: 123, p: 2.7, c: 26, f: 1, fib: 1.8 } },
  { match: /(rice)/i, ref: { cal: 130, p: 2.7, c: 28, f: 0.3, fib: 0.4 } },
  { match: /(quinoa)/i, ref: { cal: 120, p: 4.4, c: 21, f: 1.9, fib: 2.8 } },
  { match: /(pasta|spaghetti|penne|noodle)/i, ref: { cal: 158, p: 6, c: 31, f: 1, fib: 1.8 } },
  { match: /(couscous|bulgur)/i, ref: { cal: 112, p: 3.8, c: 23, f: 0.2, fib: 1.4 } },
  { match: /(potato)/i, ref: { cal: 87, p: 2, c: 20, f: 0.1, fib: 1.8 } },
  { match: /(sweet\s*potato)/i, ref: { cal: 86, p: 1.6, c: 20, f: 0.1, fib: 3 } },
  { match: /(bread|tortilla|pita|naan|bun|roll)/i, ref: { cal: 270, p: 9, c: 50, f: 3, fib: 3 } },
  // Dairy
  { match: /(cheddar|parmesan|mozzarella|feta|cheese)/i, ref: { cal: 380, p: 24, c: 2, f: 30, fib: 0 } },
  { match: /(greek\s*yogurt)/i, ref: { cal: 97, p: 9, c: 4, f: 5, fib: 0 } },
  { match: /(yogurt)/i, ref: { cal: 60, p: 4, c: 7, f: 1.5, fib: 0 } },
  { match: /(milk)/i, ref: { cal: 60, p: 3.4, c: 5, f: 3.3, fib: 0 } },
  { match: /(butter)/i, ref: { cal: 717, p: 0.9, c: 0.1, f: 81, fib: 0 } },
  { match: /(cream)/i, ref: { cal: 340, p: 2, c: 3, f: 36, fib: 0 } },
  // Fats
  { match: /(olive\s*oil|vegetable\s*oil|canola|sesame\s*oil|oil)/i, ref: { cal: 884, p: 0, c: 0, f: 100, fib: 0 } },
  { match: /(avocado)/i, ref: { cal: 160, p: 2, c: 9, f: 15, fib: 7 } },
  { match: /(nut|almond|cashew|peanut|walnut)/i, ref: { cal: 580, p: 21, c: 20, f: 50, fib: 8 } },
  // Veg (fallback)
  { match: /(spinach|kale|lettuce|arugula|greens)/i, ref: { cal: 23, p: 2.9, c: 3.6, f: 0.4, fib: 2.2 } },
  { match: /(broccoli|cauliflower|brussels)/i, ref: { cal: 35, p: 2.5, c: 7, f: 0.4, fib: 3 } },
  { match: /(tomato|salsa)/i, ref: { cal: 22, p: 1, c: 5, f: 0.2, fib: 1.5 } },
  { match: /(onion|carrot|pepper|cucumber|zucchini|eggplant|mushroom|squash|cabbage|veg)/i, ref: { cal: 30, p: 1.2, c: 6, f: 0.2, fib: 1.8 } },
  // Sweeteners / sauces
  { match: /(honey|syrup|sugar)/i, ref: { cal: 304, p: 0.3, c: 82, f: 0, fib: 0 } },
  { match: /(soy\s*sauce|fish\s*sauce|hot\s*sauce|vinegar)/i, ref: { cal: 20, p: 1.5, c: 3, f: 0, fib: 0 } },
];

const lookup = (name: string): Ref | null => {
  const n = (name || "").toLowerCase().trim();
  if (!n) return null;
  for (const { match, ref } of REF) if (match.test(n)) return ref;
  return null;
};

// Convert (qty, unit, name) → grams. Returns 0 when we cannot estimate.
const toGrams = (qty: number, unit: string, name: string): number => {
  const u = (unit || "").toLowerCase().trim();
  const n = (name || "").toLowerCase();

  // Direct mass
  if (/^(g|gram|grams)$/.test(u)) return qty;
  if (/^(kg|kilogram|kilograms)$/.test(u)) return qty * 1000;
  if (/^(oz|ounce|ounces)$/.test(u)) return qty * 28.35;
  if (/^(lb|lbs|pound|pounds)$/.test(u)) return qty * 453.6;

  // Volume → grams (rough, water-density default; oils slightly lighter)
  if (/^(ml|milliliter|milliliters)$/.test(u)) return qty;
  if (/^(l|liter|liters)$/.test(u)) return qty * 1000;
  if (/^(cup|cups)$/.test(u)) return qty * 240;
  if (/^(tbsp|tablespoon|tablespoons)$/.test(u)) return qty * 14;
  if (/^(tsp|teaspoon|teaspoons)$/.test(u)) return qty * 5;
  if (/^(pinch|dash)$/.test(u)) return qty * 0.5;

  // Count units — depend on the ingredient
  if (/^(piece|pieces|whole|fillet|fillets|slice|slices|breast|breasts|thigh|thighs|leg|legs|patty|patties|chop|chops|fillet)$/.test(u)) {
    if (/chicken\s*breast/.test(n)) return qty * 170;
    if (/chicken\s*thigh/.test(n)) return qty * 110;
    if (/(salmon|cod|tilapia|fish)/.test(n)) return qty * 150;
    if (/(steak|chop|patty)/.test(n)) return qty * 170;
    if (/(egg)/.test(n)) return qty * 50;
    if (/(slice|bread|toast)/.test(n) || /(bread|toast)/.test(u)) return qty * 30;
    if (/(tortilla|pita|wrap|naan)/.test(n)) return qty * 50;
    if (/(onion|tomato|pepper|potato|avocado|lemon|lime|orange|apple)/.test(n)) return qty * 130;
    if (/(garlic|clove)/.test(n)) return qty * 5;
    return qty * 100; // generic
  }
  if (/^(clove|cloves)$/.test(u)) return qty * 5;
  if (/^(can|cans)$/.test(u)) return qty * 240; // ~1 cup drained
  if (/^(stick|sticks)$/.test(u)) {
    if (/butter/.test(n)) return qty * 113;
    return qty * 50;
  }
  if (/^(small)$/.test(u)) return qty * 80;
  if (/^(medium|med)$/.test(u)) return qty * 130;
  if (/^(large)$/.test(u)) return qty * 180;
  if (!u) {
    // Assume "piece" semantics for bare numbers
    if (/(egg)/.test(n)) return qty * 50;
    return qty * 100;
  }
  return 0;
};

const parseQty = (q: unknown): number => {
  if (typeof q === "number" && isFinite(q)) return q;
  if (typeof q !== "string") return 0;
  const s = q.trim();
  if (!s) return 0;
  // Handle fractions like "1/2", "1 1/2"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
};

export const computeMacrosFromIngredients = (
  ingredients: Ingredient[] | null | undefined,
  servings = 1,
): Macros => {
  const total: Macros = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
  if (!Array.isArray(ingredients) || ingredients.length === 0 || servings <= 0) return total;

  for (const ing of ingredients) {
    const name = (ing?.name || "").toString();
    const ref = lookup(name);
    if (!ref) continue;
    const qty = parseQty(ing?.quantity);
    const grams = toGrams(qty, (ing?.unit || "").toString(), name);
    if (grams <= 0) continue;
    const factor = grams / 100;
    total.calories += ref.cal * factor;
    total.protein_g += ref.p * factor;
    total.carbs_g += ref.c * factor;
    total.fat_g += ref.f * factor;
    total.fiber_g += ref.fib * factor;
  }

  return {
    calories: Math.round(total.calories / servings),
    protein_g: Math.round((total.protein_g / servings) * 10) / 10,
    carbs_g: Math.round((total.carbs_g / servings) * 10) / 10,
    fat_g: Math.round((total.fat_g / servings) * 10) / 10,
    fiber_g: Math.round((total.fiber_g / servings) * 10) / 10,
  };
};

/**
 * Reconcile AI-reported macros against a per-ingredient computation.
 * - If AI macros look reasonable (within tolerance), keep them.
 * - If AI macros are clearly wrong (>35% off on protein OR calories,
 *   when our computed value has at least 3 known ingredients), use our values.
 * Always treats the result as PER-SERVING. If `recipeServings > 1`, the
 * ingredient-derived totals are divided down to per-serving.
 */
export const normalizeMacros = (
  ai: Partial<Macros> | null | undefined,
  ingredients: Ingredient[] | null | undefined,
  recipeServings = 1,
): Macros => {
  const computed = computeMacrosFromIngredients(ingredients, recipeServings);
  const aiSafe: Macros = {
    calories: Number(ai?.calories) || 0,
    protein_g: Number(ai?.protein_g) || 0,
    carbs_g: Number(ai?.carbs_g) || 0,
    fat_g: Number(ai?.fat_g) || 0,
    fiber_g: Number(ai?.fiber_g) || 0,
  };

  const knownCount = (Array.isArray(ingredients) ? ingredients : []).filter(
    (i) => lookup((i?.name || "").toString()),
  ).length;

  // Not enough signal — keep AI values.
  if (knownCount < 3 || computed.calories === 0) return aiSafe;

  const proteinDiff = Math.abs(aiSafe.protein_g - computed.protein_g) / Math.max(computed.protein_g, 1);
  const calorieDiff = Math.abs(aiSafe.calories - computed.calories) / Math.max(computed.calories, 1);

  // AI is within 35% on both → trust AI (it may know recipe-specific cooking losses).
  if (proteinDiff <= 0.35 && calorieDiff <= 0.35) return aiSafe;

  // Otherwise correct toward the computed values, preferring the higher of the two
  // for protein (AI tends to under-report, never over-report meat-heavy meals).
  return {
    calories: Math.round((aiSafe.calories + computed.calories) / 2) || computed.calories,
    protein_g: Math.max(aiSafe.protein_g, computed.protein_g),
    carbs_g: Math.round(((aiSafe.carbs_g + computed.carbs_g) / 2) * 10) / 10 || computed.carbs_g,
    fat_g: Math.round(((aiSafe.fat_g + computed.fat_g) / 2) * 10) / 10 || computed.fat_g,
    fiber_g: Math.max(aiSafe.fiber_g, computed.fiber_g),
  };
};
