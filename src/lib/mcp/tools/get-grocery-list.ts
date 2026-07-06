import { defineTool } from "@lovable.dev/mcp-js";
import { getUserHousehold, supabaseForUser } from "./_shared";

export default defineTool({
  name: "get_grocery_list",
  title: "Get grocery list",
  description:
    "Get the grocery list for the signed-in user's most recent weekly plan, grouped by category, with checked state and quantities.",
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
      .select("id, week_start")
      .eq("household_id", household.id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (planError) throw new Error(planError.message);
    if (!plan) {
      return { content: [{ type: "text", text: "No weekly plans found yet." }] };
    }

    const { data: items, error: itemsError } = await supabase
      .from("grocery_items")
      .select("item_name, quantity, category, is_checked, is_staple, source")
      .eq("plan_id", plan.id)
      .order("category", { ascending: true });
    if (itemsError) throw new Error(itemsError.message);

    const result = {
      week_start: plan.week_start,
      total_items: items?.length ?? 0,
      items: (items ?? []).map((i) => ({
        name: i.item_name,
        quantity: i.quantity,
        category: i.category,
        checked: i.is_checked ?? false,
        staple: i.is_staple ?? false,
        source: i.source,
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
