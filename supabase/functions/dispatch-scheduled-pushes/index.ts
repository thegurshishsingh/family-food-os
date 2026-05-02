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

type Slot = "dinner_reveal" | "evening_checkin" | "weekly_plan_ready";

interface SlotConfig {
  defaultHour: number;
  defaultMinute: number;
  title: string;
  body: string;
  url: string;
}

const SLOTS: Record<Slot, SlotConfig> = {
  dinner_reveal: {
    defaultHour: 13,
    defaultMinute: 0,
    title: "Tonight's dinner 🍽️",
    body: "Tap to see what's on the plan and prep ahead.",
    url: "/planner",
  },
  evening_checkin: {
    defaultHour: 19,
    defaultMinute: 30,
    title: "How did dinner go?",
    body: "Quick check-in helps us plan smarter next week.",
    url: "/planner",
  },
  weekly_plan_ready: {
    defaultHour: 9,
    defaultMinute: 0,
    title: "Time to plan next week 📅",
    body: "Set up dinners for the week ahead in a couple of taps.",
    url: "/planner",
  },
};

// Parse a Postgres `time` string like "13:00" or "19:30:00" into hour/minute.
function parseTime(value: string | null | undefined, fallback: { hour: number; minute: number }): { hour: number; minute: number } {
  if (!value) return fallback;
  const m = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!m) return fallback;
  const hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return fallback;
  return { hour, minute };
}

// Returns local hour, minute and weekday (0=Sun…6=Sat) for a given timezone, "now"
function localHMW(
  timezone: string,
  now: Date
): { hour: number; minute: number; weekday: number } | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "", 10);
    const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
    const weekdayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const weekday = weekdayMap[wd];
    if (Number.isNaN(hour) || Number.isNaN(minute) || weekday === undefined) return null;
    return { hour, minute, weekday };
  } catch {
    return null;
  }
}

// True if the slot time falls inside [now - windowMin, now]
function slotJustPassed(
  local: { hour: number; minute: number },
  slotHour: number,
  slotMinute: number,
  windowMin: number
): boolean {
  const localTotal = local.hour * 60 + local.minute;
  const slotTotal = slotHour * 60 + slotMinute;
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
    .select(
      "user_id, timezone, enabled_dinner_reveal, enabled_evening_checkin, enabled_weekly_plan_ready, dinner_reveal_time, evening_checkin_time, weekly_plan_ready_time, weekly_plan_ready_days"
    );

  if (error) {
    return json({ error: error.message }, 500);
  }
  if (!subs?.length) return json({ checked: 0, dispatched: 0 });

  // Group user_ids by slot. Each user picks the EARLIEST configured time across
  // their devices for a given slot — we only want one ping per slot per user.
  const byUser: Record<
    string,
    {
      tz: string;
      dinner?: { hour: number; minute: number };
      checkin?: { hour: number; minute: number };
      weekly?: { hour: number; minute: number; days: Set<number> };
    }
  > = {};
  for (const s of subs) {
    if (!byUser[s.user_id]) byUser[s.user_id] = { tz: s.timezone || "UTC" };
    if (s.enabled_dinner_reveal) {
      const t = parseTime(s.dinner_reveal_time as string | null, {
        hour: SLOTS.dinner_reveal.defaultHour,
        minute: SLOTS.dinner_reveal.defaultMinute,
      });
      const cur = byUser[s.user_id].dinner;
      if (!cur || t.hour * 60 + t.minute < cur.hour * 60 + cur.minute) {
        byUser[s.user_id].dinner = t;
      }
    }
    if (s.enabled_evening_checkin) {
      const t = parseTime(s.evening_checkin_time as string | null, {
        hour: SLOTS.evening_checkin.defaultHour,
        minute: SLOTS.evening_checkin.defaultMinute,
      });
      const cur = byUser[s.user_id].checkin;
      if (!cur || t.hour * 60 + t.minute < cur.hour * 60 + cur.minute) {
        byUser[s.user_id].checkin = t;
      }
    }
    if (s.enabled_weekly_plan_ready) {
      const t = parseTime(s.weekly_plan_ready_time as string | null, {
        hour: SLOTS.weekly_plan_ready.defaultHour,
        minute: SLOTS.weekly_plan_ready.defaultMinute,
      });
      const rawDays = Array.isArray(s.weekly_plan_ready_days)
        ? (s.weekly_plan_ready_days as number[])
        : [0];
      const days = new Set(
        rawDays.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      );
      if (!days.size) days.add(0);
      const cur = byUser[s.user_id].weekly;
      if (!cur) {
        byUser[s.user_id].weekly = { hour: t.hour, minute: t.minute, days };
      } else {
        // Earliest time wins; union the day sets across devices.
        if (t.hour * 60 + t.minute < cur.hour * 60 + cur.minute) {
          cur.hour = t.hour;
          cur.minute = t.minute;
        }
        for (const d of days) cur.days.add(d);
      }
    }
  }

  type DispatchTarget = {
    user_id: string;
    weekday: number;
    local_hour: number;
    local_minute: number;
  };
  const dinnerTargets: DispatchTarget[] = [];
  const checkinTargets: DispatchTarget[] = [];
  const weeklyTargets: DispatchTarget[] = [];

  for (const [userId, info] of Object.entries(byUser)) {
    const local = localHMW(info.tz, now);
    if (!local) continue;
    if (info.dinner && slotJustPassed(local, info.dinner.hour, info.dinner.minute, WINDOW_MIN)) {
      dinnerTargets.push({
        user_id: userId,
        weekday: local.weekday,
        local_hour: info.dinner.hour,
        local_minute: info.dinner.minute,
      });
    }
    if (info.checkin && slotJustPassed(local, info.checkin.hour, info.checkin.minute, WINDOW_MIN)) {
      checkinTargets.push({
        user_id: userId,
        weekday: local.weekday,
        local_hour: info.checkin.hour,
        local_minute: info.checkin.minute,
      });
    }
    if (
      info.weekly &&
      info.weekly.days.has(local.weekday) &&
      slotJustPassed(local, info.weekly.hour, info.weekly.minute, WINDOW_MIN)
    ) {
      weeklyTargets.push({
        user_id: userId,
        weekday: local.weekday,
        local_hour: info.weekly.hour,
        local_minute: info.weekly.minute,
      });
    }
  }

  let dispatched = 0;
  for (const [slot, targets] of [
    ["dinner_reveal", dinnerTargets] as const,
    ["evening_checkin", checkinTargets] as const,
    ["weekly_plan_ready", weeklyTargets] as const,
  ]) {
    if (!targets.length) continue;
    const cfg = SLOTS[slot];

    // Send-push expects a single per-call (weekday, local_hour, local_minute)
    // for analytics. Group targets by their (weekday, hour, minute) tuple so
    // the analytics rows are accurate. Most cron ticks have a single tuple per
    // slot anyway since we run every 15 minutes.
    type GroupKey = string;
    const groups = new Map<GroupKey, DispatchTarget[]>();
    for (const t of targets) {
      const key = `${t.weekday}-${t.local_hour}-${t.local_minute}`;
      const arr = groups.get(key);
      if (arr) arr.push(t);
      else groups.set(key, [t]);
    }

    for (const group of groups.values()) {
      const ids = group.map((t) => t.user_id);
      // Pre-generate per-user event ids so they're stable for analytics.
      const eventIdsByUser: Record<string, string> = {};
      for (const uid of ids) eventIdsByUser[uid] = crypto.randomUUID();

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
          event_ids_by_user: eventIdsByUser,
          weekday: group[0].weekday,
          local_hour: group[0].local_hour,
          local_minute: group[0].local_minute,
        }),
      });
      if (res.ok) dispatched += ids.length;
      else console.error("[dispatcher] send-push failed", await res.text());
    }
  }

  return json({
    checked: Object.keys(byUser).length,
    dinner: dinnerUsers.length,
    checkin: checkinUsers.length,
    weekly: weeklyUsers.length,
    dispatched,
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
