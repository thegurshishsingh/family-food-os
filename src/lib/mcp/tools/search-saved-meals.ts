import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getUserHousehold, supabaseForUser } from "./_shared";

// The saved_meals table only stores name/description/frequency — so meal type
// and protein tags are derived heuristically from the text. This keeps the tool
// useful for assistants that want to filter or summarize without requiring a
// schema change.
const PROTEIN_TAGS: Array<{ tag: string; patterns: RegExp }> = [
  { tag: "chicken", patterns: /\b(chicken|poultry|rotisserie)\b/i },
  { tag: "beef", patterns: /\b(beef|steak|burger|meatball|meatloaf|brisket)\b/i },
  { tag: "pork", patterns: /\b(pork|bacon|ham|sausage|chorizo|prosciutto)\b/i },
  { tag: "turkey", patterns: /\b(turkey)\b/i },
  { tag: "lamb", patterns: /\b(lamb)\b/i },
  { tag: "fish", patterns: /\b(salmon|tuna|cod|tilapia|halibut|trout|fish|snapper|mahi)\b/i },
  { tag: "seafood", patterns: /\b(shrimp|prawn|scallop|crab|lobster|clam|mussel|calamari|squid)\b/i },
  { tag: "tofu", patterns: /\b(tofu|tempeh|seitan|edamame)\b/i },
  { tag: "beans", patterns: /\b(bean|lentil|chickpea|garbanzo|dal|dahl)\b/i },
  { tag: "eggs", patterns: /\b(egg|frittata|omelet|omelette|quiche|shakshuka)\b/i },
  { tag: "cheese", patterns: /\b(cheese|paneer|halloumi|ricotta|mozzarella|parmesan)\b/i },
];

const TYPE_TAGS: Array<{ tag: string; patterns: RegExp }> = [
  { tag: "pasta", patterns: /\b(pasta|spaghetti|linguine|penne|rigatoni|rotini|fettuccine|lasagna|ravioli|gnocchi|mac and cheese|carbonara|bolognese|alfredo)\b/i },
  { tag: "pizza", patterns: /\b(pizza|flatbread|calzone)\b/i },
  { tag: "taco", patterns: /\b(taco|burrito|quesadilla|enchilada|fajita|tostada|nachos)\b/i },
  { tag: "stir-fry", patterns: /\b(stir[- ]fry|stirfry|wok)\b/i },
  { tag: "curry", patterns: /\b(curry|masala|tikka|korma|vindaloo|thai red|thai green)\b/i },
  { tag: "soup", patterns: /\b(soup|stew|chili|chowder|bisque|ramen|pho|minestrone)\b/i },
  { tag: "salad", patterns: /\b(salad|bowl|grain bowl|buddha bowl|poke)\b/i },
  { tag: "sandwich", patterns: /\b(sandwich|sub|hoagie|wrap|panini|melt|gyro)\b/i },
  { tag: "rice", patterns: /\b(rice|risotto|paella|biryani|pilaf|jambalaya|fried rice)\b/i },
  { tag: "grill", patterns: /\b(grill|grilled|bbq|barbecue|kebab|kabob|skewer)\b/i },
  { tag: "roast", patterns: /\b(roast|roasted|baked|sheet[- ]pan|casserole|bake)\b/i },
  { tag: "breakfast-for-dinner", patterns: /\b(pancake|waffle|french toast|breakfast)\b/i },
];

function deriveTags(text: string): { type_tags: string[]; protein_tags: string[] } {
  return {
    type_tags: TYPE_TAGS.filter((t) => t.patterns.test(text)).map((t) => t.tag),
    protein_tags: PROTEIN_TAGS.filter((t) => t.patterns.test(text)).map((t) => t.tag),
  };
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
}

// Score a meal against tokenized query terms.
// Name matches beat description matches; exact word beats substring; every
// additional matched token adds to the score.
function scoreMeal(name: string, description: string | null, tokens: string[]): number {
  const n = (name ?? "").toLowerCase();
  const d = (description ?? "").toLowerCase();
  let score = 0;
  for (const t of tokens) {
    const wordRe = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (wordRe.test(n)) score += 10;
    else if (n.includes(t)) score += 6;
    if (wordRe.test(d)) score += 3;
    else if (d.includes(t)) score += 1;
  }
  // Small bonus if the full query appears as a phrase in the name.
  const phrase = tokens.join(" ");
  if (phrase && n.includes(phrase)) score += 5;
  return score;
}

export default defineTool({
  name: "search_saved_meals",
  title: "Search saved meals",
  description:
    "Search the signed-in user's saved meal library by name or description keywords. Results are ranked by relevance (name matches beat description matches) and annotated with derived tags for meal type (pasta, taco, curry, ...) and protein (chicken, salmon, tofu, ...) so an assistant can quickly filter or propose one to add to the weekly plan.",
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
      .describe("Maximum number of matches to return, after relevance ranking. Defaults to 10."),
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
    const tokens = tokenize(query);
    if (tokens.length === 0) {
      return { content: [{ type: "text", text: "Query has no searchable terms." }], isError: true };
    }

    // Build an OR filter that matches ANY token in name or description. We
    // fetch a wider candidate set (max * 4, capped at 100) and then re-rank in
    // memory so the top results reflect multi-token relevance, not just the
    // order Postgres happened to return.
    const supabase = supabaseForUser(ctx);
    const orFilter = tokens
      .flatMap((t) => {
        const p = `%${t.replace(/[,%()*]/g, " ")}%`;
        return [`meal_name.ilike.${p}`, `meal_description.ilike.${p}`];
      })
      .join(",");

    const { data: meals, error } = await supabase
      .from("saved_meals")
      .select("id, meal_name, meal_description, frequency, include_in_plan, created_at")
      .eq("household_id", household.id)
      .or(orFilter)
      .limit(Math.min(max * 4, 100));
    if (error) throw new Error(error.message);

    const ranked = (meals ?? [])
      .map((m) => {
        const score = scoreMeal(m.meal_name ?? "", m.meal_description ?? null, tokens);
        const tags = deriveTags(`${m.meal_name ?? ""} ${m.meal_description ?? ""}`);
        return { m, score, tags };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Tiebreak: newer meals first.
        const at = a.m.created_at ? Date.parse(a.m.created_at as string) : 0;
        const bt = b.m.created_at ? Date.parse(b.m.created_at as string) : 0;
        return bt - at;
      })
      .slice(0, max);

    const result = {
      query,
      total: ranked.length,
      meals: ranked.map(({ m, score, tags }) => ({
        id: m.id,
        name: m.meal_name,
        description: m.meal_description,
        frequency: m.frequency,
        include_in_plan: m.include_in_plan,
        relevance: score,
        type_tags: tags.type_tags,
        protein_tags: tags.protein_tags,
      })),
      hint:
        ranked.length === 0
          ? "No saved meals matched. Try a shorter or different keyword."
          : "Results are ordered by relevance. To add one to the plan, tell the user which day to swap it onto — swapping runs in the app.",
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
