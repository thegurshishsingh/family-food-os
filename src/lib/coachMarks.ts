// Tracks which onboarding gestures the user has performed so we can
// auto-dismiss the planner SwipeCoachMark once they've tried them.
export const COACH_MARK_KEY = "dinnerwise_swipe_coach_seen_v2";
export const COACH_GESTURE_HOLD_KEY = "dinnerwise_coach_gesture_hold";
export const COACH_GESTURE_REORDER_KEY = "dinnerwise_coach_gesture_reorder";

export const COACH_GESTURE_EVENT = "dinnerwise:coach-gesture";

export type CoachGesture = "hold" | "reorder";

export function recordCoachGesture(gesture: CoachGesture) {
  const key = gesture === "hold" ? COACH_GESTURE_HOLD_KEY : COACH_GESTURE_REORDER_KEY;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "true");
  window.dispatchEvent(new CustomEvent(COACH_GESTURE_EVENT, { detail: { gesture } }));
}

export function hasCompletedAllCoachGestures() {
  return (
    !!localStorage.getItem(COACH_GESTURE_HOLD_KEY) &&
    !!localStorage.getItem(COACH_GESTURE_REORDER_KEY)
  );
}
