import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { household_id, setup } = await req.json();
    if (!household_id) throw new Error("household_id required");

    const { data: household } = await supabaseClient
      .from("households")
      .select("*")
      .eq("id", household_id)
      .eq("owner_id", user.id)
      .single();
    if (!household) throw new Error("Household not found");

    const { data: preferences } = await supabaseClient
      .from("household_preferences")
      .select("*")
      .eq("household_id", household_id)
      .single();

    // Determine week_start based on partial vs full week
    const isPartialWeek = setup?.partial_week?.startDay !== undefined;
    const monday = isPartialWeek ? getCurrentMonday() : getNextMonday();

    const { data: context } = await supabaseClient
      .from("weekly_contexts")
      .select("*")
      .eq("household_id", household_id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: feedback } = await supabaseClient
      .from("meal_feedback")
      .select("meal_name, feedback")
      .eq("household_id", household_id)
      .order("created_at", { ascending: false })
      .limit(50);

    const lovedMeals = feedback?.filter(f => f.feedback === "loved").map(f => f.meal_name) || [];
    const dislikedMeals = feedback?.filter(f => ["kids_refused", "too_hard"].includes(f.feedback)).map(f => f.meal_name) || [];

    const { data: savedMeals } = await supabaseClient
      .from("saved_meals")
      .select("meal_name, meal_description, include_in_plan, frequency")
      .eq("household_id", household_id)
      .limit(50);

    const { data: checkins } = await supabaseClient
      .from("evening_checkins")
      .select("tags, effort_level, plan_day_id, created_at")
      .eq("household_id", household_id)
      .order("created_at", { ascending: false })
      .limit(28);

    let checkinInsights: { tags: string[]; effort_level: string | null; day_of_week: number }[] = [];
    if (checkins?.length) {
      const planDayIds = checkins.map((c: any) => c.plan_day_id);
      const { data: checkinDays } = await supabaseClient
        .from("plan_days")
        .select("id, day_of_week, meal_name")
        .in("id", planDayIds);

      const dayMap = new Map((checkinDays || []).map((d: any) => [d.id, d]));
      checkinInsights = checkins.map((c: any) => ({
        tags: c.tags || [],
        effort_level: c.effort_level,
        day_of_week: dayMap.get(c.plan_day_id)?.day_of_week ?? -1,
      })).filter(c => c.day_of_week >= 0);
    }

    const prompt = buildPrompt(household, preferences, context, lovedMeals, dislikedMeals, savedMeals || [], checkinInsights, setup);

    // Determine which days to generate
    const daysToGenerate = isPartialWeek
      ? Array.from({ length: setup.partial_week.dayCount }, (_, i) => setup.partial_week.startDay + i)
      : [0, 1, 2, 3, 4, 5, 6];

    let planData;

    if (lovableApiKey) {
      const dayCountLabel = isPartialWeek ? `${daysToGenerate.length}-day` : "7-day";
      const systemPrompt = `You are a world-class chef, nutritionist, and family meal strategist.

Your job is to create weekly dinner plans that are realistic, repeatable, and tailored for busy families. Every plan should reduce decision fatigue, save time, and feel like something a real household would actually cook.

CORE PRINCIPLES:

1. REAL-LIFE COOKING FIRST
   Meals must be practical for weeknights. Avoid overly complex or restaurant-style recipes. Prioritize simple techniques, minimal prep, and accessible ingredients.

2. TIME-AWARE PLANNING
   Weeknight meals (Mon-Thu) should require 15–30 minutes of prep. Reserve slightly more involved meals for weekends (Fri-Sun). Never front-load effort at the start of the week.

3. PROTEIN ROTATION
   Rotate between chicken, beef, seafood, vegetarian, pork, and other proteins. NEVER repeat the same protein on consecutive days. No protein should appear more than twice per week.

4. KID-FRIENDLY BALANCE
   If children are present, at least 60% of meals must appeal to both adults and children. Avoid extreme spice or niche ingredients unless explicitly requested. Include familiar formats kids love (tacos, bowls, wraps, pasta).

5. SMART INGREDIENT REUSE
   Deliberately reuse ingredients across multiple meals to reduce grocery complexity and waste. Example: buy cilantro once, use in tacos Tuesday, stir-fry Thursday, garnish Saturday.

6. ENERGY-BASED PLANNING
   Balance effort across the week:
   - Monday: Easy re-entry meal (simple, comforting)
   - Mid-week: Mix of moderate and easy meals
   - Friday: Fun/celebratory or takeout
   - Weekend: One more involved "project meal" is OK, one easy night
   Include leftovers and takeout strategically — they are tools, not failures.

7. FLAVOR VARIETY
   Mix cuisines across the week (Mediterranean, Mexican, Asian, American, Indian, etc.). Never cluster the same cuisine on consecutive days. Vary cooking methods (roast, sauté, grill, simmer, bake, stir-fry).

OPTIMIZATION PRIORITIES (in order):
1. Reducing effort and decision fatigue
2. Minimizing grocery complexity (fewer unique ingredients across the week)
3. Increasing likelihood the family actually cooks the meal
4. Nutritional balance

NEVER optimize for novelty or creativity at the cost of practicality.

BEHAVIORAL LEARNING: Use ALL check-in data, feedback history, and implicit signals (effort perception, day-of-week patterns, takeout frequency, kid refusal rates) to make each plan smarter than the last.

Every meal must be a REAL, specific recipe with a proper name. Recipes must be detailed enough for a beginner cook to follow.

Return ONLY valid JSON, no markdown.`;
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "create_weekly_plan",
              description: `Create a ${dayCountLabel} family meal plan`,
              parameters: {
                type: "object",
                properties: {
                  reality_score: { type: "number", description: "0-100 how realistic the plan is" },
                  reality_message: { type: "string", description: "Brief message about the plan's feasibility" },
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day_of_week: { type: "number", description: "0=Monday through 6=Sunday" },
                        meal_mode: { type: "string", enum: ["cook", "leftovers", "takeout", "dine_out", "emergency"] },
                        meal_name: { type: "string" },
                        meal_description: { type: "string" },
                        cuisine_type: { type: "string" },
                        prep_time_minutes: { type: "number" },
                        calories: { type: "number" },
                        protein_g: { type: "number" },
                        carbs_g: { type: "number" },
                        fat_g: { type: "number" },
                        fiber_g: { type: "number" },
                        notes: { type: "string" },
                        takeout_budget: { type: "number" },
                        ingredients: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              quantity: { type: "string" },
                              unit: { type: "string" },
                            },
                            required: ["name", "quantity"],
                          },
                        },
                        instructions: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: ["day_of_week", "meal_mode", "meal_name", "meal_description", "calories", "protein_g", "carbs_g", "fat_g", "ingredients", "instructions"],
                    },
                  },
                  grocery_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["produce", "protein", "dairy", "pantry", "frozen", "snacks", "household"] },
                        item_name: { type: "string" },
                        quantity: { type: "string" },
                      },
                      required: ["category", "item_name", "quantity"],
                    },
                  },
                },
                required: ["reality_score", "reality_message", "days", "grocery_items"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "create_weekly_plan" } },
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const aiResult = await aiResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool call returned from AI");

      planData = JSON.parse(toolCall.function.arguments);
    } else {
      planData = generateMockPlan(household, preferences, context, setup, daysToGenerate);
    }

    // Save plan to database
    await supabaseClient
      .from("weekly_plans")
      .delete()
      .eq("household_id", household_id)
      .eq("week_start", monday);

    const { data: newPlan, error: planError } = await supabaseClient
      .from("weekly_plans")
      .insert({
        household_id,
        context_id: context?.id || null,
        week_start: monday,
        reality_score: planData.reality_score,
        reality_message: planData.reality_message,
      })
      .select()
      .single();
    if (planError) throw planError;

    const dayInserts = planData.days.map((d: any) => ({
      plan_id: newPlan.id,
      day_of_week: d.day_of_week,
      meal_mode: d.meal_mode,
      meal_name: d.meal_name,
      meal_description: d.meal_description,
      cuisine_type: d.cuisine_type || null,
      prep_time_minutes: d.prep_time_minutes || null,
      calories: d.calories,
      protein_g: d.protein_g,
      carbs_g: d.carbs_g,
      fat_g: d.fat_g,
      fiber_g: d.fiber_g || null,
      notes: d.notes || null,
      takeout_budget: d.takeout_budget || null,
      ingredients: d.ingredients || null,
      instructions: d.instructions || null,
    }));
    await supabaseClient.from("plan_days").insert(dayInserts);

    if (planData.grocery_items?.length) {
      const groceryInserts = planData.grocery_items.map((g: any) => ({
        plan_id: newPlan.id,
        category: g.category,
        item_name: g.item_name,
        quantity: g.quantity,
      }));
      await supabaseClient.from("grocery_items").insert(groceryInserts);
    }

    return new Response(JSON.stringify({ success: true, plan_id: newPlan.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getCurrentMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function getNextMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function buildPrompt(
  household: any, prefs: any, context: any,
  lovedMeals: string[], dislikedMeals: string[],
  savedMeals: { meal_name: string; meal_description: string | null }[],
  checkinInsights: { tags: string[]; effort_level: string | null; day_of_week: number }[],
  setup?: { takeout_days?: number[]; dine_out_days?: number[]; leftover_days?: number[]; special_meals?: string[]; week_intensity?: string; locked_saved_meals?: string[]; saved_meal_day_assignments?: Record<string, number>; week_context_tags?: string[]; partial_week?: { startDay: number; dayCount: number } },
) {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const isPartial = setup?.partial_week;
  const planDayCount = isPartial ? isPartial.dayCount : 7;
  const planDayIndices = isPartial
    ? Array.from({ length: isPartial.dayCount }, (_, i) => isPartial.startDay + i)
    : [0, 1, 2, 3, 4, 5, 6];
  const planDayNames = planDayIndices.map(i => dayNames[i]);

  const parts = [];

  // ── Core request ──
  if (isPartial) {
    parts.push(`Create a ${planDayCount}-day dinner meal plan for a family of ${household.num_adults} adults and ${household.num_children} children.`);
    parts.push(`IMPORTANT: This is a SHORT PARTIAL-WEEK plan. Only generate meals for these ${planDayCount} days: ${planDayNames.join(", ")} (day_of_week values: ${planDayIndices.join(", ")}).`);
    parts.push(`SHORT-WEEK GUIDELINES: Prioritize quick, easy meals. Keep prep times under 20 minutes where possible. Favor simple, one-pan/one-pot recipes. The goal is low commitment and immediate usefulness.`);
  } else {
    parts.push(`Create a 7-day dinner meal plan for a family of ${household.num_adults} adults and ${household.num_children} children.`);
  }

  // ── Family composition context ──
  if (household.child_age_bands?.length) {
    parts.push(`Children ages: ${household.child_age_bands.join(", ")}.`);
    const hasToddlers = household.child_age_bands.some((b: string) => b.includes("0–1") || b.includes("1–3"));
    const hasPreschool = household.child_age_bands.some((b: string) => b.includes("3–5"));
    const hasTeens = household.child_age_bands.some((b: string) => b.includes("13–18"));
    if (hasToddlers) parts.push(`⚠️ Family has toddlers/infants. Avoid choking hazards (whole grapes, nuts, popcorn, tough meats). Prefer soft, mild, easy-to-chew meals.`);
    if (hasPreschool) parts.push(`Preschool-age children present — include some fun, hands-on meals (tacos, build-your-own bowls, mini pizzas).`);
    if (hasTeens) parts.push(`Teenagers present — ensure generous portions and include higher-calorie/protein options.`);
  }
  if (household.num_children > 0 && !household.child_age_bands?.length) {
    parts.push(`Family has ${household.num_children} children — ensure most meals are kid-friendly or have easy kid-adaptations.`);
  }

  // ── Weekly setup preferences (user-selected for this specific plan) ──
  if (setup) {
    if (setup.takeout_days?.length) {
      parts.push(`\n🛍️ TAKEOUT NIGHTS (user-selected, MANDATORY): ${setup.takeout_days.map((d: number) => dayNames[d]).join(", ")}. These days MUST be meal_mode "takeout". For takeout days, suggest a specific cuisine or restaurant type (e.g., "Thai Takeout", "Pizza Delivery") — not just "Takeout".`);
    }
    if (setup.leftover_days?.length) {
      parts.push(`♻️ LEFTOVER NIGHTS (user-selected, MANDATORY): ${setup.leftover_days.map((d: number) => dayNames[d]).join(", ")}. These days MUST be meal_mode "leftovers". Name the leftover meal based on what was cooked the day before (e.g., "Leftover Chicken Fajita Bowls").`);
    }

    // Special meals — these are HIGH PRIORITY user requests
    if (setup.special_meals?.length) {
      parts.push(`\n⭐ SPECIAL MEAL REQUESTS — The user specifically asked for these meals this week. These MUST appear in the plan:\n${setup.special_meals.map((m: string) => `  - "${m}" → MUST be included as a cook night. Create a complete recipe with ingredients and instructions for this meal. If it's vague (e.g., "taco night"), interpret it as a specific recipe (e.g., "Beef Street Tacos with Cilantro-Lime Slaw").`).join("\n")}`);
    }

    // Locked saved meals — even higher priority
    if (setup.locked_saved_meals?.length) {
      const assignments = setup.saved_meal_day_assignments || {};
      parts.push(`\n🔒 LOCKED SAVED MEALS — The user hand-picked these from their saved meals. These MUST appear in the plan, no exceptions:`);
      for (const m of setup.locked_saved_meals) {
        const dayIdx = assignments[m];
        if (dayIdx !== undefined) {
          parts.push(`  - "${m}" → MUST appear on ${dayNames[dayIdx]} with meal_mode "cook". This is a hard constraint.`);
        } else {
          parts.push(`  - "${m}" → MUST appear on any available cook day.`);
        }
      }
    }

    if (setup.week_intensity) {
      const intensityMap: Record<string, string> = {
        relaxed: "\n🧘 RELAXED WEEK — User has more time to cook. Include 1-2 more elaborate meals (stews, slow-cook, multi-step recipes). Prep times up to 60 minutes are acceptable.",
        normal: "\n⚖️ NORMAL WEEK — Balanced mix. Most meals 20-35 minutes prep. One more ambitious meal is fine.",
        busy: "\n⚡ BUSY WEEK — User is very busy. ALL cook meals should be under 25 minutes prep. Favor sheet-pan, stir-fry, instant pot, one-pot meals. No multi-step or fussy recipes.",
      };
      parts.push(intensityMap[setup.week_intensity] || "");
    }

    if (setup.week_context_tags?.length) {
      const contextLabels: Record<string, string> = {
        chaotic_week: "chaotic week → maximize convenience, no-fuss meals, freezer-friendly",
        budget_week: "budget-tight → use affordable proteins (chicken thighs, beans, eggs, ground turkey), pantry staples, seasonal produce",
        sports_week: "sports week → high energy, extra carbs, post-practice quick meals",
        guests_visiting: "guests visiting → crowd-pleasers, shareable dishes, slightly more impressive presentation",
        one_parent_traveling: "solo parenting → simpler meals, less cleanup, kid-focused",
        low_cleanup_week: "low-cleanup → one-pot, sheet-pan, or foil-packet meals only",
        sick_week: "sick week → comfort food, soups, easy on the stomach, nourishing",
        high_protein_week: "high-protein → every meal should have 30g+ protein per serving",
        newborn_in_house: "newborn at home → absolute minimum effort, freezer meals, 15-min max prep",
      };
      const activeContexts = setup.week_context_tags.map((t: string) => contextLabels[t] || t);
      parts.push(`\n🏷️ WEEKLY CONTEXT — Adapt ALL meals to these conditions:\n${activeContexts.map(c => `  - ${c}`).join("\n")}`);
    }
  }

  // ── Household food preferences (from onboarding) ──
  if (prefs) {
    parts.push(`\n--- HOUSEHOLD PREFERENCES (from profile — apply to every plan) ---`);
    if (prefs.cuisines_liked?.length) {
      parts.push(`PREFERRED CUISINES: ${prefs.cuisines_liked.join(", ")}. Heavily favor these cuisines — at least 70% of cook nights should draw from these.`);
    }
    if (prefs.cuisines_disliked?.length) {
      parts.push(`AVOID CUISINES: ${prefs.cuisines_disliked.join(", ")}. Do NOT use these cuisines at all.`);
    }
    if (prefs.dietary_preferences?.length) {
      parts.push(`DIETARY REQUIREMENTS: ${prefs.dietary_preferences.join(", ")}. ALL meals MUST comply with these dietary preferences.`);
    }
    if (prefs.allergies?.length) {
      parts.push(`🚨 ALLERGIES (CRITICAL — SAFETY): ${prefs.allergies.join(", ")}. NEVER include these allergens in any meal, ingredient, or sauce. Double-check every ingredient.`);
    }
    if (prefs.foods_to_avoid?.length) {
      parts.push(`🚫 FOODS TO AVOID: ${prefs.foods_to_avoid.join(", ")}. The family does not eat these — never include them as a main ingredient or significant component.`);
    }
    if (prefs.weekly_grocery_budget) {
      parts.push(`💰 Weekly grocery budget: $${prefs.weekly_grocery_budget}. Keep total grocery list cost reasonable within this budget.`);
    }
    if (prefs.cooking_time_tolerance) {
      const toleranceMap: Record<string, string> = {
        minimal: "⏱️ Cooking time: MINIMAL (15 min max). Every meal must be ultra-quick.",
        low: "⏱️ Cooking time: LOW (30 min max). Keep all meals fast and simple.",
        medium: "⏱️ Cooking time: MEDIUM (up to 45 min). Standard family cooking times.",
        high: "⏱️ Cooking time: HIGH (60+ min OK). This family enjoys cooking — include some ambitious recipes.",
      };
      parts.push(toleranceMap[prefs.cooking_time_tolerance] || `Cooking time tolerance: ${prefs.cooking_time_tolerance}.`);
    }
    if (prefs.preferred_takeout_frequency && !setup?.takeout_days?.length) {
      parts.push(`Default takeout frequency: ${prefs.preferred_takeout_frequency} night(s) per week.`);
    }
    if (prefs.health_goal && prefs.health_goal !== "Balanced family eating") {
      const goalMap: Record<string, string> = {
        "Lose weight": "🎯 Health goal: Weight loss — favor lean proteins, vegetables, lower-calorie meals (400-550 cal per serving).",
        "Gain weight": "🎯 Health goal: Weight gain — include calorie-dense, nutrient-rich meals (600-800 cal per serving).",
        "Higher protein": "🎯 Health goal: Higher protein — every meal should have 30g+ protein per serving. Include beans, chicken, fish, eggs, tofu.",
        "Maintain": "🎯 Health goal: Maintain weight — balanced 500-650 cal per serving.",
      };
      parts.push(goalMap[prefs.health_goal] || `Health goal: ${prefs.health_goal}.`);
    }
  }

  // ── Weekly context from DB ──
  if (context) {
    const active = [];
    if (context.newborn_in_house) active.push("newborn in house");
    if (context.guests_visiting) active.push("guests visiting");
    if (context.sports_week) active.push("sports week");
    if (context.one_parent_traveling) active.push("one parent traveling");
    if (context.budget_week) active.push("budget-tight");
    if (context.low_cleanup_week) active.push("low-cleanup");
    if (context.sick_week) active.push("sick week");
    if (context.high_protein_week) active.push("high-protein");
    if (context.chaotic_week) active.push("chaotic week");
    if (active.length) parts.push(`Additional stored context flags: ${active.join("; ")}.`);
  }

  // ── Historical data ──
  if (lovedMeals.length) parts.push(`\n❤️ Previously LOVED meals (consider including again or variations): ${lovedMeals.slice(0, 10).join(", ")}.`);
  if (dislikedMeals.length) parts.push(`👎 Previously DISLIKED meals (avoid these or similar): ${dislikedMeals.slice(0, 10).join(", ")}.`);

  // ── Saved meals with frequency ──
  if (savedMeals.length) {
    const includedMeals = savedMeals.filter((m: any) => m.include_in_plan !== false);
    if (includedMeals.length) {
      const frequencyLabel: Record<string, string> = {
        every_week: "MUST include every week — this is a family staple",
        every_other_week: "include roughly every other week",
        once_a_month: "include about once a month",
        occasionally: "include occasionally when it fits",
      };
      parts.push(`\n📋 SAVED FAMILY MEALS — These are meals the family has explicitly saved and wants in their rotation. Respect their frequency preferences:`);
      for (const m of includedMeals) {
        const desc = m.meal_description ? ` — "${m.meal_description}"` : "";
        const freq = frequencyLabel[(m as any).frequency] || "include when possible";
        parts.push(`  - ${m.meal_name}${desc} → ${freq}`);
      }

      const mustInclude = includedMeals.filter((m: any) => m.frequency === "every_week");
      if (mustInclude.length) {
        parts.push(`\n⚠️ MANDATORY: These meals MUST appear this week: ${mustInclude.map((m: any) => `"${m.meal_name}"`).join(", ")}. Failing to include them will result in a bad plan.`);
      }
    }
  }

  // ── Check-in behavioral insights (implicit + explicit signals) ──
  if (checkinInsights.length > 0) {
    parts.push(`\n📊 BEHAVIORAL DATA — Recent evening check-ins. YOUR ADVANTAGE IS HERE — use these signals to adapt the plan intelligently:`);

    const dayPatterns: Record<number, { tags: Record<string, number>; effortTooMuch: number; effortEasy: number; total: number }> = {};
    const globalTags: Record<string, number> = {};
    let totalEffortTooMuch = 0;
    let totalEffortEasy = 0;

    for (const ci of checkinInsights) {
      if (!dayPatterns[ci.day_of_week]) {
        dayPatterns[ci.day_of_week] = { tags: {}, effortTooMuch: 0, effortEasy: 0, total: 0 };
      }
      const dp = dayPatterns[ci.day_of_week];
      dp.total++;
      if (ci.effort_level === "too_much") { dp.effortTooMuch++; totalEffortTooMuch++; }
      if (ci.effort_level === "easy") { dp.effortEasy++; totalEffortEasy++; }
      for (const tag of ci.tags) {
        dp.tags[tag] = (dp.tags[tag] || 0) + 1;
        globalTags[tag] = (globalTags[tag] || 0) + 1;
      }
    }

    // Per-day behavioral signals
    parts.push(`\n  EXPLICIT SIGNALS (user-reported per day):`);
    for (const [dayIdx, pattern] of Object.entries(dayPatterns)) {
      const dayName = dayNames[Number(dayIdx)];
      const notes: string[] = [];
      if (pattern.effortTooMuch > 0) notes.push(`felt too hard ${pattern.effortTooMuch}x → SIMPLIFY this day`);
      if (pattern.effortEasy > 0) notes.push(`felt easy ${pattern.effortEasy}x → this day can handle moderate complexity`);
      if (pattern.tags["kids_refused"] > 0) notes.push(`kids refused ${pattern.tags["kids_refused"]}x → kid-friendly REQUIRED`);
      if (pattern.tags["ordered_out"] > 0) notes.push(`ordered out ${pattern.tags["ordered_out"]}x → consider making this a takeout night`);
      if (pattern.tags["easy_win"] > 0) notes.push(`easy win ${pattern.tags["easy_win"]}x → keep it simple`);
      if (pattern.tags["everyone_liked"] > 0) notes.push(`everyone liked ${pattern.tags["everyone_liked"]}x → this style works`);
      if (pattern.tags["great_leftovers"] > 0) notes.push(`good leftovers → cook extra the day before`);
      if (pattern.tags["not_again"] > 0) notes.push(`said "not again" ${pattern.tags["not_again"]}x → avoid similar meals`);
      if (pattern.tags["cooked_it"] > 0) notes.push(`actually cooked ${pattern.tags["cooked_it"]}x`);
      if (notes.length) parts.push(`    ${dayName}: ${notes.join("; ")} (${pattern.total} data points)`);
    }

    // Implicit pattern detection
    const totalCheckins = checkinInsights.length;
    parts.push(`\n  IMPLICIT PATTERNS (derived — use to shape the whole plan):`);

    if (totalEffortTooMuch > totalCheckins * 0.3) {
      parts.push(`    ⚠️ EFFORT OVERLOAD: ${Math.round(totalEffortTooMuch/totalCheckins*100)}% of meals felt too hard → reduce average prep time by 25%, favor one-pan/one-pot meals`);
    }
    if (totalEffortEasy > totalCheckins * 0.5) {
      parts.push(`    ✅ EFFORT COMFORT: Family handles easy meals well → can introduce 1-2 moderately challenging meals on weekends`);
    }
    if (globalTags["ordered_out"] > totalCheckins * 0.3) {
      parts.push(`    📦 HIGH TAKEOUT TENDENCY: Family orders out ${Math.round((globalTags["ordered_out"]||0)/totalCheckins*100)}% of the time → add extra takeout/easy nights, reduce cook nights`);
    }
    if (globalTags["kids_refused"] > totalCheckins * 0.25) {
      parts.push(`    👶 KID RESISTANCE PATTERN: Kids refuse ${Math.round((globalTags["kids_refused"]||0)/totalCheckins*100)}% of meals → increase kid-friendly ratio to 80%+, avoid unfamiliar flavors`);
    }
    if (globalTags["easy_win"] > totalCheckins * 0.3) {
      parts.push(`    ⭐ EASY WINS VALUED: Family thrives on simple meals → keep 70%+ of cook nights under 25 min prep`);
    }
    if (globalTags["everyone_liked"] > totalCheckins * 0.4) {
      parts.push(`    ❤️ HIGH SATISFACTION: Family generally enjoys their meals → current difficulty level is good, maintain it`);
    }
    if (globalTags["cooked_it"] && globalTags["ordered_out"]) {
      const cookRate = Math.round((globalTags["cooked_it"] / (globalTags["cooked_it"] + globalTags["ordered_out"])) * 100);
      parts.push(`    📊 COOK-THROUGH RATE: ${cookRate}% — ${cookRate > 70 ? "strong execution, plan is calibrated well" : cookRate > 50 ? "moderate — simplify further to improve follow-through" : "low — plan is likely too ambitious, drastically simplify"}`);
    }
  }

  // ── Recipe quality requirements ──
  parts.push(`
--- RECIPE QUALITY REQUIREMENTS ---

MEAL NAMES: Use specific, appetizing recipe names that make families excited to cook.
  ✅ "Honey-Garlic Chicken Thighs with Roasted Broccoli", "One-Pot Creamy Tuscan Sausage Pasta"
  ❌ "Chicken Dinner", "Pasta", "Fish and Veggies"

MEAL DESCRIPTIONS: 1-2 sentences — key flavors, what makes it appealing, and why it works for this day of the week.

SMART INGREDIENT OVERLAP: Actively plan ingredient reuse across meals. Note in the meal description when ingredients overlap (e.g., "Uses the same cilantro and lime from Tuesday's tacos").

VARIETY RULES:
  - Never repeat the same primary protein on consecutive days
  - Vary cooking methods across the week
  - Mix cuisines — don't cluster same cuisine on consecutive days
  - Include at least one vegetable-forward meal per week
  - Balance rich/indulgent meals with lighter ones
  - Monday should be the easiest meal of the week

INGREDIENTS: Per single serving. Practical quantities:
  ✅ "1" chicken breast, "0.5" lb ground turkey, "2" tbsp olive oil, "1" cup rice
  Include ALL ingredients — don't skip seasonings, oils, or garnishes
  Group: proteins first, then produce, then pantry/seasonings

INSTRUCTIONS: 6-10 detailed steps:
  1. Start with ingredient prep (dice, mince, slice — specify sizes)
  2. Include exact temperatures ("Preheat oven to 425°F")
  3. Include cooking times ("Sauté 3-4 minutes until golden")
  4. Include sensory cues ("until onions are translucent", "internal temp 165°F")
  5. End with plating/serving suggestions
  6. Note what can be prepped ahead if relevant

NUTRITION: Per single serving, realistic ranges:
  - Calories: 400-700 for dinner
  - Protein: 20-45g meat-based, 12-25g vegetarian
  - Include fiber_g

GROCERY LIST:
  - COMBINE duplicate ingredients across meals (this is critical for ingredient reuse strategy)
  - Use realistic family-sized quantities
  - Categorize: produce, protein, dairy, pantry, frozen, snacks
  - Skip pantry staples families always have (salt, pepper, basic oil) unless in ingredients`);

  // ── Leftover policy ──
  if (!setup) {
    parts.push(`\nInclude at least 1 leftover night reusing a previous cooked meal.`);
  } else if (!setup.leftover_days?.length) {
    parts.push(`\nThe user selected NO leftover nights. Do NOT include any days with meal_mode "leftovers". All non-takeout days should be meal_mode "cook".`);
  }

  // ── Reality score ──
  parts.push(`
REALITY SCORE (0-100): How achievable is this plan for THIS specific family?
  90-100: Very easy week — lots of quick meals, minimal effort
  70-89: Realistic — good balance of cooking and convenience
  50-69: Ambitious — some challenging meals, might feel like a lot
  Below 50: Likely unsustainable

Factor in: cook nights vs convenience, prep times vs tolerance, weekly context, family composition, behavioral patterns (cook-through rate, effort perception, kid acceptance).
Include a reality_message that's warm and specific — e.g., "Monday and Wednesday are your easiest nights. Thursday's salmon is slightly more involved but worth it."`);

  if (isPartial) {
    parts.push(`\n🔴 FINAL REMINDER: Generate EXACTLY ${planDayCount} days with day_of_week values: ${planDayIndices.join(", ")}. Do NOT generate days outside this range.`);
  }

  return parts.join("\n");
}

function generateMockPlan(household: any, prefs: any, context: any, setup?: any, daysToGenerate?: number[]) {
  const isHard = context?.newborn_in_house || context?.chaotic_week || context?.sick_week || setup?.week_intensity === "busy";
  const takeoutDays = new Set(setup?.takeout_days || []);
  const leftoverDays = new Set(setup?.leftover_days || []);
  const takeoutCount = takeoutDays.size || prefs?.preferred_takeout_frequency || 1;
  const activeDays = daysToGenerate || [0, 1, 2, 3, 4, 5, 6];
  const isPartial = activeDays.length < 7;

  const meals = isPartial ? [
    { name: "15-Min Quesadillas", desc: "Quick cheesy quesadillas with salsa and sour cream", cuisine: "Mexican", prep: 15, cal: 480, p: 22, c: 42, f: 24 },
    { name: "Chicken Stir-Fry", desc: "Quick chicken and veggie stir-fry with rice", cuisine: "Chinese", prep: 18, cal: 540, p: 34, c: 52, f: 19 },
    { name: "Grilled Cheese & Tomato Soup", desc: "Comfort classic for easy nights", cuisine: "American", prep: 12, cal: 450, p: 16, c: 48, f: 22 },
    { name: "One-Pot Pasta", desc: "Everything cooks in one pot — minimal cleanup", cuisine: "Italian", prep: 18, cal: 520, p: 18, c: 68, f: 20 },
  ] : [
    { name: "One-Pot Pasta Primavera", desc: "Quick veggie pasta with garlic bread", cuisine: "Italian", prep: 25, cal: 520, p: 18, c: 68, f: 20 },
    { name: "Sheet Pan Chicken Fajitas", desc: "Seasoned chicken with peppers and tortillas", cuisine: "Mexican", prep: 30, cal: 580, p: 35, c: 45, f: 22 },
    { name: "Teriyaki Salmon Bowl", desc: "Glazed salmon over rice with steamed broccoli", cuisine: "Japanese", prep: 25, cal: 610, p: 38, c: 55, f: 24 },
    { name: "Turkey Taco Night", desc: "Ground turkey tacos with all the fixings", cuisine: "Mexican", prep: 20, cal: 490, p: 32, c: 42, f: 18 },
    { name: "Chicken Stir-Fry", desc: "Quick chicken and veggie stir-fry with rice", cuisine: "Chinese", prep: 20, cal: 540, p: 34, c: 52, f: 19 },
    { name: "Spaghetti Bolognese", desc: "Classic family meat sauce with pasta", cuisine: "Italian", prep: 35, cal: 620, p: 30, c: 72, f: 22 },
    { name: "Grilled Cheese & Tomato Soup", desc: "Comfort classic for easy nights", cuisine: "American", prep: 15, cal: 450, p: 16, c: 48, f: 22 },
  ];

  // If special meals requested, swap them in
  const specialMeals = setup?.special_meals || [];
  for (let si = 0; si < specialMeals.length && si < meals.length; si++) {
    meals[si] = { ...meals[si], name: specialMeals[si], desc: `Family request: ${specialMeals[si]}` };
  }

  const days = [];
  let cookIdx = 0;

  for (const i of activeDays) {
    let mode = "cook";
    if (takeoutDays.has(i)) {
      mode = "takeout";
    } else if (leftoverDays.has(i)) {
      mode = "leftovers";
    } else if (!takeoutDays.size && !setup?.takeout_days && !isPartial && i === 4 && takeoutCount >= 1) {
      mode = "takeout";
    } else if (!leftoverDays.size && !setup && !isPartial && i === 2) {
      mode = "leftovers";
    } else if (isHard && cookIdx === 1 && !takeoutDays.has(i) && !leftoverDays.has(i)) {
      mode = "emergency";
    }

    const meal = meals[cookIdx % meals.length];

    days.push({
      day_of_week: i,
      meal_mode: mode,
      meal_name: mode === "takeout" ? "Pizza Night" : mode === "leftovers" ? `Leftover ${meals[(cookIdx - 1 + meals.length) % meals.length].name}` : mode === "emergency" ? "Frozen Pizza + Salad" : meal.name,
      meal_description: mode === "takeout" ? "Order from your favorite local spot" : mode === "leftovers" ? "Use up what's in the fridge" : mode === "emergency" ? "Quick freezer meal for hectic nights" : meal.desc,
      cuisine_type: mode === "takeout" ? "Various" : meal.cuisine,
      prep_time_minutes: mode === "cook" ? (isHard || isPartial ? Math.min(meal.prep, 20) : meal.prep) : mode === "emergency" ? 10 : 5,
      calories: mode === "takeout" ? 700 : mode === "emergency" ? 450 : meal.cal,
      protein_g: mode === "takeout" ? 25 : mode === "emergency" ? 15 : meal.p,
      carbs_g: mode === "takeout" ? 80 : mode === "emergency" ? 55 : meal.c,
      fat_g: mode === "takeout" ? 30 : mode === "emergency" ? 20 : meal.f,
      fiber_g: 8,
      notes: null,
      takeout_budget: mode === "takeout" ? 35 : null,
    });

    if (mode === "cook") cookIdx++;
  }

  const realityScore = isPartial ? 90 : (isHard ? 55 : 82);
  const realityMessage = isPartial
    ? "Quick plan to get you through the rest of the week. Easy and low-commitment."
    : isHard
    ? "This week looks ambitious given your context. Consider swapping another night to takeout or leftovers."
    : "This plan looks achievable! Good balance of cooking and convenience.";

  return {
    reality_score: realityScore,
    reality_message: realityMessage,
    days,
    grocery_items: [
      { category: "produce", item_name: "Bell peppers", quantity: "4" },
      { category: "produce", item_name: "Broccoli", quantity: "2 heads" },
      { category: "produce", item_name: "Tomatoes", quantity: "6" },
      { category: "produce", item_name: "Onions", quantity: "3" },
      { category: "produce", item_name: "Garlic", quantity: "1 bulb" },
      { category: "produce", item_name: "Lettuce", quantity: "1 head" },
      { category: "protein", item_name: "Chicken breasts", quantity: "2 lbs" },
      ...(isPartial ? [] : [
        { category: "protein", item_name: "Salmon fillets", quantity: "4 fillets" },
        { category: "protein", item_name: "Ground turkey", quantity: "1 lb" },
        { category: "protein", item_name: "Ground beef", quantity: "1 lb" },
      ]),
      { category: "dairy", item_name: "Shredded cheese", quantity: "2 cups" },
      { category: "dairy", item_name: "Sour cream", quantity: "1 container" },
      { category: "pantry", item_name: "Pasta (spaghetti)", quantity: "1 lb" },
      { category: "pantry", item_name: "Rice", quantity: "2 cups" },
      { category: "pantry", item_name: "Tortillas", quantity: "12 pack" },
      { category: "pantry", item_name: "Olive oil", quantity: "1 bottle" },
      { category: "pantry", item_name: "Soy sauce", quantity: "1 bottle" },
    ],
  };
}
