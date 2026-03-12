import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { identity, lovedMeals, kidsInsights, rhythm, planCount, preferences, household } = await req.json();

    const month = new Date().toLocaleString("en-US", { month: "long" });
    const isNewUser = !planCount || planCount === 0;

    let prompt: string;

    if (isNewUser && preferences) {
      // New user flow — based on preferences + household info only
      prompt = `You are a warm, knowledgeable family meal planning assistant. A new family just joined and hasn't created any meal plans yet. Based on their preferences, generate 3-5 personalized, encouraging meal suggestions to get them started.

**Family Info:**
- Adults: ${household?.numAdults ?? "unknown"}
- Children: ${household?.numChildren ?? 0}
- Child age bands: ${household?.childAgeBands?.join(", ") || "none"}
- Cuisines they like: ${preferences.cuisinesLiked?.join(", ") || "not specified"}
- Cuisines they dislike: ${preferences.cuisinesDisliked?.join(", ") || "none"}
- Dietary preferences: ${preferences.dietaryPreferences?.join(", ") || "none"}
- Allergies: ${preferences.allergies?.join(", ") || "none"}
- Cooking time tolerance: ${preferences.cookingTimeTolerance || "not specified"}
- Health goal: ${preferences.healthGoal || "none"}
- Foods to avoid: ${preferences.foodsToAvoid?.join(", ") || "none"}
- Current month: ${month}

**Guidelines:**
- Suggest easy, approachable meals perfect for a first week
- Include one seasonal suggestion for ${month}
- If they have children, factor in kid-friendly options
- Respect their dietary preferences and allergies
- Keep suggestions concise (1-2 sentences each)
- Use a warm, encouraging "welcome" tone
- Start each suggestion with a relevant emoji
- Focus on building confidence — these are their first meals with the app`;
    } else {
      // Returning user flow — based on behavioral data
      prompt = `You are a warm, knowledgeable family meal planning assistant. Based on the following household food data, generate 3-5 personalized, actionable meal recommendations. Each recommendation should feel like a helpful friend's suggestion — not algorithmic output.

**Household Data:**
- Plans generated: ${planCount || 0}
- Cook nights per week: ${identity?.avgCookPerWeek ?? "unknown"}
- Favorite cuisine: ${identity?.favCuisine ?? "unknown"}
- Average prep time: ${identity?.avgPrep ? identity.avgPrep + " minutes" : "unknown"}
- Most common cook day: ${identity?.mostCookedDay ?? "unknown"}
- Most loved meals: ${lovedMeals?.map((m: any) => `${m.name} (loved ${m.count}×)`).join(", ") || "none yet"}
- Kids insights: ${kidsInsights?.join("; ") || "none yet"}
- Takeout day: ${rhythm?.takeoutDay ?? "no pattern"}
- Average cook nights: ${rhythm?.avgCook ?? "unknown"}
- Current month: ${month}

**Guidelines:**
- Include one seasonal suggestion for ${month}
- If the family has loved meals, suggest variations or complementary dishes
- If kids have preferences, factor those in
- Keep suggestions concise (1-2 sentences each)
- Use a warm, encouraging tone
- Start each suggestion with a relevant emoji
- Do NOT repeat data back — give forward-looking advice`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a family meal planning expert. Return only the recommendations as a JSON array of strings. No markdown, no code blocks, just a raw JSON array." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    let recommendations: string[];
    try {
      const cleaned = content.replace(/```(?:json)?\n?/g, "").trim();
      recommendations = JSON.parse(cleaned);
    } catch {
      recommendations = content
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.startsWith("[") && !line.startsWith("]"));
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-recommendations error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
