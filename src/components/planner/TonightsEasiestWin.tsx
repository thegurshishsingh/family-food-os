import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ChefHat, RefreshCw, Truck, Clock, Check, Sparkles } from "lucide-react";
import { DAYS, type PlanDay } from "./types";

type WinKind = "plan" | "leftovers" | "saved" | "takeout";

interface WinOption {
  kind: WinKind;
  title: string;
  subtitle: string;
  reason: string;
  minutes: number | null;
  score: number;
}

interface TonightsEasiestWinProps {
  householdId: string;
  todayDow: number;
  todayDay: PlanDay | null;
  /** Yesterday's plan day, used to spot leftover opportunities. */
  yesterdayDay: PlanDay | null;
  /** True when tonight has already been logged — panel hides itself. */
  checkedIn: boolean;
  /** Jump the user to the one-tap check-in. */
  onLogRequest: () => void;
}

const KIND_META: Record<WinKind, { icon: typeof ChefHat; label: string; tint: string }> = {
  plan: { icon: ChefHat, label: "Cook the plan", tint: "bg-primary/10 text-primary" },
  leftovers: { icon: RefreshCw, label: "Zero-cook night", tint: "bg-secondary/60 text-secondary-foreground" },
  saved: { icon: Sparkles, label: "Household favourite", tint: "bg-sage/20 text-primary" },
  takeout: { icon: Truck, label: "Order in", tint: "bg-accent/15 text-accent-foreground" },
};

const NEGATIVE = new Set(["too_hard", "kids_refused"]);
const POSITIVE = new Set(["loved", "reorder_worthy", "good_leftovers"]);

/**
 * "Tonight's easiest win" — one confident recommendation for tonight,
 * built from the plan plus what this household has actually enjoyed.
 * Designed to shorten the distance between opening the app and logging.
 */
const TonightsEasiestWin = ({
  householdId,
  todayDow,
  todayDay,
  yesterdayDay,
  checkedIn,
  onLogRequest,
}: TonightsEasiestWinProps) => {
  const [feedback, setFeedback] = useState<{ meal_name: string; feedback: string }[]>([]);
  const [savedMeals, setSavedMeals] = useState<{ meal_name: string; meal_description: string | null }[]>([]);
  const [takeout, setTakeout] = useState<
    { cuisine_type: string; restaurant_name: string | null; avg_cost: number | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [fb, sm, tk] = await Promise.all([
        supabase
          .from("meal_feedback")
          .select("meal_name, feedback")
          .eq("household_id", householdId)
          .order("created_at", { ascending: false })
          .limit(120),
        supabase
          .from("saved_meals")
          .select("meal_name, meal_description")
          .eq("household_id", householdId)
          .eq("include_in_plan", true)
          .limit(30),
        supabase
          .from("saved_takeout_preferences")
          .select("cuisine_type, restaurant_name, avg_cost")
          .eq("household_id", householdId)
          .limit(10),
      ]);
      if (cancelled) return;
      setFeedback((fb.data as any) ?? []);
      setSavedMeals((sm.data as any) ?? []);
      setTakeout((tk.data as any) ?? []);
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [householdId]);

  const options = useMemo<WinOption[]>(() => {
    const sentiment = new Map<string, { good: number; bad: number }>();
    for (const f of feedback) {
      const key = f.meal_name.toLowerCase().trim();
      const cur = sentiment.get(key) ?? { good: 0, bad: 0 };
      if (POSITIVE.has(f.feedback)) cur.good++;
      if (NEGATIVE.has(f.feedback)) cur.bad++;
      sentiment.set(key, cur);
    }
    const scoreFor = (name?: string | null) => {
      if (!name) return 0;
      const s = sentiment.get(name.toLowerCase().trim());
      if (!s) return 0;
      return s.good * 12 - s.bad * 18;
    };

    // Late in the week, energy is lower — bias towards low-effort wins.
    const lowEnergyDay = todayDow >= 3; // Thu, Fri, Sat, Sun
    const out: WinOption[] = [];

    if (todayDay?.meal_name) {
      const mins = todayDay.prep_time_minutes ?? 35;
      const effortPenalty = mins > 45 ? 22 : mins > 30 ? 10 : 0;
      out.push({
        kind: todayDay.meal_mode === "takeout" || todayDay.meal_mode === "dine_out" ? "takeout" : "plan",
        title: todayDay.meal_name,
        subtitle: todayDay.meal_description || `${DAYS[todayDow]}'s planned dinner`,
        reason:
          scoreFor(todayDay.meal_name) > 0
            ? "You've rated this well before — a safe, fast yes."
            : "Already planned, ingredients already on your list.",
        minutes: todayDay.prep_time_minutes,
        score: 60 + scoreFor(todayDay.meal_name) - effortPenalty - (lowEnergyDay ? 6 : 0),
      });
    }

    const leftoverCandidate =
      yesterdayDay?.meal_name &&
      feedback.some(
        (f) =>
          f.feedback === "good_leftovers" &&
          f.meal_name.toLowerCase().trim() === yesterdayDay.meal_name!.toLowerCase().trim(),
      );
    if (yesterdayDay?.meal_name && (leftoverCandidate || todayDay?.meal_mode === "leftovers")) {
      out.push({
        kind: "leftovers",
        title: `Leftover ${yesterdayDay.meal_name}`,
        subtitle: "Reheat, plate, done.",
        reason: leftoverCandidate
          ? "You've said this one reheats well."
          : "Tonight is already a leftovers night on your plan.",
        minutes: 10,
        score: 58 + (lowEnergyDay ? 14 : 0),
      });
    }

    const bestSaved = [...savedMeals]
      .map((m) => ({ m, s: scoreFor(m.meal_name) }))
      .sort((a, b) => b.s - a.s)[0];
    if (bestSaved && bestSaved.m.meal_name.toLowerCase() !== todayDay?.meal_name?.toLowerCase()) {
      out.push({
        kind: "saved",
        title: bestSaved.m.meal_name,
        subtitle: bestSaved.m.meal_description || "From your saved meals",
        reason:
          bestSaved.s > 0
            ? "A repeat winner in your house — almost no decision cost."
            : "One of your saved meals: you already know how to make it.",
        minutes: null,
        score: 46 + bestSaved.s + (lowEnergyDay ? 6 : 0),
      });
    }

    if (takeout.length) {
      const t = takeout[0];
      out.push({
        kind: "takeout",
        title: t.restaurant_name || `${t.cuisine_type} takeout`,
        subtitle: t.avg_cost ? `Usually around $${Math.round(Number(t.avg_cost))}` : t.cuisine_type,
        reason: "Zero cooking, zero cleanup — still counts as a logged dinner.",
        minutes: 0,
        score: 40 + (lowEnergyDay ? 12 : 0) + (todayDay?.meal_name ? 0 : 14),
      });
    }

    return out.sort((a, b) => b.score - a.score);
  }, [feedback, savedMeals, takeout, todayDay, yesterdayDay, todayDow]);

  if (checkedIn || loading || options.length === 0) return null;

  const [top, ...rest] = options;
  const Icon = KIND_META[top.kind].icon;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="glass-card border-primary/20 overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-accent" />
            </span>
            <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
              Tonight's easiest win
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${KIND_META[top.kind].tint}`}>
              <Icon className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif font-semibold text-base text-foreground leading-snug break-words">
                  {top.title}
                </h3>
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {KIND_META[top.kind].label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{top.subtitle}</p>
              <p className="text-xs text-foreground/80 mt-2 leading-snug">{top.reason}</p>
              {top.minutes !== null && (
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                  <Clock className="w-3 h-3" />
                  {top.minutes === 0 ? "No cooking" : `About ${top.minutes} min`}
                </p>
              )}
            </div>
          </div>

          <Button onClick={onLogRequest} className="w-full h-12 gap-2 rounded-xl">
            <Check className="w-4 h-4" /> Log tonight in one tap
          </Button>

          {rest.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowAlternatives((v) => !v)}
                className="text-[11px] text-muted-foreground underline underline-offset-2"
              >
                {showAlternatives ? "Hide backups" : `Not tonight? ${rest.length} easier backup${rest.length === 1 ? "" : "s"}`}
              </button>
              {showAlternatives && (
                <div className="mt-3 space-y-2">
                  {rest.map((o, i) => {
                    const AltIcon = KIND_META[o.kind].icon;
                    return (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5">
                        <AltIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground break-words">{o.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug">{o.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TonightsEasiestWin;
