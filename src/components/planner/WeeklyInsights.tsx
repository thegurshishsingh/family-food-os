import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DAYS } from "./types";

interface WeeklyInsightsProps {
  householdId: string;
}

type Insight = {
  emoji: string;
  text: string;
  confidence: "high" | "medium";
};

const WeeklyInsights = ({ householdId }: WeeklyInsightsProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [householdId]);

  const generateInsights = async () => {
    try {
      // Get last 28 days of plan data with check-ins
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      const { data: plans } = await supabase
        .from("weekly_plans")
        .select("id, week_start")
        .eq("household_id", householdId)
        .gte("week_start", fourWeeksAgo.toISOString().split("T")[0])
        .order("week_start", { ascending: false });

      if (!plans || plans.length < 2) {
        setLoading(false);
        return; // Need at least 2 weeks of data
      }

      const planIds = plans.map((p) => p.id);

      // Fetch all plan_days and check-ins in parallel
      const [daysResult, checkinsResult, feedbackResult] = await Promise.all([
        supabase
          .from("plan_days")
          .select("id, plan_id, day_of_week, meal_mode, meal_name, prep_time_minutes")
          .in("plan_id", planIds),
        supabase
          .from("evening_checkins")
          .select("plan_day_id, effort_level, tags")
          .eq("household_id", householdId),
        supabase
          .from("meal_feedback")
          .select("plan_day_id, feedback")
          .eq("household_id", householdId),
      ]);

      const allDays = daysResult.data || [];
      const allCheckins = checkinsResult.data || [];
      const allFeedback = feedbackResult.data || [];

      // Build lookup maps
      const checkinMap = new Map<string, { effort_level: string | null; tags: string[] }>();
      allCheckins.forEach((c: any) => checkinMap.set(c.plan_day_id, c));

      const feedbackMap = new Map<string, string>();
      allFeedback.forEach((f: any) => { if (f.plan_day_id) feedbackMap.set(f.plan_day_id, f.feedback); });

      const results: Insight[] = [];

      // ── Pattern 1: Days that often become takeout/ordered ──
      const dayTakeoutCount: Record<number, number> = {};
      const dayTotalCount: Record<number, number> = {};
      allDays.forEach((d: any) => {
        dayTotalCount[d.day_of_week] = (dayTotalCount[d.day_of_week] || 0) + 1;
        if (d.meal_mode === "takeout" || d.meal_mode === "dine_out") {
          dayTakeoutCount[d.day_of_week] = (dayTakeoutCount[d.day_of_week] || 0) + 1;
        }
        // Also check if checkin says "ordered_out"
        const ci = checkinMap.get(d.id);
        if (ci?.tags?.includes("ordered_out") && d.meal_mode === "cook") {
          dayTakeoutCount[d.day_of_week] = (dayTakeoutCount[d.day_of_week] || 0) + 1;
        }
      });

      for (const [dow, count] of Object.entries(dayTakeoutCount)) {
        const total = dayTotalCount[Number(dow)] || 1;
        const ratio = count / total;
        if (ratio >= 0.5 && total >= 2) {
          results.push({
            emoji: "🍕",
            text: `${DAYS[Number(dow)]}s often become takeout nights`,
            confidence: ratio >= 0.75 ? "high" : "medium",
          });
        }
      }

      // ── Pattern 2: Days with high-effort feedback ──
      const dayEffortHard: Record<number, number> = {};
      allDays.forEach((d: any) => {
        const ci = checkinMap.get(d.id);
        const fb = feedbackMap.get(d.id);
        if (ci?.effort_level === "too_much" || fb === "too_hard") {
          dayEffortHard[d.day_of_week] = (dayEffortHard[d.day_of_week] || 0) + 1;
        }
      });

      for (const [dow, count] of Object.entries(dayEffortHard)) {
        const total = dayTotalCount[Number(dow)] || 1;
        if (count >= 2 && count / total >= 0.4) {
          results.push({
            emoji: "😮‍💨",
            text: `${DAYS[Number(dow)]} meals should stay under 20 minutes`,
            confidence: count / total >= 0.6 ? "high" : "medium",
          });
        }
      }

      // ── Pattern 3: Kids' preferences ──
      let kidsRefusedCount = 0;
      let kidsLovedCount = 0;
      let totalFeedbackCount = 0;
      allDays.forEach((d: any) => {
        const fb = feedbackMap.get(d.id);
        const ci = checkinMap.get(d.id);
        if (fb || ci) totalFeedbackCount++;
        if (fb === "kids_refused" || ci?.tags?.includes("kids_refused")) kidsRefusedCount++;
        if (ci?.tags?.includes("everyone_liked") || fb === "loved") kidsLovedCount++;
      });

      if (kidsRefusedCount >= 2) {
        results.push({
          emoji: "👶",
          text: "Kids prefer milder, familiar flavors — we'll adjust",
          confidence: kidsRefusedCount >= 3 ? "high" : "medium",
        });
      }

      // ── Pattern 4: Easy wins are popular ──
      let easyWinCount = 0;
      allCheckins.forEach((ci: any) => {
        if (ci.tags?.includes("easy_win")) easyWinCount++;
      });
      if (easyWinCount >= 3) {
        results.push({
          emoji: "✅",
          text: "Quick meals are your most consistent wins",
          confidence: easyWinCount >= 5 ? "high" : "medium",
        });
      }

      // ── Pattern 5: Leftovers work well ──
      let leftoverLovedCount = 0;
      allDays.forEach((d: any) => {
        if (d.meal_mode === "leftovers") {
          const ci = checkinMap.get(d.id);
          const fb = feedbackMap.get(d.id);
          if (ci?.effort_level === "easy" || fb === "loved" || fb === "good_leftovers") {
            leftoverLovedCount++;
          }
        }
      });
      if (leftoverLovedCount >= 2) {
        results.push({
          emoji: "♻️",
          text: "Leftover nights are working great — keep them coming",
          confidence: leftoverLovedCount >= 3 ? "high" : "medium",
        });
      }

      // ── Pattern 6: Average prep time preference ──
      const cookDays = allDays.filter((d: any) => d.meal_mode === "cook" && d.prep_time_minutes);
      if (cookDays.length >= 4) {
        const avgPrep = cookDays.reduce((sum: number, d: any) => sum + d.prep_time_minutes, 0) / cookDays.length;
        const easyDays = cookDays.filter((d: any) => {
          const ci = checkinMap.get(d.id);
          return ci?.effort_level === "easy" || ci?.effort_level === "fine";
        });
        const hardDays = cookDays.filter((d: any) => {
          const ci = checkinMap.get(d.id);
          return ci?.effort_level === "too_much";
        });
        const avgEasyPrep = easyDays.length ? easyDays.reduce((s: number, d: any) => s + d.prep_time_minutes, 0) / easyDays.length : null;

        if (avgEasyPrep && avgEasyPrep <= 15 && hardDays.length >= 1) {
          results.push({
            emoji: "⏱️",
            text: `Your sweet spot is meals under ${Math.round(avgEasyPrep + 5)} minutes`,
            confidence: "medium",
          });
        }
      }

      // Limit to top 4 insights, prioritizing high confidence
      const sorted = results.sort((a, b) => {
        if (a.confidence === "high" && b.confidence !== "high") return -1;
        if (b.confidence === "high" && a.confidence !== "high") return 1;
        return 0;
      });

      setInsights(sorted.slice(0, 4));
    } catch (err) {
      console.error("Failed to generate insights:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || insights.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group py-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">
            What we've learned
          </span>
          <span className="text-[11px] text-muted-foreground/50 ml-1">
            {insights.length} insight{insights.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground/40 ml-auto transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>

        <AnimatePresence>
          {open && (
            <CollapsibleContent forceMount>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl border transition-colors ${
                        insight.confidence === "high"
                          ? "border-primary/15 bg-primary/[0.03]"
                          : "border-border/40 bg-card/50"
                      }`}
                    >
                      <span className="text-base mt-0.5 shrink-0">{insight.emoji}</span>
                      <p className="text-[13px] text-foreground/80 leading-snug">
                        {insight.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/40 mt-2 ml-1">
                  Based on the last {Math.min(4, Math.ceil(insights.length))} weeks of check-ins
                </p>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </motion.div>
    </Collapsible>
  );
};

export default WeeklyInsights;
