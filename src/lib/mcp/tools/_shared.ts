import { createClient } from "@supabase/supabase-js";
import { type ToolContext } from "@lovable.dev/mcp-js";

// Build a Supabase client that acts as the signed-in user so RLS applies.
// Never trust user_id from tool input — always derive it from the verified token.
export function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

// Resolve the household owned by the authenticated user. Returns null if none.
export async function getUserHousehold(ctx: ToolContext) {
  const supabase = supabaseForUser(ctx);
  const { data, error } = await supabase
    .from("households")
    .select("id, name, num_adults, num_children, child_age_bands")
    .eq("owner_id", ctx.getUserId())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function dayName(dow: number): string {
  return DAY_NAMES[dow] ?? `Day ${dow}`;
}
