import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ChefHat, RefreshCw, Truck, Clock, Check, Sparkles } from "lucide-react";
import { DAYS, type PlanDay } from "./types";

type WinKind = "plan" | "leftovers" | "saved" | "takeout";

/** A single scoring factor, surfaced to the user as a "why" chip. */
interface Signal {
  label: string;
  delta: number;
}

interface WinOption {
  kind: WinKind;
  title: string;
  subtitle: string;
  reason: string;
  minutes: number | null;
  score: number;
  signals: Signal[];
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

/** Outcomes recorded on evening check-ins, weighted by how strong the signal is. */
const OUTCOME_WEIGHT: Record<string, number> = {
  cooked_loved: 14,
  cooked_fine: 6,
  leftovers: 4,
  ordered_out: 0,
  neutral: 0,
  skipped: -8,
  too_hard: -16,
  kids_refused: -18,
  not_again: -30,
};

type RecentCheckin = {
  outcome: string | null;
  effort_level: string | null;
  created_at: string;
  plan_day: { meal_name: string | null; cuisine_type: string | null; meal_mode: string | null } | null;
};

const norm = (s?: string | null) => (s ?? "").toLowerCase().trim();

/**
 * "Tonight's easiest win" — one confident recommendation for tonight,
 * built from the plan plus what this household has actually done in the
 * last 7–14 nights (check-ins), longer-run meal feedback, and their
 * stated favourites/dislikes. Every factor is shown back to the user.
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
  const [checkins, setCheckins] = useState<RecentCheckin[]>([]);
  const [prefs, setPrefs] = useState<{
    cuisines_liked: string[] | null;
    cuisines_disliked: string[] | null;
    foods_to_avoid: string[] | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const [fb, sm, tk, ci, pf] = await Promise.all([
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
        supabase
          .from("evening_checkins")
          .select("outcome, effort_level, created_at, plan_day:plan_days(meal_name, cuisine_type, meal_mode)")
          .eq("household_id", householdId)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(14),
        supabase
          .from("household_preferences")
          .select("cuisines_liked, cuisines_disliked, foods_to_avoid")
          .eq("household_id", householdId)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setFeedback((fb.data as any) ?? []);
      setSavedMeals((sm.data as any) ?? []);
      setTakeout((tk.data as any) ?? []);
      setCheckins((ci.data as any) ?? []);
      setPrefs((pf.data as any) ?? null);
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [householdId]);

  const options = useMemo<WinOption[]>(() => {
    // ---- Long-run meal sentiment from explicit feedback ----
    const sentiment = new Map<string, { good: number; bad: number }>();
    for (const f of feedback) {
      const key = norm(f.meal_name);
      const cur = sentiment.get(key) ?? { good: 0, bad: 0 };
      if (POSITIVE.has(f.feedback)) cur.good++;
      if (NEGATIVE.has(f.feedback)) cur.bad++;
      sentiment.set(key, cur);
    }

    // ---- Recent behaviour from the last 7–14 check-ins ----
    const recent = checkins.slice(0, 14);
    const last7 = recent.slice(0, 7);
    const outcomeByMeal = new Map<string, number>();
    let tookOutCount = 0;
    let hardCount = 0;
    let cookedCount = 0;
    const recentMeals = new Set<string>();
    for (const c of recent) {
      const name = norm(c.plan_day?.meal_name);
      if (name) {
        recentMeals.add(name);
        const w = OUTCOME_WEIGHT[c.outcome ?? "neutral"] ?? 0;
        outcomeByMeal.set(name, (outcomeByMeal.get(name) ?? 0) + w);
      }
      if (c.outcome === "ordered_out") tookOutCount++;
      if (c.outcome === "too_hard" || c.effort_level === "too_much") hardCount++;
      if (c.outcome === "cooked_loved" || c.outcome === "cooked_fine") cookedCount++;
    }
    // Low-energy signal: recent nights skewed hard or ordered-out.
    const strainRatio = recent.length ? (hardCount + tookOutCount) / recent.length : 0;
    const cookedRecently7 = last7.filter(
      (c) => c.outcome === "cooked_loved" || c.outcome === "cooked_fine",
    ).length;

    const disliked = new Set((prefs?.cuisines_disliked ?? []).map(norm).filter(Boolean));
    const liked = new Set((prefs?.cuisines_liked ?? []).map(norm).filter(Boolean));
    const avoid = (prefs?.foods_to_avoid ?? []).map(norm).filter(Boolean);

    const push = (list: Signal[], label: string, delta: number) => {
      if (delta !== 0) list.push({ label, delta });
    };

    /** Shared per-meal signals: feedback history, recent outcomes, cuisine fit, avoid-list. */
    const mealSignals = (name?: string | null, cuisine?: string | null): Signal[] => {
      const out: Signal[] = [];
      const key = norm(name);
      if (!key) return out;
      const s = sentiment.get(key);
      if (s?.good) push(out, `Rated well ${s.good}×`, s.good * 12);
      if (s?.bad) push(out, `Fell flat ${s.bad}×`, -s.bad * 18);
      const o = outcomeByMeal.get(key);
      if (o) push(out, o > 0 ? "Went well recently" : "Rough night recently", o);
      const c = norm(cuisine);
      if (c && liked.has(c)) push(out, `${cuisine} is a house favourite`, 10);
      if (c && disliked.has(c)) push(out, `${cuisine} is on your dislikes`, -25);
      if (avoid.some((a) => a && key.includes(a))) push(out, "Contains a food you avoid", -40);
      return out;
    };

    const lowEnergyDay = todayDow >= 3; // Thu, Fri, Sat, Sun
    const out: WinOption[] = [];

    if (todayDay?.meal_name) {
      const signals: Signal[] = [{ label: "Already on your plan", delta: 60 }];
      const mins = todayDay.prep_time_minutes ?? 35;
      if (mins > 45) push(signals, `${mins} min is a long cook`, -22);
      else if (mins > 30) push(signals, `${mins} min tonight`, -10);
      else push(signals, `Quick — about ${mins} min`, 6);
      if (lowEnergyDay) push(signals, `${DAYS[todayDow]} energy is usually lower`, -6);
      if (strainRatio >= 0.4 && mins > 30) push(signals, "Recent nights ran hard", -12);
      signals.push(...mealSignals(todayDay.meal_name, todayDay.cuisine_type));

      const score = signals.reduce((a, s) => a + s.delta, 0);
      out.push({
        kind: todayDay.meal_mode === "takeout" || todayDay.meal_mode === "dine_out" ? "takeout" : "plan",
        title: todayDay.meal_name,
        subtitle: todayDay.meal_description || `${DAYS[todayDow]}'s planned dinner`,
        reason:
          (sentiment.get(norm(todayDay.meal_name))?.good ?? 0) > 0
            ? "You've rated this well before — a safe, fast yes."
            : "Already planned, ingredients already on your list.",
        minutes: todayDay.prep_time_minutes,
        score,
        signals,
      });
    }

    const leftoverCandidate =
      yesterdayDay?.meal_name &&
      feedback.some((f) => f.feedback === "good_leftovers" && norm(f.meal_name) === norm(yesterdayDay.meal_name));
    const cookedYesterday = last7.some(
      (c) =>
        norm(c.plan_day?.meal_name) === norm(yesterdayDay?.meal_name) &&
        (c.outcome === "cooked_loved" || c.outcome === "cooked_fine"),
    );
    if (yesterdayDay?.meal_name && (leftoverCandidate || cookedYesterday || todayDay?.meal_mode === "leftovers")) {
      const signals: Signal[] = [{ label: "No cooking, ~10 min", delta: 58 }];
      if (lowEnergyDay) push(signals, `${DAYS[todayDow]} energy is usually lower`, 14);
      if (leftoverCandidate) push(signals, "You said this reheats well", 12);
      if (cookedYesterday) push(signals, "You cooked this last night", 10);
      if (strainRatio >= 0.4) push(signals, "Recent nights ran hard", 12);
      signals.push(...mealSignals(yesterdayDay.meal_name, yesterdayDay.cuisine_type));
      out.push({
        kind: "leftovers",
        title: `Leftover ${yesterdayDay.meal_name}`,
        subtitle: "Reheat, plate, done.",
        reason: leftoverCandidate
          ? "You've said this one reheats well."
          : cookedYesterday
            ? "You cooked this last night — the easiest possible win."
            : "Tonight is already a leftovers night on your plan.",
        minutes: 10,
        score: signals.reduce((a, s) => a + s.delta, 0),
        signals,
      });
    }

    const scoredSaved = savedMeals
      .map((m) => {
        const signals: Signal[] = [{ label: "From your saved meals", delta: 46 }];
        if (lowEnergyDay) push(signals, "Low-decision option for tonight", 6);
        if (recentMeals.has(norm(m.meal_name))) push(signals, "Eaten in the last two weeks", -14);
        signals.push(...mealSignals(m.meal_name, null));
        return { m, signals, score: signals.reduce((a, s) => a + s.delta, 0) };
      })
      .sort((a, b) => b.score - a.score);
    const bestSaved = scoredSaved[0];
    if (bestSaved && norm(bestSaved.m.meal_name) !== norm(todayDay?.meal_name)) {
      const good = sentiment.get(norm(bestSaved.m.meal_name))?.good ?? 0;
      out.push({
        kind: "saved",
        title: bestSaved.m.meal_name,
        subtitle: bestSaved.m.meal_description || "From your saved meals",
        reason:
          good > 0
            ? "A repeat winner in your house — almost no decision cost."
            : "One of your saved meals: you already know how to make it.",
        minutes: null,
        score: bestSaved.score,
        signals: bestSaved.signals,
      });
    }

    if (takeout.length) {
      const t = takeout[0];
      const signals: Signal[] = [{ label: "Zero cooking, zero cleanup", delta: 40 }];
      if (lowEnergyDay) push(signals, `${DAYS[todayDow]} energy is usually lower`, 12);
      if (!todayDay?.meal_name) push(signals, "Nothing planned for tonight", 14);
      if (strainRatio >= 0.4) push(signals, "Recent nights ran hard", 10);
      if (tookOutCount >= 3) push(signals, `Already ordered out ${tookOutCount}× recently`, -18);
      if (cookedRecently7 >= 5) push(signals, "You've cooked most nights this week", 8);
      if (disliked.has(norm(t.cuisine_type))) push(signals, `${t.cuisine_type} is on your dislikes`, -25);
      out.push({
        kind: "takeout",
        title: t.restaurant_name || `${t.cuisine_type} takeout`,
        subtitle: t.avg_cost ? `Usually around $${Math.round(Number(t.avg_cost))}` : t.cuisine_type,
        reason: "Zero cooking, zero cleanup — still counts as a logged dinner.",
        minutes: 0,
        score: signals.reduce((a, s) => a + s.delta, 0),
        signals,
      });
    }

    return out.sort((a, b) => b.score - a.score);
  }, [feedback, savedMeals, takeout, checkins, prefs, todayDay, yesterdayDay, todayDow]);

  if (checkedIn || loading || options.length === 0) return null;

  const [top, ...rest] = options;
  const Icon = KIND_META[top.kind].icon;
  const topSignals = [...top.signals].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 4);
  const basedOn = checkins.length
    ? `Based on your last ${Math.min(checkins.length, 14)} check-in${checkins.length === 1 ? "" : "s"}`
    : "Based on your plan and saved favourites";

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

          {/* Why this pick — the actual scoring factors, in plain language */}
          <div className="rounded-xl bg-muted/40 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-foreground">Why this pick</p>
              <button
                type="button"
                onClick={() => setShowWhy((v) => !v)}
                className="text-[11px] text-muted-foreground underline underline-offset-2"
              >
                {showWhy ? "Less" : "More"}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(showWhy ? top.signals : topSignals).map((s, i) => (
                <span
                  key={i}
                  className={`text-[10px] rounded-full px-2 py-1 ${
                    s.delta >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {s.delta >= 0 ? "+" : "−"} {s.label}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{basedOn}, feedback and your food preferences.</p>
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
                    const why = [...o.signals].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 2);
                    return (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5">
                        <AltIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground break-words">{o.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug">{o.reason}</p>
                          {why.length > 0 && (
                            <p className="text-[10px] text-muted-foreground/80 mt-1">
                              {why.map((s) => s.label).join(" · ")}
                            </p>
                          )}
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
