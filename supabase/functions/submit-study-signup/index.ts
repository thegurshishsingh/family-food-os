import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const HOUSEHOLD_SIZES = [
  "Just me",
  "2 people",
  "3 people",
  "4 people",
  "5 people",
  "6+ people",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, email, household_type, consent, website } = body as Record<
      string,
      unknown
    >;

    // Honeypot: bots fill the hidden "website" field. Pretend success silently.
    if (typeof website === "string" && website.trim() !== "") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consent is required.
    if (consent !== true) {
      return new Response(
        JSON.stringify({ error: "Consent is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate email server-side.
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (
      normalizedEmail.length < 4 ||
      normalizedEmail.length > 255 ||
      !EMAIL_RE.test(normalizedEmail)
    ) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate optional name.
    let cleanName: string | null = null;
    if (typeof name === "string" && name.trim() !== "") {
      if (name.trim().length > 120) {
        return new Response(
          JSON.stringify({ error: "Name must be under 120 characters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      cleanName = name.trim();
    }

    // Validate optional household type against the known list.
    let cleanHousehold: string | null = null;
    if (typeof household_type === "string" && household_type.trim() !== "") {
      if (!HOUSEHOLD_SIZES.includes(household_type.trim())) {
        return new Response(
          JSON.stringify({ error: "Invalid household size" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      cleanHousehold = household_type.trim();
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { error } = await supabase.from("study_signups").insert({
      name: cleanName,
      email: normalizedEmail,
      household_type: cleanHousehold,
      consent: true,
    });

    if (error) {
      // The DB throttle trigger raises a check_violation when the same email
      // was used within the last hour.
      if (
        error.message?.includes("rate_limited") ||
        error.code === "23514"
      ) {
        return new Response(
          JSON.stringify({ error: "rate_limited" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      console.error("study signup insert failed:", error.message);
      return new Response(
        JSON.stringify({ error: "Something went wrong" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("study signup error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
