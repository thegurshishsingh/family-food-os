// Golden test suite for the nutrition normalizer.
// Each case asserts that the per-serving computed macros land within a
// tolerance band. These guard against regressions in the reference table,
// unit conversions, and quantity parsing.

import { assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  computeMacrosFromIngredients,
  normalizeMacros,
  type Ingredient,
  type Macros,
} from "./nutrition.ts";

type Band = Partial<Record<keyof Macros, [number, number]>>;

const within = (actual: Macros, band: Band, label: string) => {
  for (const k of Object.keys(band) as (keyof Macros)[]) {
    const [lo, hi] = band[k]!;
    const v = actual[k];
    assert(
      v >= lo && v <= hi,
      `${label}: ${k}=${v} outside [${lo}, ${hi}] (full=${JSON.stringify(actual)})`,
    );
  }
};

type Case = {
  name: string;
  ingredients: Ingredient[];
  servings?: number;
  expect: Band;
};

const CASES: Case[] = [
  // —— The original bug report ——
  {
    name: "High-protein punjabi choley with chicken (1 serving)",
    ingredients: [
      { name: "canned chickpeas, drained", quantity: "7.5", unit: "oz" },
      { name: "chicken breast", quantity: "5", unit: "oz" },
      { name: "onion", quantity: "1", unit: "medium" },
      { name: "tomato", quantity: "1", unit: "medium" },
      { name: "garam masala", quantity: "1", unit: "tsp" },
      { name: "olive oil", quantity: "1", unit: "tbsp" },
    ],
    expect: {
      protein_g: [50, 75],
      calories: [550, 850],
      fiber_g: [10, 22],
    },
  },
  // —— Plain pieces (count units) ——
  {
    name: "1 chicken breast + rice",
    ingredients: [
      { name: "chicken breast", quantity: "1", unit: "breast" },
      { name: "white rice", quantity: "1", unit: "cup" },
      { name: "broccoli", quantity: "1", unit: "cup" },
    ],
    expect: {
      protein_g: [55, 80],
      calories: [500, 750],
    },
  },
  {
    name: "2 eggs on toast",
    ingredients: [
      { name: "egg", quantity: "2", unit: "" },
      { name: "sourdough bread", quantity: "2", unit: "slice" },
      { name: "butter", quantity: "1", unit: "tsp" },
    ],
    expect: {
      protein_g: [16, 26],
      calories: [320, 480],
    },
  },
  // —— Drained weight inline in name ——
  {
    name: "Tuna salad (drained weight in name)",
    ingredients: [
      { name: "canned tuna (5 oz drained)", quantity: "1", unit: "can" },
      { name: "mayonnaise", quantity: "2", unit: "tbsp" },
      { name: "celery", quantity: "1", unit: "stalk" },
    ],
    expect: {
      protein_g: [30, 45],
      calories: [350, 550],
    },
  },
  // —— Tofu block ——
  {
    name: "Tofu stir fry",
    ingredients: [
      { name: "firm tofu", quantity: "1", unit: "block" },
      { name: "stir fry vegetables", quantity: "2", unit: "cups" },
      { name: "soy sauce", quantity: "2", unit: "tbsp" },
      { name: "sesame oil", quantity: "1", unit: "tbsp" },
    ],
    expect: {
      protein_g: [55, 85],
      calories: [800, 1200],
    },
  },
  // —— Unicode fraction ——
  {
    name: "Salmon with quinoa (½ cup)",
    ingredients: [
      { name: "salmon fillet", quantity: "6", unit: "oz" },
      { name: "quinoa", quantity: "½", unit: "cup" },
      { name: "spinach", quantity: "2", unit: "cups" },
    ],
    expect: {
      protein_g: [40, 60],
      calories: [550, 800],
    },
  },
  // —— Mixed fraction ——
  {
    name: "Pasta with ground beef (1 1/2 cups pasta)",
    ingredients: [
      { name: "ground beef", quantity: "4", unit: "oz" },
      { name: "spaghetti", quantity: "1 1/2", unit: "cups" },
      { name: "marinara sauce", quantity: "1", unit: "cup" },
      { name: "parmesan cheese", quantity: "2", unit: "tbsp" },
    ],
    expect: {
      protein_g: [35, 60],
      calories: [650, 950],
    },
  },
  // —— Range qty ——
  {
    name: "Range quantity '2-3 cloves garlic'",
    ingredients: [
      { name: "chicken thigh", quantity: "6", unit: "oz" },
      { name: "garlic", quantity: "2-3", unit: "cloves" },
      { name: "brown rice", quantity: "1", unit: "cup" },
    ],
    expect: {
      protein_g: [40, 65],
      calories: [550, 850],
    },
  },
  // —— Recipe scaling (4 servings) ——
  {
    name: "Family chili scaled for 4 servings",
    ingredients: [
      { name: "ground beef", quantity: "1", unit: "lb" },
      { name: "canned black beans", quantity: "1", unit: "can" },
      { name: "canned diced tomato", quantity: "1", unit: "can" },
      { name: "onion", quantity: "1", unit: "medium" },
      { name: "chili powder", quantity: "2", unit: "tbsp" },
    ],
    servings: 4,
    expect: {
      protein_g: [25, 45],
      calories: [350, 600],
      fiber_g: [4, 12],
    },
  },
  // —— Vegetarian baseline (no meat) ——
  {
    name: "Lentil soup",
    ingredients: [
      { name: "lentils", quantity: "1", unit: "cup" },
      { name: "carrot", quantity: "2", unit: "medium" },
      { name: "onion", quantity: "1", unit: "medium" },
      { name: "vegetable broth", quantity: "4", unit: "cups" },
    ],
    servings: 4,
    expect: {
      protein_g: [4, 14],
      calories: [80, 220],
      fiber_g: [4, 14],
    },
  },
  // —— Greek yogurt parfait ——
  {
    name: "Greek yogurt parfait",
    ingredients: [
      { name: "greek yogurt", quantity: "1", unit: "cup" },
      { name: "blueberries", quantity: "1/2", unit: "cup" },
      { name: "granola", quantity: "1/4", unit: "cup" },
      { name: "honey", quantity: "1", unit: "tbsp" },
    ],
    expect: {
      protein_g: [16, 32],
      calories: [320, 520],
    },
  },
];

for (const c of CASES) {
  Deno.test(`computeMacros: ${c.name}`, () => {
    const macros = computeMacrosFromIngredients(c.ingredients, c.servings ?? 1);
    within(macros, c.expect, c.name);
  });
}

// —— normalizeMacros: AI low-balls protein on a meat-heavy meal ——
Deno.test("normalizeMacros corrects AI under-reported protein", () => {
  const ingredients: Ingredient[] = [
    { name: "canned chickpeas", quantity: "7.5", unit: "oz" },
    { name: "chicken breast", quantity: "5", unit: "oz" },
    { name: "onion", quantity: "1", unit: "medium" },
    { name: "olive oil", quantity: "1", unit: "tbsp" },
  ];
  const aiBad = { calories: 320, protein_g: 19, carbs_g: 30, fat_g: 8, fiber_g: 6 };
  const out = normalizeMacros(aiBad, ingredients, 1);
  assert(out.protein_g >= 45, `expected protein lift, got ${out.protein_g}`);
  assert(out.calories >= 450, `expected calories lift, got ${out.calories}`);
});

// —— normalizeMacros: AI within tolerance is preserved ——
Deno.test("normalizeMacros keeps AI values when within tolerance", () => {
  const ingredients: Ingredient[] = [
    { name: "chicken breast", quantity: "5", unit: "oz" },
    { name: "white rice", quantity: "1", unit: "cup" },
    { name: "broccoli", quantity: "1", unit: "cup" },
  ];
  const aiOk = { calories: 560, protein_g: 50, carbs_g: 55, fat_g: 8, fiber_g: 5 };
  const out = normalizeMacros(aiOk, ingredients, 1);
  assert(out.protein_g === 50, `expected AI protein preserved, got ${out.protein_g}`);
  assert(out.calories === 560, `expected AI calories preserved, got ${out.calories}`);
});

// —— normalizeMacros: too few known ingredients → trust AI ——
Deno.test("normalizeMacros falls back to AI when ingredients are unrecognized", () => {
  const ingredients: Ingredient[] = [
    { name: "mystery proprietary blend", quantity: "1", unit: "cup" },
  ];
  const ai = { calories: 400, protein_g: 30, carbs_g: 40, fat_g: 10, fiber_g: 4 };
  const out = normalizeMacros(ai, ingredients, 1);
  assert(out.calories === 400 && out.protein_g === 30, "should keep AI values");
});
