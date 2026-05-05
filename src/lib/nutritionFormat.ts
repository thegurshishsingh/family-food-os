/**
 * Consistent formatting helpers for nutrition values shown in the UI.
 *
 * Rules:
 * - All macro/calorie values are rounded to the nearest whole number.
 * - Null / undefined / NaN / non-finite values return null so callers can
 *   conditionally hide the badge instead of showing "0g" or "NaNg".
 * - Calories use a localized thousands separator (e.g. "1,234 cal").
 * - Macros (protein/carbs/fat/fiber) use the pattern "{n}g".
 */

type Num = number | string | null | undefined;

const toNumber = (value: Num): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
};

/** Round to nearest integer, or null if not a finite number. */
export const roundNutrition = (value: Num): number | null => {
  const n = toNumber(value);
  return n === null ? null : Math.round(n);
};

/** "1,234 cal" — returns null if value is missing or zero. */
export const formatCalories = (value: Num): string | null => {
  const n = roundNutrition(value);
  if (n === null || n <= 0) return null;
  return `${n.toLocaleString()} cal`;
};

/** "32g" — returns null if value is missing or zero. */
export const formatGrams = (value: Num): string | null => {
  const n = roundNutrition(value);
  if (n === null || n <= 0) return null;
  return `${n}g`;
};

/** "32g protein" — returns null if value is missing or zero. */
export const formatMacro = (
  value: Num,
  label: "protein" | "carbs" | "fat" | "fiber",
): string | null => {
  const grams = formatGrams(value);
  return grams ? `${grams} ${label}` : null;
};
