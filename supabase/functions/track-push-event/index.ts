// Records a push notification interaction event (click/open) into
// public.push_notification_events. Idempotent on (event_id, event_type) so
// repeated SW callbacks or page reloads don't double-count.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

type Body = {
  event_id?: string;
  event_type?: "clicked" | "opened";
  metadata?: Record<string, unknown>;
  // Optional client-side device hints. When the event originates from the
  // service worker (notificationclick) or the page on resume, we may know
  // the current device's platform / app version even if we can't tie it
  // back to a specific subscription_id row.
  platform?: string;
  app_version?: string;
  device_id?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    if (!body.event_id || !UUID_RE.test(body.event_id)) {
      return json({ error: "valid event_id (uuid) required" }, 400);
    }
    if (body.event_type !== "clicked" && body.event_type !== "opened") {
      return json({ error: "event_type must be 'clicked' or 'opened'" }, 400);
    }

    // Resolve the user from the caller's JWT (best-effort — clicks from a
    // service-worker may not always carry one). If absent, we still record the
    // event by looking up the matching delivered row via event_id.
    const authHeader = req.headers.get("Authorization") ?? "";
    let callerUserId: string | null = null;
    if (authHeader.startsWith("Bearer ")) {
      try {
        const userClient = createClient(SUPABASE_URL, ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data } = await userClient.auth.getUser();
        callerUserId = data?.user?.id ?? null;
      } catch {
        callerUserId = null;
      }
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Look up the original delivered row(s) for this event_id. There may be
    // several (one per device the push was delivered to). Prefer matching by
    // device_id when the caller provided one — that pins the click/open to
    // the exact device.
    const { data: deliveredRows, error: lookupErr } = await admin
      .from("push_notification_events")
      .select(
        "user_id, category, weekday, local_hour, local_minute, subscription_id, platform, app_version, device_id, endpoint_host"
      )
      .eq("event_id", body.event_id)
      .eq("event_type", "delivered");
    if (lookupErr) {
      console.error("[track-push-event] lookup failed", lookupErr);
    }

    const candidates = deliveredRows ?? [];
    let delivered = candidates[0] ?? null;
    if (body.device_id) {
      const match = candidates.find((r) => r.device_id === body.device_id);
      if (match) delivered = match;
    }

    const userId = delivered?.user_id ?? callerUserId;
    if (!userId) {
      return json({ error: "could not resolve user for this event" }, 404);
    }

    // Security check: if we have both, they must match — prevents one user
    // from claiming another user's click.
    if (
      delivered?.user_id &&
      callerUserId &&
      delivered.user_id !== callerUserId
    ) {
      return json({ error: "event does not belong to caller" }, 403);
    }

    const { error: insertErr } = await admin
      .from("push_notification_events")
      .upsert(
        {
          event_id: body.event_id,
          user_id: userId,
          subscription_id: delivered?.subscription_id ?? null,
          category: delivered?.category ?? "unknown",
          event_type: body.event_type,
          weekday: delivered?.weekday ?? null,
          local_hour: delivered?.local_hour ?? null,
          local_minute: delivered?.local_minute ?? null,
          platform: body.platform ?? delivered?.platform ?? null,
          app_version: body.app_version ?? delivered?.app_version ?? null,
          device_id: body.device_id ?? delivered?.device_id ?? null,
          endpoint_host: delivered?.endpoint_host ?? null,
          metadata: body.metadata ?? {},
        },
        {
          onConflict: "event_id,event_type,subscription_id",
          ignoreDuplicates: true,
        }
      );
    if (insertErr) {
      console.error("[track-push-event] insert failed", insertErr);
      return json({ error: insertErr.message }, 500);
    }

    return json({ ok: true });
  } catch (e) {
    console.error("[track-push-event] fatal", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
