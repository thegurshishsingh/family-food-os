// Send Web Push notifications to all of a user's subscribed devices.
// Uses VAPID; cleans up subscriptions returning 404/410.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const encoder = new TextEncoder();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

type PushSubscriptionLike = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type PushOptions = {
  TTL: number;
  headers: Record<string, string>;
};

type PushDeliveryError = Error & {
  statusCode?: number;
  body?: string;
  headers?: Record<string, string>;
};

type VapidKeys = {
  publicKeyBytes: Uint8Array;
  signingKey: CryptoKey;
};

let vapidKeysPromise: Promise<VapidKeys> | null = null;

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function uint32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

async function hmac(keyBytes: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
}

function getVapidKeys(): Promise<VapidKeys> {
  if (vapidKeysPromise) return vapidKeysPromise;
  vapidKeysPromise = (async () => {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) throw new Error("VAPID keys not configured");
    const publicKeyBytes = base64UrlToBytes(VAPID_PUBLIC);
    const privateKeyBytes = base64UrlToBytes(VAPID_PRIVATE);
    if (publicKeyBytes.length !== 65 || publicKeyBytes[0] !== 4) {
      throw new Error("Invalid VAPID public key");
    }
    if (privateKeyBytes.length !== 32) throw new Error("Invalid VAPID private key");

    const signingKey = await crypto.subtle.importKey(
      "jwk",
      {
        kty: "EC",
        crv: "P-256",
        x: bytesToBase64Url(publicKeyBytes.slice(1, 33)),
        y: bytesToBase64Url(publicKeyBytes.slice(33, 65)),
        d: bytesToBase64Url(privateKeyBytes),
        ext: true,
      },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );

    return { publicKeyBytes, signingKey };
  })();
  return vapidKeysPromise;
}

async function createVapidJwt(audience: string): Promise<string> {
  const { signingKey } = await getVapidKeys();
  const header = bytesToBase64Url(encoder.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = bytesToBase64Url(
    encoder.encode(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
        sub: VAPID_SUBJECT,
      })
    )
  );
  const unsigned = `${header}.${payload}`;
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, signingKey, encoder.encode(unsigned))
  );
  return `${unsigned}.${bytesToBase64Url(signature)}`;
}

const categoryColumn: Record<Category, string | null> = {
  test: null,
  dinner_reveal: "enabled_dinner_reveal",
  evening_checkin: "enabled_evening_checkin",
  weekly_plan_ready: "enabled_weekly_plan_ready",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // GET → return the VAPID public key so the frontend always uses the
  // server-configured value (avoids client/server key mismatch).
  if (req.method === "GET") {
    if (!VAPID_PUBLIC) return json({ error: "VAPID public key not configured" }, 500);
    return json({ publicKey: VAPID_PUBLIC });
  }

  try {
    const vapidErr = ensureVapid();
    if (vapidErr) return json({ error: vapidErr }, 500);

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

    // iOS-safe minimal payload. WebKit silently drops notifications when the
    // payload includes unsupported fields. Keep to title/body/url only.
    const payload = JSON.stringify({
      title: body.title,
      body: body.body,
      url: body.url ?? "/planner",
    });

    const pushOptions = {
      TTL: 60 * 60 * 24,
      headers: {
        Urgency: "high",
      },
    };

    console.log("[send-push] dispatching", {
      category: body.category,
      recipients: subs.length,
      payloadBytes: payload.length,
      payloadPreview: payload.slice(0, 300),
      pushOptions,
    });

    let sent = 0;
    let retriesAttempted = 0;
    let retriesRecovered = 0;
    const toRemove: string[] = [];
    const failures: Array<{ endpointHost: string; status?: number; message: string; attempts: number }> = [];

    // Retry transient push-service failures (5xx + 429). APNs and FCM
    // occasionally return these under load; a small bounded backoff
    // recovers most of them without hammering the service.
    const MAX_ATTEMPTS = 3;
    const isTransient = (status?: number) =>
      status === 429 || (typeof status === "number" && status >= 500 && status < 600);
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    await Promise.all(
      subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
        const endpointHost = (() => {
          try {
            return new URL(sub.endpoint).host;
          } catch {
            return "unknown";
          }
        })();
        const isApple = endpointHost.includes("push.apple.com");
        let attempt = 0;
        let lastErr:
          | { statusCode?: number; body?: string; headers?: unknown; message?: string }
          | null = null;

        while (attempt < MAX_ATTEMPTS) {
          attempt++;
          try {
            const res = await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload,
              pushOptions
            );
            sent++;
            if (attempt > 1) retriesRecovered++;
            console.log("[send-push] delivered", {
              endpointHost,
              isApple,
              statusCode: (res as { statusCode?: number })?.statusCode,
              subId: sub.id,
              attempt,
            });
            return;
          } catch (e) {
            const err = e as {
              statusCode?: number;
              body?: string;
              headers?: unknown;
              message?: string;
            };
            lastErr = err;
            const status = err.statusCode;
            const transient = isTransient(status);
            console.error("[send-push] push attempt failed", {
              endpointHost,
              isApple,
              statusCode: status,
              errorMessage: err.message,
              errorBody: err.body,
              errorHeaders: err.headers,
              subId: sub.id,
              attempt,
              willRetry: transient && attempt < MAX_ATTEMPTS,
            });
            if (!transient) break;
            if (attempt < MAX_ATTEMPTS) {
              retriesAttempted++;
              // Exponential backoff with jitter: ~250ms, ~600ms
              const base = 250 * Math.pow(2, attempt - 1);
              const jitter = Math.floor(Math.random() * 100);
              await sleep(base + jitter);
            }
          }
        }

        // All attempts exhausted (or non-transient failure)
        const status = lastErr?.statusCode;
        failures.push({
          endpointHost,
          status,
          message: lastErr?.message ?? "unknown error",
          attempts: attempt,
        });
        if (status === 404 || status === 410) {
          toRemove.push(sub.id);
        }
      })
    );

    if (toRemove.length) {
      console.log("[send-push] removing dead subscriptions", { count: toRemove.length });
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

    console.log("[send-push] summary", {
      requested: subs.length,
      sent,
      removed: toRemove.length,
      failed: failures.length,
      retriesAttempted,
      retriesRecovered,
      failures,
    });

    return json({
      sent,
      removed: toRemove.length,
      failed: failures.length,
      retries_attempted: retriesAttempted,
      retries_recovered: retriesRecovered,
      failures: failures.map((f) => ({
        endpointHost: f.endpointHost,
        status: f.status,
        message: f.message,
        attempts: f.attempts,
      })),
    });
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
