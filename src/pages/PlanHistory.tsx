import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHousehold } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import { formatCalories } from "@/lib/nutritionFormat";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChefHat,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flame,
  Truck,
  CheckCircle2,
  Heart,
  Baby,
  RefreshCw,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DAYS, MODE_CONFIG, type PlanDay, type WeeklyPlan } from "@/components/planner/types";
import TrendCharts from "@/components/planner/TrendCharts";

type HistoryWeek = WeeklyPlan & {
  days: PlanDay[];
  checkinCount: number;
};

type FeedbackEntry = {
  id: string;
  meal_name: string;
  feedback: string;
  notes: string | null;
  created_at: string;
};

const FEEDBACK_CONFIG: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  loved: { label: "Loved It", icon: Heart, color: "text-destructive" },
  okay: { label: "Okay", icon: Star, color: "text-muted-foreground" },
  kids_refused: { label: "Kids Refused", icon: Baby, color: "text-accent" },
  too_hard: { label: "Too Much Work", icon: ChefHat, color: "text-muted-foreground" },
  good_leftovers: { label: "Good Leftovers", icon: RefreshCw, color: "text-primary" },
  reorder_worthy: { label: "Reorder-worthy", icon: Star, color: "text-accent" },
};

const FeedbackCard = ({ entry }: { entry: FeedbackEntry }) => {
  const config = FEEDBACK_CONFIG[entry.feedback] || FEEDBACK_CONFIG.okay;
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="py-3 px-4 flex items-center gap-3">
        <Icon className={`w-5 h-5 shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{entry.meal_name}</p>
          {entry.notes && <p className="text-xs text-muted-foreground mt-0.5">{entry.notes}</p>}
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">{config.label}</Badge>
      </CardContent>
    </Card>
  );
};

const PlanHistory = () => {
  const { household, preferences, loading: hhLoading } = useHousehold();
  const [weeks, setWeeks] = useState<HistoryWeek[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  useEffect(() => {
    if (hhLoading || !household) return;
    loadHistory();
  }, [household, hhLoading]);

  const loadHistory = async () => {
    if (!household) return;
    const [plansResult, feedbackResult] = await Promise.all([
      supabase
        .from("weekly_plans")
        .select("*")
        .eq("household_id", household.id)
        .order("week_start", { ascending: false })
        .limit(20),
      supabase
        .from("meal_feedback")
        .select("*")
        .eq("household_id", household.id)
        .order("created_at", { ascending: false }),
    ]);

    const plans = plansResult.data;
    if (feedbackResult.data) setFeedback(feedbackResult.data as FeedbackEntry[]);

    if (plans && plans.length > 0) {
      const planIds = plans.map((p: any) => p.id);
      const [daysResult, checkinsResult] = await Promise.all([
        supabase
          .from("plan_days")
          .select("*")
          .in("plan_id", planIds)
          .order("day_of_week"),
        supabase
          .from("evening_checkins")
          .select("plan_day_id")
          .eq("household_id", household.id),
      ]);

      const allDays = daysResult.data || [];
      const checkinDayIds = new Set((checkinsResult.data || []).map((c: any) => c.plan_day_id));

      const history: HistoryWeek[] = plans.map((p: any) => {
        const weekDays = allDays.filter((d: any) => d.plan_id === p.id) as unknown as PlanDay[];
        const checkinCount = weekDays.filter((d) => checkinDayIds.has(d.id)).length;
        return { ...p, days: weekDays, checkinCount };
      });
      setWeeks(history);
      if (history.length > 0) setExpandedWeek(history[0].id);
    }
    setLoading(false);
  };

  const toggleWeek = (id: string) => {
    setExpandedWeek((prev) => (prev === id ? null : id));
  };

  const byType = (type: string) => feedback.filter((f) => f.feedback === type);

  if (loading || hhLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-2">History</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Browse your past weekly plans and revisit what your family loved or skipped.
        </p>

        <Tabs defaultValue="plans">
          <TabsList className="mb-6">
            <TabsTrigger value="plans">Plan History</TabsTrigger>
            <TabsTrigger value="memory">Meal Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            {weeks.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent>
                  <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-serif font-semibold mb-2">No history yet</h2>
                  <p className="text-muted-foreground">Generate your first weekly plan to start building history.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <TrendCharts weeks={weeks} weeklyBudget={preferences?.weekly_grocery_budget ? Number(preferences.weekly_grocery_budget) : null} />
                <div className="space-y-4">
                {weeks.map((week) => {
                  const isExpanded = expandedWeek === week.id;
                  const totalCals = week.days.reduce((s, d) => s + (d.calories || 0), 0);
                  const cookCount = week.days.filter((d) => d.meal_mode === "cook").length;
                  const takeoutCount = week.days.filter((d) => d.meal_mode === "takeout" || d.meal_mode === "dine_out").length;
                  const weekLabel = new Date(week.week_start + "T00:00:00").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <Card key={week.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleWeek(week.id)}
                        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div>
                            <p className="font-serif font-semibold text-foreground">Week of {weekLabel}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {week.reality_score !== null && (
                                <Badge
                                  variant={(week.reality_score || 0) < 60 ? "destructive" : "secondary"}
                                  className="text-xs gap-1"
                                >
                                  {(week.reality_score || 0) < 60 ? (
                                    <AlertTriangle className="w-3 h-3" />
                                  ) : (
                                    <TrendingUp className="w-3 h-3" />
                                  )}
                                  {week.reality_score}/100
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Flame className="w-3 h-3" /> {formatCalories(totalCals) ?? "0 cal"}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ChefHat className="w-3 h-3" /> {cookCount} cook
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Truck className="w-3 h-3" /> {takeoutCount} out
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {week.checkinCount}/7 logged
                              </span>
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border">
                              {week.reality_message && (
                                <p className="text-sm text-muted-foreground px-5 py-3 bg-muted/30 border-b border-border italic">
                                  {week.reality_message}
                                </p>
                              )}
                              <div className="divide-y divide-border">
                                {week.days.map((day) => {
                                  const mode = MODE_CONFIG[day.meal_mode];
                                  const Icon = mode.icon;
                                  return (
                                    <div key={day.id} className="flex items-center gap-4 px-5 py-3">
                                      <div className="w-24 shrink-0">
                                        <p className="text-sm font-medium text-foreground">{DAYS[day.day_of_week]}</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-0.5 ${mode.color}`}>
                                          <Icon className="w-2.5 h-2.5" />
                                          {mode.label}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground truncate">{day.meal_name || "No meal"}</p>
                                        {day.meal_description && (
                                          <p className="text-xs text-muted-foreground truncate">{day.meal_description}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {formatCalories(day.calories) && (
                                          <Badge variant="secondary" className="text-[10px]">{formatCalories(day.calories)}</Badge>
                                        )}
                                        {day.cuisine_type && (
                                          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{day.cuisine_type}</Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="memory">
            {feedback.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent>
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-serif font-semibold mb-2">No feedback yet</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    After meals, mark how they went. Over time, your plan gets smarter.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="loved">
                <TabsList className="mb-6">
                  <TabsTrigger value="loved">❤️ Loved</TabsTrigger>
                  <TabsTrigger value="kids_refused">👶 Kids Refused</TabsTrigger>
                  <TabsTrigger value="good_leftovers">♻️ Good Leftovers</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                {["loved", "kids_refused", "good_leftovers"].map((type) => (
                  <TabsContent key={type} value={type}>
                    <div className="space-y-2">
                      {byType(type).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">No entries yet.</p>
                      ) : (
                        byType(type).map((f) => <FeedbackCard key={f.id} entry={f} />)
                      )}
                    </div>
                  </TabsContent>
                ))}

                <TabsContent value="all">
                  <div className="space-y-2">
                    {feedback.map((f) => <FeedbackCard key={f.id} entry={f} />)}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PlanHistory;
