import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useHousehold } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChefHat, Heart, Clock, Flame, TrendingUp, Lightbulb,
  Baby, Calendar, Truck, Star, Utensils, Timer,
} from "lucide-react";
import { motion } from "framer-motion";

type FeedbackRow = { meal_name: string; feedback: string; created_at: string };
type PlanDayRow = {
  id: string; day_of_week: number; meal_mode: string; meal_name: string | null;
  cuisine_type: string | null; prep_time_minutes: number | null; calories: number | null;
};
type CheckinRow = { plan_day_id: string; tags: string[]; effort_level: string | null };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const FamilyProfile = () => {
  const { household, preferences } = useHousehold();
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [planDays, setPlanDays] = useState<PlanDayRow[]>([]);
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [planCount, setPlanCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!household) return;
    Promise.all([
      supabase.from("meal_feedback").select("meal_name, feedback, created_at")
        .eq("household_id", household.id).order("created_at", { ascending: false }),
      supabase.from("weekly_plans").select("id").eq("household_id", household.id),
      supabase.from("evening_checkins").select("plan_day_id, tags, effort_level")
        .eq("household_id", household.id),
    ]).then(async ([fbRes, plansRes, ciRes]) => {
      if (fbRes.data) setFeedback(fbRes.data as FeedbackRow[]);
      const plans = (plansRes.data || []) as { id: string }[];
      setPlanCount(plans.length);
      if (plans.length > 0) {
        const planIds = plans.map(p => p.id);
        const { data: days } = await supabase
          .from("plan_days")
          .select("id, day_of_week, meal_mode, meal_name, cuisine_type, prep_time_minutes, calories")
          .in("plan_id", planIds);
        if (days) setPlanDays(days as PlanDayRow[]);
      }
      if (ciRes.data) setCheckins(ciRes.data as CheckinRow[]);
      setLoading(false);
    });
  }, [household]);

  // === Computed insights ===
  const identity = useMemo(() => {
    if (!planDays.length) return null;
    const cookNights = planDays.filter(d => d.meal_mode === "cook").length;
    const avgCookPerWeek = planCount > 0 ? Math.round(cookNights / planCount) : 0;

    const cuisineCounts: Record<string, number> = {};
    planDays.forEach(d => { if (d.cuisine_type) cuisineCounts[d.cuisine_type] = (cuisineCounts[d.cuisine_type] || 0) + 1; });
    const favCuisine = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const prepTimes = planDays.filter(d => d.prep_time_minutes).map(d => d.prep_time_minutes!);
    const avgPrep = prepTimes.length ? Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length) : null;

    const dayCounts: Record<number, number> = {};
    planDays.filter(d => d.meal_mode === "cook" && d.meal_name).forEach(d => {
      dayCounts[d.day_of_week] = (dayCounts[d.day_of_week] || 0) + 1;
    });
    const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    const mostCookedDay = topDay ? DAYS[Number(topDay[0])] : null;

    return { avgCookPerWeek, favCuisine, avgPrep, mostCookedDay };
  }, [planDays, planCount]);

  const lovedMeals = useMemo(() => {
    const loved = feedback.filter(f => f.feedback === "loved" || f.feedback === "reorder_worthy");
    const counts: Record<string, number> = {};
    loved.forEach(f => { counts[f.meal_name] = (counts[f.meal_name] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [feedback]);

  const kidsInsights = useMemo(() => {
    const insights: string[] = [];
    const kidsRefused = feedback.filter(f => f.feedback === "kids_refused");
    const kidsLovedCuisines: Record<string, number> = {};

    // Find cuisines kids didn't refuse
    const refusedMeals = new Set(kidsRefused.map(f => f.meal_name.toLowerCase()));
    const lovedByKids = feedback.filter(f =>
      f.feedback === "loved" && !refusedMeals.has(f.meal_name.toLowerCase())
    );

    planDays.forEach(d => {
      if (d.meal_name && d.cuisine_type && !refusedMeals.has(d.meal_name.toLowerCase())) {
        kidsLovedCuisines[d.cuisine_type] = (kidsLovedCuisines[d.cuisine_type] || 0) + 1;
      }
    });

    const topKidsCuisines = Object.entries(kidsLovedCuisines)
      .sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);

    if (kidsRefused.length > 2) insights.push("Kids prefer mild, familiar flavors");
    if (topKidsCuisines.length > 0) insights.push(`Kids liked ${topKidsCuisines.join(" and ")} dishes`);

    // Leftover day insights
    const leftoverDays = planDays.filter(d => d.meal_mode === "leftovers");
    const leftoverDow: Record<number, number> = {};
    leftoverDays.forEach(d => { leftoverDow[d.day_of_week] = (leftoverDow[d.day_of_week] || 0) + 1; });
    const topLeftover = Object.entries(leftoverDow).sort((a, b) => b[1] - a[1])[0];
    if (topLeftover && Number(topLeftover[1]) >= 2) {
      insights.push(`Leftovers worked well on ${DAYS[Number(topLeftover[0])]}`);
    }

    return insights;
  }, [feedback, planDays]);

  const rhythm = useMemo(() => {
    if (!planDays.length || !planCount) return null;
    const takeoutDow: Record<number, number> = {};
    planDays.filter(d => d.meal_mode === "takeout" || d.meal_mode === "dine_out")
      .forEach(d => { takeoutDow[d.day_of_week] = (takeoutDow[d.day_of_week] || 0) + 1; });
    const topTakeout = Object.entries(takeoutDow).sort((a, b) => b[1] - a[1])[0];
    const takeoutDay = topTakeout && Number(topTakeout[1]) >= 2 ? DAYS[Number(topTakeout[0])] : null;

    const cookNights = planDays.filter(d => d.meal_mode === "cook").length;
    const avgCook = Math.round(cookNights / planCount);

    const prepTimes = planDays.filter(d => d.prep_time_minutes && d.meal_mode === "cook").map(d => d.prep_time_minutes!);
    const avgPrep = prepTimes.length ? Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length) : null;

    return { takeoutDay, avgCook, avgPrep };
  }, [planDays, planCount]);

  const timeSaved = useMemo(() => {
    // ~90 min saved per planned week (conservative estimate)
    const minutesSaved = planCount * 90;
    const hours = (minutesSaved / 60).toFixed(1);
    const movieNights = Math.floor(minutesSaved / 120);
    return { hours, movieNights, minutesSaved };
  }, [planCount]);

  const recommendations = useMemo(() => {
    const recs: string[] = [];

    // Seasonal suggestions based on current month
    const month = new Date().getMonth(); // 0-11
    const seasonal: Record<number, string[]> = {
      0: ["Try a hearty beef stew or chili to warm up January nights.", "Root vegetables are in season — roasted carrots and parsnips make easy sides."],
      1: ["February is great for slow-cooker soups — less effort, more comfort.", "Try a cozy lentil or split pea soup this week."],
      2: ["Spring greens are arriving! Add a fresh salad night to your plan.", "Try asparagus or pea-based dishes as they come into season."],
      3: ["April is perfect for lighter pastas with fresh herbs.", "Artichokes and spring onions are at their peak — great in simple dishes."],
      4: ["Summer produce is starting — try grilled zucchini or fresh corn dishes.", "Strawberries are in season — add a fruit salad dessert night."],
      5: ["It's grilling season! Try a kebab or burger night this week.", "Fresh tomatoes and basil are perfect for caprese or bruschetta."],
      6: ["Peak summer — light meals like fish tacos or grain bowls work great.", "Try a no-cook dinner night with gazpacho or summer rolls."],
      7: ["Late summer peaches and peppers are amazing in stir-fries and salads.", "Back-to-school season — batch-cook friendly meals like chili or pasta bake."],
      8: ["Fall squash is arriving — try butternut squash soup or roasted acorn squash.", "September is perfect for one-pot meals as schedules get busier."],
      9: ["Pumpkin and apple season! Try a savory pumpkin pasta or apple-glazed chicken.", "Comfort food weather — perfect for pot pies and casseroles."],
      10: ["Root vegetables and hearty greens are in season — try kale and sweet potato bowls.", "Thanksgiving prep: try a practice run of a new side dish."],
      11: ["Holiday season — try a slow-cooker meal to free up oven time.", "Citrus is in season — brighten winter meals with lemon or orange glazes."],
    };
    const monthRecs = seasonal[month] || [];
    // Pick one seasonal rec randomly (stable per render)
    if (monthRecs.length > 0) {
      const seasonalPick = monthRecs[new Date().getDate() % monthRecs.length];
      recs.push(`🌿 ${seasonalPick}`);
    }

    if (identity?.favCuisine) {
      const cuisines = ["Mediterranean", "Thai", "Japanese", "Korean", "Indian"];
      const suggestion = cuisines.find(c => c.toLowerCase() !== identity.favCuisine?.toLowerCase());
      if (suggestion) recs.push(`Try adding one ${suggestion} meal next week for variety.`);
    }
    if (lovedMeals.length > 0) {
      recs.push(`Your family loved "${lovedMeals[0].name}" — consider adding another quick meal in that style.`);
    }
    if (rhythm?.avgCook && rhythm.avgCook >= 6) {
      recs.push("You cook most nights! Adding a leftover night could save prep time.");
    }
    if (rhythm?.takeoutDay) {
      recs.push(`${rhythm.takeoutDay} is your usual takeout day — plan lighter meals the night before.`);
    }
    if (recs.length === 0) recs.push("Keep logging check-ins to unlock personalized suggestions.");
    return recs;
  }, [identity, lovedMeals, rhythm]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const hasData = planDays.length > 0;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
            Your Family Food Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Built from your dinners, check-ins, and weekly plans.
          </p>
        </div>

        {!hasData ? (
          <Card className="py-16 text-center">
            <CardContent>
              <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-serif font-semibold mb-2">Your profile is growing</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Generate a few meal plans and check in after dinners. We'll build your family's food story here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

            {/* Section 1 — Family Food Identity */}
            {identity && (
              <motion.div variants={item}>
                <h2 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" /> Family Food Identity
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <IdentityCard
                    icon={ChefHat}
                    label="Cook nights per week"
                    value={String(identity.avgCookPerWeek)}
                  />
                  <IdentityCard
                    icon={Flame}
                    label="Favorite cuisine"
                    value={identity.favCuisine || "Exploring..."}
                  />
                  <IdentityCard
                    icon={Timer}
                    label="Typical dinner prep"
                    value={identity.avgPrep ? `${identity.avgPrep} min` : "—"}
                  />
                  <IdentityCard
                    icon={Calendar}
                    label="Most common cook day"
                    value={identity.mostCookedDay || "—"}
                  />
                </div>
              </motion.div>
            )}

            {/* Section 2 — Most Loved Meals */}
            {lovedMeals.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" /> Most Loved Meals
                </h2>
                <div className="space-y-2">
                  {lovedMeals.map((meal) => (
                    <Card key={meal.name}>
                      <CardContent className="py-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <Heart className="w-4 h-4 text-destructive shrink-0" />
                          <span className="font-medium text-sm text-foreground truncate">
                            {meal.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {meal.count}× loved
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Section 3 — Kids Preference Insights */}
            {kidsInsights.length > 0 && (
              <motion.div variants={item}>
                <h2 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Baby className="w-4 h-4 text-accent" /> Kids Preference Insights
                </h2>
                <Card>
                  <CardContent className="py-4 px-5 space-y-3">
                    {kidsInsights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                        <p className="text-sm text-foreground">{insight}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Section 4 — Weekly Rhythm */}
            {rhythm && (
              <motion.div variants={item}>
                <h2 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Weekly Rhythm
                </h2>
                <div className="space-y-2">
                  {rhythm.takeoutDay && (
                    <RhythmBar
                      icon={Truck}
                      label={`Takeout usually happens on ${rhythm.takeoutDay}`}
                    />
                  )}
                  <RhythmBar
                    icon={ChefHat}
                    label={`Cook nights average ${rhythm.avgCook} per week`}
                  />
                  {rhythm.avgPrep && (
                    <RhythmBar
                      icon={Clock}
                      label={`Dinner prep works best under ${rhythm.avgPrep} minutes`}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* Section 5 — Family Time Saved */}
            <motion.div variants={item}>
              <h2 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Family Time Saved
              </h2>
              <Card className="bg-muted/50">
                <CardContent className="py-6 px-5 text-center">
                  <p className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                    {timeSaved.hours} hours
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    saved planning meals
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>≈ {timeSaved.movieNights} movie nights</span>
                    <span className="text-border">|</span>
                    <span>≈ {(timeSaved.minutesSaved / 480).toFixed(1)} work days</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section 6 — Smart Recommendations */}
            <motion.div variants={item}>
              <h2 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent" /> Smart Recommendations
              </h2>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <Card key={i}>
                    <CardContent className="py-3 px-4 flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{rec}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Footer note */}
            <motion.p variants={item} className="text-xs text-muted-foreground text-center pt-4 pb-8">
              Based on {planCount} weekly plan{planCount !== 1 ? "s" : ""}, {feedback.length} check-in{feedback.length !== 1 ? "s" : ""}, and {checkins.length} evening log{checkins.length !== 1 ? "s" : ""}.
            </motion.p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

// --- Sub-components ---

const IdentityCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <Card>
    <CardContent className="py-4 px-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground truncate">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const RhythmBar = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <Card>
    <CardContent className="py-3 px-4 flex items-center gap-3">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <p className="text-sm text-foreground">{label}</p>
    </CardContent>
  </Card>
);

export default FamilyProfile;
