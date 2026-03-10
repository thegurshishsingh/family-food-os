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

    const { plan_day_id, household_id, action, selected_meal } = await req.json();
    if (!plan_day_id || !household_id) throw new Error("plan_day_id and household_id required");

    // Verify ownership
    const { data: household } = await supabaseClient
      .from("households")
      .select("*")
      .eq("id", household_id)
      .eq("owner_id", user.id)
      .single();
    if (!household) throw new Error("Household not found");

    // Get the current day
    const { data: currentDay } = await supabaseClient
      .from("plan_days")
      .select("*")
      .eq("id", plan_day_id)
      .single();
    if (!currentDay) throw new Error("Plan day not found");

    // ── ACTION: confirm ── user picked a meal, save it and sync groceries
    if (action === "confirm" && selected_meal) {
      const { error: updateError } = await supabaseClient
        .from("plan_days")
        .update({
          meal_name: selected_meal.meal_name,
          meal_description: selected_meal.meal_description,
          cuisine_type: selected_meal.cuisine_type || null,
          prep_time_minutes: selected_meal.prep_time_minutes || null,
          calories: selected_meal.calories,
          protein_g: selected_meal.protein_g,
          carbs_g: selected_meal.carbs_g,
          fat_g: selected_meal.fat_g,
          fiber_g: selected_meal.fiber_g || null,
          ingredients: selected_meal.ingredients || null,
          instructions: selected_meal.instructions || null,
        })
        .eq("id", plan_day_id);
      if (updateError) throw updateError;

      // ── Sync grocery list ──
      // Remove old grocery items that were from the old meal (match by plan_id)
      // Then add new ones from the selected meal's ingredients
      const planId = currentDay.plan_id;
      const oldIngredients = (currentDay.ingredients as any[]) || [];
      const oldItemNames = oldIngredients.map((ing: any) => ing.name?.toLowerCase()).filter(Boolean);

      if (oldItemNames.length > 0) {
        // Delete old meal's grocery items (best-effort match by name)
        for (const name of oldItemNames) {
          await supabaseClient
            .from("grocery_items")
            .delete()
            .eq("plan_id", planId)
            .ilike("item_name", name);
        }
      }

      // Insert new meal's ingredients as grocery items
      const newIngredients = (selected_meal.ingredients as any[]) || [];
      if (newIngredients.length > 0) {
        const groceryRows = newIngredients.map((ing: any) => ({
          plan_id: planId,
          item_name: ing.name,
          quantity: ing.quantity ? `${ing.quantity}${ing.unit ? " " + ing.unit : ""}` : null,
          category: categorizeIngredient(ing.name),
          is_checked: false,
          is_staple: false,
        }));
        await supabaseClient.from("grocery_items").insert(groceryRows);
      }

      return new Response(JSON.stringify({ success: true, meal: selected_meal }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: suggest (default) ── generate 3 options
    const { data: allDays } = await supabaseClient
      .from("plan_days")
      .select("meal_name, meal_mode")
      .eq("plan_id", currentDay.plan_id);

    const otherMeals = allDays
      ?.filter((d: any) => d.meal_name && d.meal_name !== currentDay.meal_name)
      .map((d: any) => d.meal_name) || [];

    const { data: preferences } = await supabaseClient
      .from("household_preferences")
      .select("*")
      .eq("household_id", household_id)
      .single();

    const { data: feedback } = await supabaseClient
      .from("meal_feedback")
      .select("meal_name, feedback")
      .eq("household_id", household_id)
      .order("created_at", { ascending: false })
      .limit(30);

    const dislikedMeals = feedback?.filter((f: any) => ["kids_refused", "too_hard"].includes(f.feedback)).map((f: any) => f.meal_name) || [];

    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    let suggestions: any[] = [];

    if (lovableApiKey) {
      const prompt = [
        `Suggest THREE alternative ${currentDay.meal_mode} meals for ${dayNames[currentDay.day_of_week]} for a family of ${household.num_adults} adults and ${household.num_children} children.`,
        `Current meal to replace: "${currentDay.meal_name}".`,
        `Other meals already planned this week (avoid duplicates): ${otherMeals.join(", ")}.`,
        preferences?.cuisines_liked?.length ? `Preferred cuisines: ${preferences.cuisines_liked.join(", ")}.` : "",
        preferences?.allergies?.length ? `ALLERGIES (must avoid): ${preferences.allergies.join(", ")}.` : "",
        preferences?.dietary_preferences?.length ? `Dietary: ${preferences.dietary_preferences.join(", ")}.` : "",
        preferences?.foods_to_avoid?.length ? `FOODS TO AVOID (the family does not eat these — never include them in any meal): ${preferences.foods_to_avoid.join(", ")}.` : "",
        dislikedMeals.length ? `Avoid these disliked meals: ${dislikedMeals.join(", ")}.` : "",
        `Meal mode: ${currentDay.meal_mode}.`,
        preferences?.cooking_time_tolerance ? `Cooking time tolerance: ${preferences.cooking_time_tolerance}. Match the replacement meal's prep time to this preference.` : "",
        `Include realistic nutrition estimates PER SINGLE SERVING.`,
        `IMPORTANT — Ingredient quantities must be for ONE SINGLE SERVING. Use sensible units (e.g. "1" chicken breast, "0.5" lb, "1" cup, "2" tbsp). Keep units in the "unit" field, numeric amounts in "quantity".`,
        `Provide detailed step-by-step cooking instructions with 6-10 steps.`,
        `IMPORTANT: Make the three suggestions varied — different cuisines or styles so the user has a real choice.`,
      ].filter(Boolean).join("\n");

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
              name: "suggest_meals",
              description: "Suggest three replacement meals with recipes",
              parameters: {
                type: "object",
                properties: {
                  meals: {
                    type: "array",
                    description: "Array of exactly 3 meal suggestions",
                    items: {
                      type: "object",
                      properties: {
                        meal_name: { type: "string" },
                        meal_description: { type: "string" },
                        cuisine_type: { type: "string" },
                        prep_time_minutes: { type: "number" },
                        calories: { type: "number" },
                        protein_g: { type: "number" },
                        carbs_g: { type: "number" },
                        fat_g: { type: "number" },
                        fiber_g: { type: "number" },
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
                      required: ["meal_name", "meal_description", "calories", "protein_g", "carbs_g", "fat_g", "ingredients", "instructions"],
                    },
                  },
                },
                required: ["meals"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "suggest_meals" } },
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const aiResult = await aiResponse.json();
      const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool call returned from AI");

      const parsed = JSON.parse(toolCall.function.arguments);
      suggestions = parsed.meals || [parsed];
    } else {
      // Fallback mock
      suggestions = [
        { meal_name: "Honey Garlic Chicken", meal_description: "Sweet and savory chicken thighs with steamed rice", cuisine_type: "Asian", prep_time_minutes: 25, calories: 550, protein_g: 35, carbs_g: 50, fat_g: 20, fiber_g: 4, ingredients: [{ name: "chicken thighs", quantity: "2", unit: "pieces" }, { name: "honey", quantity: "2", unit: "tbsp" }, { name: "garlic", quantity: "3", unit: "cloves" }, { name: "soy sauce", quantity: "2", unit: "tbsp" }, { name: "rice", quantity: "1", unit: "cup" }], instructions: ["Season chicken thighs with salt and pepper.", "Mix honey, minced garlic, and soy sauce.", "Pan-sear chicken 5 min per side.", "Pour sauce over and simmer 10 min.", "Serve over steamed rice."] },
        { meal_name: "Black Bean Tacos", meal_description: "Vegetarian tacos with fresh salsa and avocado", cuisine_type: "Mexican", prep_time_minutes: 15, calories: 480, protein_g: 18, carbs_g: 58, fat_g: 16, fiber_g: 12, ingredients: [{ name: "black beans", quantity: "1", unit: "can" }, { name: "corn tortillas", quantity: "4", unit: "pieces" }, { name: "avocado", quantity: "1", unit: "whole" }, { name: "salsa", quantity: "0.5", unit: "cup" }, { name: "lime", quantity: "1", unit: "whole" }], instructions: ["Heat black beans with cumin and chili powder.", "Warm tortillas.", "Dice avocado.", "Assemble tacos with beans, avocado, and salsa.", "Squeeze lime on top."] },
        { meal_name: "Lemon Herb Salmon", meal_description: "Baked salmon with roasted vegetables", cuisine_type: "Mediterranean", prep_time_minutes: 30, calories: 520, protein_g: 40, carbs_g: 25, fat_g: 28, fiber_g: 6, ingredients: [{ name: "salmon fillet", quantity: "1", unit: "piece" }, { name: "lemon", quantity: "1", unit: "whole" }, { name: "broccoli", quantity: "1", unit: "cup" }, { name: "olive oil", quantity: "1", unit: "tbsp" }, { name: "herbs de provence", quantity: "1", unit: "tsp" }], instructions: ["Preheat oven to 400°F.", "Season salmon with lemon, olive oil, and herbs.", "Toss broccoli with olive oil and salt.", "Bake salmon and broccoli together 20 min.", "Serve with lemon wedges."] },
      ];
    }

    // Return suggestions without saving — user picks one
    return new Response(JSON.stringify({ success: true, suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("swap-meal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function categorizeIngredient(name: string): string {
  const n = name.toLowerCase();
  const produce = ["lettuce", "tomato", "onion", "garlic", "pepper", "carrot", "broccoli", "spinach", "potato", "avocado", "lime", "lemon", "cilantro", "cucumber", "zucchini", "mushroom", "celery", "ginger", "basil", "parsley", "corn", "cabbage", "kale", "bell pepper"];
  const protein = ["chicken", "beef", "pork", "salmon", "shrimp", "tofu", "turkey", "fish", "sausage", "bacon", "lamb", "tuna", "egg"];
  const dairy = ["cheese", "milk", "butter", "yogurt", "cream", "sour cream", "mozzarella", "parmesan"];
  const frozen = ["frozen", "ice cream"];
  if (produce.some(p => n.includes(p))) return "produce";
  if (protein.some(p => n.includes(p))) return "protein";
  if (dairy.some(p => n.includes(p))) return "dairy";
  if (frozen.some(p => n.includes(p))) return "frozen";
  return "pantry";
}
