import { defineTool } from "@lovable.dev/mcp-js";
import { getUserHousehold } from "./_shared";

export default defineTool({
  name: "get_household",
  title: "Get household",
  description:
    "Get the signed-in user's household profile: name, number of adults, number of children, and child age bands.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const household = await getUserHousehold(ctx);
    if (!household) {
      return {
        content: [{ type: "text", text: "No household found for this account yet." }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(household) }],
      structuredContent: { household },
    };
  },
});
