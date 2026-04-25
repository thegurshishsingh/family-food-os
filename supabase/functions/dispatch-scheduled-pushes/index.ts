// Cron-driven dispatcher: every 15 minutes, find subscriptions whose local time
// just crossed 1:00 PM (dinner reveal) or 7:30 PM (evening check-in), and trigger
// pushes via the send-push function. Per-user timezone aware.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Slot = "dinner_reveal" | "evening_checkin";

interface SlotConfig {
  hour: number;
  minute: number;
  column: string;
  title: string;
  body: string;
  url: string;
}

const SLOTS: Record<Slot, SlotConfig> = {
  dinner_reveal: {
    hour: 13,
    minute: 0,
    column: "enabled_dinner_reveal",
    title: "Tonight's dinner 🍽️",
    body: "Tap to see what's on the plan and prep ahead.",
    url: "/planner",
  },
  evening_checkin: {
    hour: 19,
    minute: 30,
    column: "enabled_evening_checkin",
    title: "How did dinner go?",
    body: "Quick check-in helps us plan smarter next week.",
    url: "/planner",
  },
};

// Returns local hour and minute for a given timezone, "now"
function localHM(timezone: string, now: Date): { hour: number; minute: number } | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "", 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return { hour, minute };
  } catch {
    return null;
  }
}

// True if the slot time falls inside [now - windowMin, now]
function slotJustPassed(
  local: { hour: number; minute: number },
  slot: SlotConfig,
  windowMin: number
): boolean {
  const localTotal = local.hour * 60 + local.minute;
  const slotTotal = slot.hour * 60 + slot.minute;
  const diff = localTotal - slotTotal;
  return diff >= 0 && diff < windowMin;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const now = new Date();
  // Window must match cron interval. Cron runs every 15 min → use 15.
  const WINDOW_MIN = 15;

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("user_id, timezone, enabled_dinner_reveal, enabled_evening_checkin");

  if (error) {
    return json({ error: error.message }, 500);
  }
  if (!subs?.length) return json({ checked: 0, dispatched: 0 });

  // Group user_ids by slot to dispatch
  const byUser: Record<string, { tz: string; dinner: boolean; checkin: boolean }> = {};
  for (const s of subs) {
    if (!byUser[s.user_id]) {
      byUser[s.user_id] = { tz: s.timezone || "UTC", dinner: false, checkin: false };
    }
    if (s.enabled_dinner_reveal) byUser[s.user_id].dinner = true;
    if (s.enabled_evening_checkin) byUser[s.user_id].checkin = true;
  }

  const dinnerUsers: string[] = [];
  const checkinUsers: string[] = [];

  for (const [userId, info] of Object.entries(byUser)) {
    const local = localHM(info.tz, now);
    if (!local) continue;
    if (info.dinner && slotJustPassed(local, SLOTS.dinner_reveal, WINDOW_MIN)) {
      dinnerUsers.push(userId);
    }
    if (info.checkin && slotJustPassed(local, SLOTS.evening_checkin, WINDOW_MIN)) {
      checkinUsers.push(userId);
    }
  }

  let dispatched = 0;
  for (const [slot, ids] of [
    ["dinner_reveal", dinnerUsers] as const,
    ["evening_checkin", checkinUsers] as const,
  ]) {
    if (!ids.length) continue;
    const cfg = SLOTS[slot];
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        user_ids: ids,
        category: slot,
        title: cfg.title,
        body: cfg.body,
        url: cfg.url,
      }),
    });
    if (res.ok) dispatched += ids.length;
    else console.error("[dispatcher] send-push failed", await res.text());
  }

  return json({
    checked: Object.keys(byUser).length,
    dinner: dinnerUsers.length,
    checkin: checkinUsers.length,
    dispatched,
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
