import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeLearningInsights, renderInsightsForUser } from "../_shared/learningModel.ts";

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const household_id = body.household_id;
    if (!household_id || typeof household_id !== "string") {
      return new Response(JSON.stringify({ error: "household_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify ownership
    const { data: household } = await supabaseClient
      .from("households")
      .select("id")
      .eq("id", household_id)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!household) {
      return new Response(JSON.stringify({ error: "Household not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull data: 90d feedback, 60 most recent check-ins, last 20 weeks of plan_days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const [feedbackRes, checkinsRes, plansRes] = await Promise.all([
      supabaseClient
        .from("meal_feedback")
        .select("meal_name, feedback, created_at, plan_day_id")
        .eq("household_id", household_id)
        .gte("created_at", ninetyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseClient
        .from("evening_checkins")
        .select("tags, effort_level, outcome, plan_day_id, created_at")
        .eq("household_id", household_id)
        .order("created_at", { ascending: false })
        .limit(60),
      supabaseClient
        .from("weekly_plans")
        .select("id")
        .eq("household_id", household_id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const planIds = (plansRes.data || []).map((p: any) => p.id);
    let allPlanDays: any[] = [];
    if (planIds.length) {
      const { data } = await supabaseClient
        .from("plan_days")
        .select("id, day_of_week, meal_name, cuisine_type, prep_time_minutes, meal_mode, was_swapped")
        .in("plan_id", planIds);
      allPlanDays = data || [];
    }

    const insights = computeLearningInsights({
      feedback: (feedbackRes.data || []) as any,
      checkins: (checkinsRes.data || []) as any,
      planDays: allPlanDays as any,
    });

    const userInsights = renderInsightsForUser(insights);

    return new Response(JSON.stringify({
      success: true,
      insights: userInsights,
      meta: {
        totalFeedback: insights.totalFeedback,
        totalCheckins: insights.totalCheckins,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("get-learning-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
