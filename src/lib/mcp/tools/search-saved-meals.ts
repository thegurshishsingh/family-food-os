import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getUserHousehold, supabaseForUser } from "./_shared";

export default defineTool({
  name: "search_saved_meals",
  title: "Search saved meals",
  description:
    "Search the signed-in user's saved meal library by name or description keywords. Returns matching meals with frequency and whether they're included in planning, so an assistant can quickly propose one to add to the weekly plan.",
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
    // Strip PostgREST-significant characters from the user query before ilike.
    const safe = query.replace(/[,%()*]/g, " ").trim();
    if (!safe) {
      return { content: [{ type: "text", text: "Query is empty after sanitization." }], isError: true };
    }
    const pattern = `%${safe}%`;

    const supabase = supabaseForUser(ctx);
    const { data: meals, error } = await supabase
      .from("saved_meals")
      .select("id, meal_name, meal_description, frequency, include_in_plan, created_at")
      .eq("household_id", household.id)
      .or(`meal_name.ilike.${pattern},meal_description.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(max);
    if (error) throw new Error(error.message);

    const rows = meals ?? [];
    const result = {
      query,
      total: rows.length,
      meals: rows.map((m) => ({
        id: m.id,
        name: m.meal_name,
        description: m.meal_description,
        frequency: m.frequency,
        include_in_plan: m.include_in_plan,
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
