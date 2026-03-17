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

    const monday = getNextMonday();
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

    let planData;

    if (lovableApiKey) {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are a family meal planning assistant. Return ONLY valid JSON, no markdown." },
            { role: "user", content: prompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "create_weekly_plan",
              description: "Create a 7-day family meal plan",
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
      planData = generateMockPlan(household, preferences, context, setup);
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
  setup?: { takeout_days?: number[]; leftover_days?: number[]; special_meals?: string[]; week_intensity?: string; locked_saved_meals?: string[]; saved_meal_day_assignments?: Record<string, number> },
) {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const parts = [
    `Create a 7-day dinner meal plan for a family of ${household.num_adults} adults and ${household.num_children} children.`,
  ];

  if (household.child_age_bands?.length) {
    parts.push(`Children ages: ${household.child_age_bands.join(", ")}.`);
  }

  // Weekly setup preferences from the user
  if (setup) {
    if (setup.takeout_days?.length) {
      parts.push(`TAKEOUT NIGHTS (user-selected): ${setup.takeout_days.map((d: number) => dayNames[d]).join(", ")}. These days MUST be meal_mode "takeout".`);
    }
    if (setup.leftover_days?.length) {
      parts.push(`LEFTOVER NIGHTS (user-selected): ${setup.leftover_days.map((d: number) => dayNames[d]).join(", ")}. These days MUST be meal_mode "leftovers".`);
    }
    if (setup.special_meals?.length) {
      parts.push(`SPECIAL MEAL REQUESTS (user wants these included this week): ${setup.special_meals.join(", ")}. Include these meals in the plan.`);
    }
    if (setup.locked_saved_meals?.length) {
      const assignments = setup.saved_meal_day_assignments || {};
      const mealDetails = setup.locked_saved_meals.map((m: string) => {
        const dayIdx = assignments[m];
        return dayIdx !== undefined ? `${m} → MUST be on ${dayNames[dayIdx]}` : m;
      });
      parts.push(`LOCKED SAVED MEALS (user specifically selected these from their saved meals — MUST include them this week): ${mealDetails.join("; ")}. These take priority over frequency settings. If a specific day is assigned, that meal MUST appear on that day with meal_mode "cook".`);
    }
    if (setup.week_intensity) {
      const intensityMap: Record<string, string> = {
        relaxed: "RELAXED WEEK — user has more time. Include more elaborate cook nights, longer prep times are okay.",
        normal: "NORMAL WEEK — balanced mix of cooking effort.",
        busy: "BUSY WEEK — user is very busy. Prefer quick meals (under 20 min), simple recipes, and more convenience nights.",
      };
      parts.push(intensityMap[setup.week_intensity] || "");
    }
  }

  if (prefs) {
    if (prefs.cuisines_liked?.length) parts.push(`Preferred cuisines: ${prefs.cuisines_liked.join(", ")}.`);
    if (prefs.cuisines_disliked?.length) parts.push(`Avoid cuisines: ${prefs.cuisines_disliked.join(", ")}.`);
    if (prefs.dietary_preferences?.length) parts.push(`Dietary: ${prefs.dietary_preferences.join(", ")}.`);
    if (prefs.allergies?.length) parts.push(`ALLERGIES (must avoid): ${prefs.allergies.join(", ")}.`);
    if (prefs.foods_to_avoid?.length) parts.push(`FOODS TO AVOID (the family does not eat these — never include them in any meal): ${prefs.foods_to_avoid.join(", ")}.`);
    if (prefs.weekly_grocery_budget) parts.push(`Weekly budget: $${prefs.weekly_grocery_budget}.`);
    if (prefs.cooking_time_tolerance) parts.push(`Cooking time tolerance: ${prefs.cooking_time_tolerance}.`);
    // Only use pref takeout frequency if no setup override
    if (prefs.preferred_takeout_frequency && !setup?.takeout_days?.length) parts.push(`Include ${prefs.preferred_takeout_frequency} takeout night(s).`);
    if (prefs.health_goal) parts.push(`Health goal: ${prefs.health_goal}.`);
  }

  if (context) {
    const active = [];
    if (context.newborn_in_house) active.push("newborn in house (prefer very easy meals)");
    if (context.guests_visiting) active.push("guests visiting (increase portions)");
    if (context.sports_week) active.push("sports week (high energy meals)");
    if (context.one_parent_traveling) active.push("one parent traveling (simpler meals)");
    if (context.budget_week) active.push("budget-tight week (affordable meals)");
    if (context.low_cleanup_week) active.push("low-cleanup week (one-pot meals preferred)");
    if (context.sick_week) active.push("sick week (comfort/easy meals)");
    if (context.high_protein_week) active.push("high-protein week");
    if (context.chaotic_week) active.push("chaotic week (maximize convenience)");
    if (active.length) parts.push(`This week's context: ${active.join("; ")}.`);
  }

  if (lovedMeals.length) parts.push(`Previously loved meals: ${lovedMeals.slice(0, 10).join(", ")}.`);
  if (dislikedMeals.length) parts.push(`Previously disliked/refused meals: ${dislikedMeals.slice(0, 10).join(", ")}.`);

  if (savedMeals.length) {
    const includedMeals = savedMeals.filter((m: any) => m.include_in_plan !== false);
    if (includedMeals.length) {
      const frequencyLabel: Record<string, string> = {
        every_week: "MUST include every week",
        every_other_week: "include roughly every other week",
        once_a_month: "include about once a month",
        occasionally: "include occasionally when it fits",
      };
      const mealList = includedMeals.map((m: any) => {
        const desc = m.meal_description ? ` (${m.meal_description})` : "";
        const freq = frequencyLabel[m.frequency] || "include when possible";
        return `- ${m.meal_name}${desc} → ${freq}`;
      }).join("\n");
      parts.push(`\nSAVED FAMILY MEALS — The family has specifically saved these meals with inclusion preferences. Respect their frequency settings:\n${mealList}`);
      
      const mustInclude = includedMeals.filter((m: any) => m.frequency === "every_week");
      if (mustInclude.length) {
        parts.push(`⚠️ The following meals MUST appear in this week's plan: ${mustInclude.map((m: any) => m.meal_name).join(", ")}.`);
      }
    }
  }

  // Check-in behavioral insights
  if (checkinInsights.length > 0) {
    parts.push(`\nIMPORTANT — Recent evening check-in data from the family (use this to adapt the plan):`);

    const dayPatterns: Record<number, { tags: Record<string, number>; effortTooMuch: number; total: number }> = {};
    const globalTags: Record<string, number> = {};

    for (const ci of checkinInsights) {
      if (!dayPatterns[ci.day_of_week]) {
        dayPatterns[ci.day_of_week] = { tags: {}, effortTooMuch: 0, total: 0 };
      }
      const dp = dayPatterns[ci.day_of_week];
      dp.total++;
      if (ci.effort_level === "too_much") dp.effortTooMuch++;
      for (const tag of ci.tags) {
        dp.tags[tag] = (dp.tags[tag] || 0) + 1;
        globalTags[tag] = (globalTags[tag] || 0) + 1;
      }
    }

    for (const [dayIdx, pattern] of Object.entries(dayPatterns)) {
      const dayName = dayNames[Number(dayIdx)];
      const notes: string[] = [];
      if (pattern.effortTooMuch > 0) notes.push("felt like too much effort");
      if (pattern.tags["kids_refused"] > 0) notes.push("kids refused the meal");
      if (pattern.tags["ordered_out"] > 0) notes.push("family ordered out instead of cooking");
      if (pattern.tags["easy_win"] > 0) notes.push("was an easy win");
      if (pattern.tags["everyone_liked"] > 0) notes.push("everyone liked it");
      if (pattern.tags["great_leftovers"] > 0) notes.push("produced great leftovers");
      if (pattern.tags["not_again"] > 0) notes.push("family said not again");
      if (notes.length) parts.push(`- ${dayName}: ${notes.join(", ")} (${pattern.total} check-in${pattern.total > 1 ? "s" : ""})`);
    }

    const totalCheckins = checkinInsights.length;
    if (globalTags["too_much_work"] > totalCheckins * 0.3) {
      parts.push(`Overall pattern: meals feel like too much work. Prefer simpler, lower-effort meals.`);
    }
    if (globalTags["ordered_out"] > totalCheckins * 0.3) {
      parts.push(`Overall pattern: family frequently orders out. Consider adding more takeout/easy nights.`);
    }
    if (globalTags["kids_refused"] > totalCheckins * 0.25) {
      parts.push(`Overall pattern: kids frequently refuse meals. Prioritize kid-friendly options.`);
    }
    if (globalTags["easy_win"] > totalCheckins * 0.3) {
      parts.push(`Overall pattern: easy wins are valued. Keep meals simple and approachable.`);
    }
  }

  if (!setup?.leftover_days?.length) {
    parts.push(`Include at least 1 leftover night reusing a previous cooked meal.`);
  }
  parts.push(`Include realistic nutrition estimates per meal (calories, protein_g, carbs_g, fat_g). Nutrition should be PER SINGLE SERVING.`);
  parts.push(`IMPORTANT — Ingredient quantities must be for ONE SINGLE SERVING (the app will scale them by number of servings). Use sensible household units (e.g. "1" chicken breast, "0.5" lb ground turkey, "1" cup rice, "2" tbsp olive oil, "1" clove garlic). Keep units in the "unit" field, numeric amounts in "quantity".`);
  parts.push(`For each meal, provide detailed step-by-step cooking instructions with 6-10 steps. Include prep details (how to cut, season, marinate), cooking temperatures and times, and plating/serving suggestions. Be specific enough that a beginner cook could follow along.`);
  parts.push(`Generate a matching grocery list organized by category.`);
  parts.push(`Assess reality_score (0-100) based on how realistic the plan is given the family's context. Factor in:
- Number of cook nights vs convenience nights (more cook nights = lower score for busy families)
- Average prep time relative to cooking_time_tolerance
- Whether the plan respects weekly context flags (newborn, chaotic week, etc.)
- Balance of nutrition across the week
- Whether past check-in patterns suggest the family can handle this plan
A score of 90+ means very easy week. 70-89 is realistic. 50-69 is ambitious. Below 50 is likely unsustainable.`);

  return parts.join("\n");
}

function generateMockPlan(household: any, prefs: any, context: any, setup?: any) {
  const isHard = context?.newborn_in_house || context?.chaotic_week || context?.sick_week || setup?.week_intensity === "busy";
  const takeoutDays = new Set(setup?.takeout_days || []);
  const leftoverDays = new Set(setup?.leftover_days || []);
  const takeoutCount = takeoutDays.size || prefs?.preferred_takeout_frequency || 1;

  const meals = [
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

  for (let i = 0; i < 7; i++) {
    let mode = "cook";
    if (takeoutDays.has(i)) {
      mode = "takeout";
    } else if (leftoverDays.has(i)) {
      mode = "leftovers";
    } else if (!takeoutDays.size && i === 4 && takeoutCount >= 1) {
      mode = "takeout";
    } else if (!leftoverDays.size && i === 2) {
      mode = "leftovers";
    } else if (isHard && i === 1 && !takeoutDays.has(1) && !leftoverDays.has(1)) {
      mode = "emergency";
    }

    const meal = meals[cookIdx % meals.length];

    days.push({
      day_of_week: i,
      meal_mode: mode,
      meal_name: mode === "takeout" ? "Pizza Night" : mode === "leftovers" ? `Leftover ${meals[(cookIdx - 1 + meals.length) % meals.length].name}` : mode === "emergency" ? "Frozen Pizza + Salad" : meal.name,
      meal_description: mode === "takeout" ? "Order from your favorite local spot" : mode === "leftovers" ? "Use up what's in the fridge" : mode === "emergency" ? "Quick freezer meal for hectic nights" : meal.desc,
      cuisine_type: mode === "takeout" ? "Various" : meal.cuisine,
      prep_time_minutes: mode === "cook" ? (isHard ? Math.min(meal.prep, 20) : meal.prep) : mode === "emergency" ? 10 : 5,
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

  const realityScore = isHard ? 55 : 82;
  const realityMessage = isHard
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
      { category: "protein", item_name: "Salmon fillets", quantity: "4 fillets" },
      { category: "protein", item_name: "Ground turkey", quantity: "1 lb" },
      { category: "protein", item_name: "Ground beef", quantity: "1 lb" },
      { category: "dairy", item_name: "Shredded cheese", quantity: "2 cups" },
      { category: "dairy", item_name: "Sour cream", quantity: "1 container" },
      { category: "dairy", item_name: "Butter", quantity: "1 stick" },
      { category: "pantry", item_name: "Pasta (spaghetti)", quantity: "1 lb" },
      { category: "pantry", item_name: "Rice", quantity: "2 cups" },
      { category: "pantry", item_name: "Tortillas", quantity: "12 pack" },
      { category: "pantry", item_name: "Olive oil", quantity: "1 bottle" },
      { category: "pantry", item_name: "Soy sauce", quantity: "1 bottle" },
      { category: "pantry", item_name: "Taco seasoning", quantity: "2 packets" },
      { category: "pantry", item_name: "Tomato sauce", quantity: "2 cans" },
      { category: "frozen", item_name: "Frozen pizza", quantity: "2" },
      { category: "frozen", item_name: "Frozen vegetables", quantity: "1 bag" },
      { category: "snacks", item_name: "Crackers", quantity: "1 box" },
      { category: "snacks", item_name: "Fruit (apples, bananas)", quantity: "assorted" },
    ],
  };
}
