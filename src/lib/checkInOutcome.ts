// ============================================================
// Check-in outcome derivation
// ============================================================
// Converts the user's selected tags + effort level into a single
// canonical `outcome` category that the learning model can use to
// compute strong day-by-day execution signals.
//
// Allowed outcomes (kept in sync with the DB CHECK constraint on
// public.evening_checkins.outcome):
//   cooked_loved | cooked_fine | too_hard | kids_refused
//   ordered_out  | leftovers   | not_again | skipped | neutral
// ============================================================

export type CheckInOutcome =
  | "cooked_loved"
  | "cooked_fine"
  | "too_hard"
  | "kids_refused"
  | "ordered_out"
  | "leftovers"
  | "not_again"
  | "skipped"
  | "neutral";

/**
 * Derive a single canonical outcome from selected tags + effort level.
 * Priority order is ordered from "strongest negative signal" to
 * "strongest positive signal" so the most actionable signal wins.
 */
export function deriveCheckInOutcome(
  tags: string[],
  effort: string | null | undefined,
): CheckInOutcome {
  const t = new Set(tags);

  // Strongest negative signals first — we want the AI to react to these.
  if (t.has("not_again")) return "not_again";
  if (t.has("kids_refused")) return "kids_refused";
  if (t.has("too_much_work") || effort === "too_much") return "too_hard";

  // Mode-driven signals
  if (t.has("ordered_out")) return "ordered_out";
  if (t.has("great_leftovers")) return "leftovers";

  // Positive cooked outcomes
  if (t.has("cooked_it") && t.has("everyone_liked")) return "cooked_loved";
  if (t.has("everyone_liked")) return "cooked_loved";
  if (t.has("cooked_it") || t.has("easy_win")) return "cooked_fine";

  // Effort-only signals
  if (effort === "easy" || effort === "fine") return "cooked_fine";

  return "neutral";
}
