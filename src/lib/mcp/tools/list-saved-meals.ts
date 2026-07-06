import { defineTool } from "@lovable.dev/mcp-js";
import { getUserHousehold, supabaseForUser } from "./_shared";

export default defineTool({
  name: "list_saved_meals",
  title: "List saved meals",
  description:
    "List the meals the signed-in user's household has saved to their custom library, with frequency and whether they are included in planning.",
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
    const { data: meals, error } = await supabase
      .from("saved_meals")
      .select("meal_name, meal_description, frequency, include_in_plan")
      .eq("household_id", household.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const result = {
      total: meals?.length ?? 0,
      meals: (meals ?? []).map((m) => ({
        name: m.meal_name,
        description: m.meal_description,
        frequency: m.frequency,
        include_in_plan: m.include_in_plan,
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
