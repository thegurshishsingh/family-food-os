import { ChefHat, RefreshCw, Truck, Store, Zap, Heart, ThumbsUp, Baby, Wrench, RotateCcw, Star } from "lucide-react";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type MealMode = "cook" | "leftovers" | "takeout" | "dine_out" | "emergency";

export const MODE_CONFIG: Record<MealMode, { label: string; icon: typeof ChefHat; color: string }> = {
  cook: { label: "Cook", icon: ChefHat, color: "bg-primary text-primary-foreground" },
  leftovers: { label: "Leftovers", icon: RefreshCw, color: "bg-secondary text-secondary-foreground" },
  takeout: { label: "Takeout", icon: Truck, color: "bg-accent text-accent-foreground" },
  dine_out: { label: "Dine Out", icon: Store, color: "bg-warm text-primary-foreground" },
  emergency: { label: "Emergency", icon: Zap, color: "bg-destructive text-destructive-foreground" },
};

export type FeedbackType = "loved" | "okay" | "kids_refused" | "too_hard" | "good_leftovers" | "reorder_worthy";

export const FEEDBACK_OPTIONS: { value: FeedbackType; label: string; icon: typeof Heart; emoji: string }[] = [
  { value: "loved", label: "Loved it", icon: Heart, emoji: "❤️" },
  { value: "okay", label: "Okay", icon: ThumbsUp, emoji: "👍" },
  { value: "kids_refused", label: "Kids refused", icon: Baby, emoji: "👶" },
  { value: "too_hard", label: "Too much work", icon: Wrench, emoji: "😮‍💨" },
  { value: "good_leftovers", label: "Good leftovers", icon: RotateCcw, emoji: "♻️" },
  { value: "reorder_worthy", label: "Reorder-worthy", icon: Star, emoji: "⭐" },
];

export type PlanDay = {
  id: string;
  day_of_week: number;
  meal_mode: MealMode;
  meal_name: string | null;
  meal_description: string | null;
  cuisine_type: string | null;
  prep_time_minutes: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  is_locked: boolean;
  notes: string | null;
  takeout_budget: number | null;
};

export type WeeklyPlan = {
  id: string;
  week_start: string;
  reality_score: number | null;
  reality_message: string | null;
};
