// Guardrail tests: nutrition values must never exceed realistic per-serving
// limits — across cooked swaps, leftovers, and takeout — even when the AI
// hallucinates absurd ingredient quantities or macro totals.
//
// These complement nutrition_test.ts (which checks accuracy bands). Here we
// only assert UPPER BOUNDS so a single regression in `normalizeMacros` /
// `computeMacrosFromIngredients` clamping immediately fails CI.

import { assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  computeMacrosFromIngredients,
  normalizeMacros,
  type Ingredient,
  type Macros,
} from "./nutrition.ts";

// Hard per-serving ceilings — must match clamp() in nutrition.ts.
const MAX: Macros = {
  calories: 2500,
  protein_g: 250,
  carbs_g: 350,
  fat_g: 200,
  fiber_g: 80,
};

const assertWithinLimits = (m: Macros, label: string) => {
  for (const k of Object.keys(MAX) as (keyof Macros)[]) {
    assert(
      m[k] <= MAX[k],
      `${label}: ${k}=${m[k]} exceeds per-serving cap ${MAX[k]}`,
    );
    assert(m[k] >= 0, `${label}: ${k}=${m[k]} is negative`);
    assert(Number.isFinite(m[k]), `${label}: ${k}=${m[k]} not finite`);
  }
};

type Fixture = {
  name: string;
  scenario: "cook" | "leftovers" | "takeout" | "swap";
  ingredients: Ingredient[];
  ai?: Partial<Macros>;
  servings?: number;
};

// —— Cooked meals (swaps regenerate the same shape) ——
const COOKED: Fixture[] = [
  {
    name: "Reasonable family pasta",
    scenario: "cook",
    ingredients: [
      { name: "ground beef", quantity: "1", unit: "lb" },
      { name: "spaghetti", quantity: "1", unit: "lb" },
      { name: "marinara sauce", quantity: "2", unit: "cups" },
      { name: "parmesan cheese", quantity: "1/2", unit: "cup" },
      { name: "olive oil", quantity: "2", unit: "tbsp" },
    ],
    servings: 4,
    ai: { calories: 650, protein_g: 38, carbs_g: 75, fat_g: 22, fiber_g: 5 },
  },
  {
    name: "AI hallucinates massive cheese qty (the original bug)",
    scenario: "cook",
    ingredients: [
      { name: "mozzarella cheese", quantity: "255850", unit: "g" },
      { name: "tomato sauce", quantity: "1", unit: "cup" },
      { name: "pasta", quantity: "1", unit: "lb" },
    ],
    servings: 4,
    ai: { calories: 486665, protein_g: 30000, carbs_g: 4000, fat_g: 50000, fiber_g: 200 },
  },
  {
    name: "AI returns Infinity / NaN macros",
    scenario: "swap",
    ingredients: [
      { name: "chicken breast", quantity: "5", unit: "oz" },
      { name: "rice", quantity: "1", unit: "cup" },
      { name: "broccoli", quantity: "1", unit: "cup" },
    ],
    ai: { calories: Infinity, protein_g: NaN, carbs_g: -50, fat_g: 1e9, fiber_g: Infinity },
  },
  {
    name: "Swap produces meat-heavy plate but realistic",
    scenario: "swap",
    ingredients: [
      { name: "ribeye steak", quantity: "8", unit: "oz" },
      { name: "potato", quantity: "1", unit: "large" },
      { name: "asparagus", quantity: "1", unit: "cup" },
      { name: "butter", quantity: "1", unit: "tbsp" },
    ],
    ai: { calories: 780, protein_g: 65, carbs_g: 45, fat_g: 35, fiber_g: 6 },
  },
  {
    name: "Swap with hallucinated 50 lb of bacon",
    scenario: "swap",
    ingredients: [
      { name: "bacon", quantity: "50", unit: "lb" },
      { name: "egg", quantity: "2", unit: "" },
      { name: "toast", quantity: "2", unit: "slice" },
    ],
    ai: { calories: 100000, protein_g: 8000, carbs_g: 200, fat_g: 9000, fiber_g: 0 },
  },
];

// —— Leftovers (typically inherit macros from prior cook day) ——
const LEFTOVERS: Fixture[] = [
  {
    name: "Leftover chili — single serving",
    scenario: "leftovers",
    ingredients: [
      { name: "ground beef", quantity: "4", unit: "oz" },
      { name: "black beans", quantity: "1/2", unit: "cup" },
      { name: "diced tomato", quantity: "1/2", unit: "cup" },
      { name: "onion", quantity: "1/4", unit: "medium" },
    ],
    ai: { calories: 480, protein_g: 38, carbs_g: 35, fat_g: 18, fiber_g: 9 },
  },
  {
    name: "Leftovers with corrupted AI macros (negatives + huge)",
    scenario: "leftovers",
    ingredients: [
      { name: "rotisserie chicken", quantity: "5", unit: "oz" },
      { name: "rice", quantity: "1", unit: "cup" },
    ],
    ai: { calories: -200, protein_g: 999, carbs_g: 5000, fat_g: -10, fiber_g: 999 },
  },
];

// —— Takeout & dine-out (often only AI macros, no usable ingredient list) ——
const TAKEOUT: Fixture[] = [
  {
    name: "Pizza takeout — 2 slices",
    scenario: "takeout",
    ingredients: [], // takeout often has no ingredients array
    ai: { calories: 720, protein_g: 32, carbs_g: 80, fat_g: 28, fiber_g: 4 },
  },
  {
    name: "Takeout AI hallucinates per-pie (whole pizza) macros",
    scenario: "takeout",
    ingredients: [],
    ai: { calories: 4800, protein_g: 180, carbs_g: 600, fat_g: 220, fiber_g: 30 },
  },
  {
    name: "Sushi platter takeout — null ingredients",
    scenario: "takeout",
    ingredients: null as unknown as Ingredient[],
    ai: { calories: 850, protein_g: 45, carbs_g: 110, fat_g: 18, fiber_g: 5 },
  },
  {
    name: "Takeout with garbage AI payload",
    scenario: "takeout",
    ingredients: [],
    ai: { calories: 1e12, protein_g: 1e9, carbs_g: 1e9, fat_g: 1e9, fiber_g: 1e9 },
  },
  {
    name: "Burger combo dine-out — realistic",
    scenario: "takeout",
    ingredients: [],
    ai: { calories: 1100, protein_g: 50, carbs_g: 95, fat_g: 55, fiber_g: 6 },
  },
];

const ALL = [...COOKED, ...LEFTOVERS, ...TAKEOUT];

for (const f of ALL) {
  Deno.test(`per-serving caps [${f.scenario}]: ${f.name}`, () => {
    const out = normalizeMacros(f.ai ?? null, f.ingredients, f.servings ?? 1);
    assertWithinLimits(out, f.name);
  });
}

// Direct compute path must also clamp per-ingredient grams (the 2 kg guard).
Deno.test("computeMacrosFromIngredients clamps single absurd ingredient", () => {
  const out = computeMacrosFromIngredients(
    [{ name: "olive oil", quantity: "999999", unit: "g" }],
    1,
  );
  // 2000 g of oil ≈ 17,680 kcal raw — clamp() in normalizeMacros caps it.
  // Here we only check the per-ingredient gram clamp prevented overflow.
  assert(Number.isFinite(out.calories), "calories must be finite");
  assert(out.calories <= 20000, `unbounded calories: ${out.calories}`);
});

// When normalizeMacros sees a hallucinated ingredient list, the final
// per-serving clamp must still hold.
Deno.test("normalizeMacros final clamp holds for absurd ingredient list", () => {
  const out = normalizeMacros(
    { calories: 999999, protein_g: 999999, carbs_g: 999999, fat_g: 999999, fiber_g: 999999 },
    [
      { name: "butter", quantity: "10", unit: "lb" },
      { name: "sugar", quantity: "10", unit: "lb" },
      { name: "cheese", quantity: "10", unit: "lb" },
    ],
    1,
  );
  assertWithinLimits(out, "absurd ingredients + absurd AI");
});

// Empty / missing inputs should produce zeros (or AI-clamped), never NaN.
Deno.test("normalizeMacros handles null AI + empty ingredients", () => {
  const out = normalizeMacros(null, [], 1);
  assertWithinLimits(out, "null + empty");
  assert(out.calories === 0, `expected 0 calories, got ${out.calories}`);
});

Deno.test("normalizeMacros handles undefined AI + null ingredients", () => {
  const out = normalizeMacros(undefined, null, 1);
  assertWithinLimits(out, "undefined + null");
});
