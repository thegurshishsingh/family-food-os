import { defineTool } from "@lovable.dev/mcp-js";
import { getUserHousehold, supabaseForUser, dayName } from "./_shared";

export default defineTool({
  name: "get_current_plan",
  title: "Get current dinner plan",
  description:
    "Get the signed-in user's most recent weekly dinner plan, including each day's meal name, description, mode, prep time, and per-serving nutrition.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const household = await getUserHousehold(ctx);
    if (!household) {
      return { content: [{ type: "text", text: "No household found for this account yet." }] };
    }

    const supabase = supabaseForUser(ctx);
    const { data: plan, error: planError } = await supabase
      .from("weekly_plans")
      .select("id, week_start, reality_score, reality_message")
      .eq("household_id", household.id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (planError) throw new Error(planError.message);
    if (!plan) {
      return { content: [{ type: "text", text: "No weekly plans found yet." }] };
    }

    const { data: days, error: daysError } = await supabase
      .from("plan_days")
      .select(
        "day_of_week, meal_mode, meal_name, meal_description, cuisine_type, prep_time_minutes, calories, protein_g, carbs_g, fat_g, fiber_g",
      )
      .eq("plan_id", plan.id)
      .order("day_of_week", { ascending: true });
    if (daysError) throw new Error(daysError.message);

    const result = {
      week_start: plan.week_start,
      reality_score: plan.reality_score,
      reality_message: plan.reality_message,
      days: (days ?? []).map((d) => ({
        day: dayName(d.day_of_week),
        mode: d.meal_mode,
        meal: d.meal_name,
        description: d.meal_description,
        cuisine: d.cuisine_type,
        prep_time_minutes: d.prep_time_minutes,
        nutrition_per_serving: {
          calories: d.calories,
          protein_g: d.protein_g,
          carbs_g: d.carbs_g,
          fat_g: d.fat_g,
          fiber_g: d.fiber_g,
        },
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
