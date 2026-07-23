import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getUserHousehold, supabaseForUser } from "./_shared";

export default defineTool({
  name: "search_saved_meals",
  title: "Search saved meals",
  description:
    "Search the signed-in user's saved meal library by name or description keywords. Returns matching meals with frequency, planning inclusion, and any stored recipe details (ingredients, steps, prep time, cuisine, nutrition per serving) so an assistant can quickly propose one to add to the weekly plan.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .min(1)
      .describe("Keywords to search for in the meal name or description (case-insensitive)."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(25)
      .optional()
      .describe("Maximum number of matches to return. Defaults to 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const household = await getUserHousehold(ctx);
    if (!household) {
      return { content: [{ type: "text", text: "No household found for this account yet." }] };
    }

    const max = limit ?? 10;
    // Escape PostgREST ilike wildcards/commas in the user query.
    const safe = query.replace(/[,%()]/g, " ").trim();
    const pattern = `%${safe}%`;

    const supabase = supabaseForUser(ctx);
    const { data: meals, error } = await supabase
      .from("saved_meals")
      .select("*")
      .eq("household_id", household.id)
      .or(`meal_name.ilike.${pattern},meal_description.ilike.${pattern}`)
      .limit(max);
    if (error) throw new Error(error.message);

    const rows = meals ?? [];
    const result = {
      query,
      total: rows.length,
      meals: rows.map((m: Record<string, unknown>) => ({
        id: m.id,
        name: m.meal_name,
        description: m.meal_description,
        frequency: m.frequency,
        include_in_plan: m.include_in_plan,
        cuisine: m.cuisine_type ?? null,
        prep_time_minutes: m.prep_time_minutes ?? null,
        ingredients: m.ingredients ?? null,
        steps: m.steps ?? null,
        nutrition_per_serving:
          m.calories != null || m.protein_g != null
            ? {
                calories: m.calories ?? null,
                protein_g: m.protein_g ?? null,
                carbs_g: m.carbs_g ?? null,
                fat_g: m.fat_g ?? null,
                fiber_g: m.fiber_g ?? null,
              }
            : null,
      })),
      hint:
        rows.length === 0
          ? "No saved meals matched. Try a shorter or different keyword."
          : "To add one of these to the plan, tell the user which day to swap it onto — swapping runs in the app.",
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
