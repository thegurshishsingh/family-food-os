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

  // Build a per-user household-context snapshot once. We send the same
  // snapshot for every slot in this tick so analytics rows can be filtered
  // by context (budget_week, low_cleanup, sick, child age bands, etc.).
  const allUserIds = Array.from(
    new Set([
      ...dinnerTargets.map((t) => t.user_id),
      ...checkinTargets.map((t) => t.user_id),
      ...weeklyTargets.map((t) => t.user_id),
    ])
  );
  const contextByUser = await buildContextByUser(supabase, allUserIds, now);

  // Look up tonight's dinner per user so dinner_reveal + evening_checkin
  // pushes can name the actual dish (e.g. "Tonight's dinner: Chicken Tikka").
  // Only needed for users receiving one of those two slots.
  const dinnerSlotUserIds = Array.from(
    new Set([
      ...dinnerTargets.map((t) => t.user_id),
      ...checkinTargets.map((t) => t.user_id),
    ])
  );
  // Each target carries the user's local weekday, but it's the same for
  // both dinner & checkin slots in this tick. Map user → local weekday from
  // whichever target we have first.
  const localWeekdayByUser = new Map<string, number>();
  for (const t of [...dinnerTargets, ...checkinTargets]) {
    if (!localWeekdayByUser.has(t.user_id)) localWeekdayByUser.set(t.user_id, t.weekday);
  }
  const tonightMealByUser = await buildTonightMealByUser(
    supabase,
    dinnerSlotUserIds,
    localWeekdayByUser,
    now
  );

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

      // Pass only this group's user contexts to keep the payload small.
      const contextForGroup: Record<string, unknown> = {};
      for (const uid of ids) {
        if (contextByUser[uid]) contextForGroup[uid] = contextByUser[uid];
      }

      // Personalize dinner_reveal and evening_checkin copy with tonight's
      // dish name, when we found one for the user.
      const titleByUser: Record<string, string> = {};
      const bodyByUser: Record<string, string> = {};
      if (slot === "dinner_reveal" || slot === "evening_checkin") {
        for (const uid of ids) {
          const meal = tonightMealByUser[uid];
          if (!meal) continue;
          if (slot === "dinner_reveal") {
            titleByUser[uid] = `Tonight's dinner: ${meal} 🍽️`;
            bodyByUser[uid] = "Tap to see the recipe and prep ahead.";
          } else {
            titleByUser[uid] = `How was ${meal}?`;
            bodyByUser[uid] = "Quick check-in helps us plan smarter next week.";
          }
        }
      }

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
          context_by_user: contextForGroup,
          title_by_user: titleByUser,
          body_by_user: bodyByUser,
        }),
      });
      if (res.ok) dispatched += ids.length;
      else console.error("[dispatcher] send-push failed", await res.text());
    }
  }

  return json({
    checked: Object.keys(byUser).length,
    dinner: dinnerTargets.length,
    checkin: checkinTargets.length,
    weekly: weeklyTargets.length,
    dispatched,
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type SupabaseAdmin = ReturnType<typeof createClient>;

// Build the household-context snapshot used to tag analytics events. We
// gather the active weekly_contexts row (if any) plus the household's child
// age bands and adult/child counts. The snapshot is small + denormalised so
// the analytics UI can filter without joining tables months later, even
// after the user changes their household composition.
async function buildContextByUser(
  supabase: SupabaseAdmin,
  userIds: string[],
  now: Date
): Promise<Record<string, Record<string, unknown>>> {
  if (!userIds.length) return {};

  // 1. Households for these users
  const { data: households, error: hhErr } = await supabase
    .from("households")
    .select("id, owner_id, num_adults, num_children, child_age_bands")
    .in("owner_id", userIds);
  if (hhErr) {
    console.error("[dispatcher] households lookup failed", hhErr);
    return {};
  }
  const householdsByUser = new Map<string, {
    id: string;
    num_adults: number | null;
    num_children: number | null;
    child_age_bands: string[] | null;
  }>();
  for (const h of households ?? []) {
    householdsByUser.set(h.owner_id as string, {
      id: h.id as string,
      num_adults: h.num_adults as number | null,
      num_children: h.num_children as number | null,
      child_age_bands: (h.child_age_bands as string[] | null) ?? [],
    });
  }

  // 2. Most recent weekly_context whose week_start is on/before today, per
  //    household. We pull the last 8 weeks for these households and pick the
  //    latest applicable one in JS — keeps the query simple + indexable.
  const householdIds = Array.from(householdsByUser.values()).map((h) => h.id);
  const todayIso = now.toISOString().slice(0, 10);
  let contexts: Array<Record<string, unknown>> = [];
  if (householdIds.length) {
    const since = new Date(now);
    since.setDate(since.getDate() - 56);
    const { data: ctxRows, error: ctxErr } = await supabase
      .from("weekly_contexts")
      .select(
        "household_id, week_start, budget_week, low_cleanup_week, sick_week, chaotic_week, sports_week, newborn_in_house, guests_visiting, one_parent_traveling, high_protein_week"
      )
      .in("household_id", householdIds)
      .gte("week_start", since.toISOString().slice(0, 10))
      .lte("week_start", todayIso)
      .order("week_start", { ascending: false });
    if (ctxErr) {
      console.error("[dispatcher] weekly_contexts lookup failed", ctxErr);
    } else {
      contexts = ctxRows ?? [];
    }
  }
  const ctxByHousehold = new Map<string, Record<string, unknown>>();
  for (const c of contexts) {
    const hid = c.household_id as string;
    if (!ctxByHousehold.has(hid)) ctxByHousehold.set(hid, c); // first match = most recent
  }

  const FLAG_KEYS = [
    "budget_week",
    "low_cleanup_week",
    "sick_week",
    "chaotic_week",
    "sports_week",
    "newborn_in_house",
    "guests_visiting",
    "one_parent_traveling",
    "high_protein_week",
  ] as const;

  const result: Record<string, Record<string, unknown>> = {};
  for (const uid of userIds) {
    const hh = householdsByUser.get(uid);
    if (!hh) continue;
    const ctx = ctxByHousehold.get(hh.id) ?? {};
    const flags: string[] = [];
    for (const k of FLAG_KEYS) if (ctx[k] === true) flags.push(k);
    result[uid] = {
      flags,
      child_age_bands: hh.child_age_bands ?? [],
      num_adults: hh.num_adults,
      num_children: hh.num_children,
      has_kids: (hh.num_children ?? 0) > 0,
    };
  }
  return result;
}

// Look up tonight's dinner per user. Returns a map user_id → meal_name.
// `localWeekdayByUser` uses the JS convention (0=Sunday…6=Saturday) but
// plan_days.day_of_week uses 0=Monday…6=Sunday, so we convert.
async function buildTonightMealByUser(
  supabase: SupabaseAdmin,
  userIds: string[],
  localWeekdayByUser: Map<string, number>,
  now: Date
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (!userIds.length) return out;

  const { data: households } = await supabase
    .from("households")
    .select("id, owner_id")
    .in("owner_id", userIds);
  const hhByUser = new Map<string, string>();
  for (const h of households ?? []) hhByUser.set(h.owner_id as string, h.id as string);
  const householdIds = Array.from(new Set(hhByUser.values()));
  if (!householdIds.length) return out;

  // Pull this week's plans (week_start within last 13 days covers Mon-start
  // and Sun-start weeks, plus any tz lag).
  const since = new Date(now);
  since.setDate(since.getDate() - 13);
  const { data: plans } = await supabase
    .from("weekly_plans")
    .select("id, household_id, week_start")
    .in("household_id", householdIds)
    .gte("week_start", since.toISOString().slice(0, 10))
    .order("week_start", { ascending: false });
  if (!plans?.length) return out;

  // Most recent plan per household.
  const latestPlanByHh = new Map<string, string>();
  for (const p of plans) {
    const hid = p.household_id as string;
    if (!latestPlanByHh.has(hid)) latestPlanByHh.set(hid, p.id as string);
  }
  const planIds = Array.from(latestPlanByHh.values());
  if (!planIds.length) return out;

  const { data: days } = await supabase
    .from("plan_days")
    .select("plan_id, day_of_week, meal_name, meal_mode")
    .in("plan_id", planIds);
  if (!days?.length) return out;

  // index: plan_id + day_of_week → meal_name
  const mealKey = (planId: string, dow: number) => `${planId}:${dow}`;
  const mealMap = new Map<string, string>();
  for (const d of days) {
    const name = (d.meal_name as string | null)?.trim();
    const mode = (d.meal_mode as string | null) ?? "cook";
    if (!name) continue;
    if (mode === "skip") continue; // no dinner planned
    mealMap.set(mealKey(d.plan_id as string, d.day_of_week as number), name);
  }

  for (const uid of userIds) {
    const hid = hhByUser.get(uid);
    if (!hid) continue;
    const planId = latestPlanByHh.get(hid);
    if (!planId) continue;
    const jsWeekday = localWeekdayByUser.get(uid);
    if (jsWeekday === undefined) continue;
    // JS: 0=Sun…6=Sat → plan: 0=Mon…6=Sun
    const planDow = (jsWeekday + 6) % 7;
    const meal = mealMap.get(mealKey(planId, planDow));
    if (meal) out[uid] = meal;
  }
  return out;
}
