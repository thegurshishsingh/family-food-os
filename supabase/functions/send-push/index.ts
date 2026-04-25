// Send Web Push notifications to all of a user's subscribed devices.
// Uses VAPID; cleans up subscriptions returning 404/410.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Category =
  | "test"
  | "dinner_reveal"
  | "evening_checkin"
  | "weekly_plan_ready";

interface SendBody {
  user_id?: string;
  user_ids?: string[];
  category: Category;
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:hello@familyfoodos.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const categoryColumn: Record<Category, string | null> = {
  test: null,
  dinner_reveal: "enabled_dinner_reveal",
  evening_checkin: "enabled_evening_checkin",
  weekly_plan_ready: "enabled_weekly_plan_ready",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return json({ error: "VAPID keys not configured" }, 500);
    }

    const body = (await req.json()) as SendBody;
    if (!body.category || !body.title || !body.body) {
      return json({ error: "category, title, and body are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, user_id, " + Object.values(categoryColumn).filter(Boolean).join(", "));

    if (body.user_id) query = query.eq("user_id", body.user_id);
    else if (body.user_ids?.length) query = query.in("user_id", body.user_ids);
    else return json({ error: "user_id or user_ids required" }, 400);

    const filterCol = categoryColumn[body.category];
    if (filterCol) query = query.eq(filterCol, true);

    const { data: subs, error } = await query;
    if (error) return json({ error: error.message }, 500);
    if (!subs?.length) return json({ sent: 0, removed: 0 });

    const payload = JSON.stringify({
      title: body.title,
      body: body.body,
      url: body.url ?? "/planner",
      tag: body.tag ?? body.category,
    });

    let sent = 0;
    const toRemove: string[] = [];

    await Promise.all(
      subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sent++;
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            toRemove.push(sub.id);
          } else {
            console.error("[send-push] error", status, e);
          }
        }
      })
    );

    if (toRemove.length) {
      await supabase.from("push_subscriptions").delete().in("id", toRemove);
    }

    if (sent > 0) {
      await supabase
        .from("push_subscriptions")
        .update({ last_used_at: new Date().toISOString() })
        .in(
          "id",
          subs.map((s: { id: string }) => s.id).filter((id: string) => !toRemove.includes(id))
        );
    }

    return json({ sent, removed: toRemove.length });
  } catch (e) {
    console.error("[send-push] fatal", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
