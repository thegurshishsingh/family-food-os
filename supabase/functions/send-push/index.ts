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
  // Optional analytics correlation id. If provided, send-push will write a
  // `delivered` row per recipient user and embed the id inside the push
  // payload so click/open events can be matched back to this dispatch.
  event_id?: string;
  // Optional event_id per user, used by the dispatcher when sending one
  // batch but wanting independent correlation ids per recipient.
  event_ids_by_user?: Record<string, string>;
  weekday?: number;
  local_hour?: number;
  local_minute?: number;
  // Per-user household-context snapshot (flags, child_age_bands, etc.) used
  // to slice analytics. Whatever the dispatcher provides is stored verbatim
  // on the delivered event row.
  context_by_user?: Record<string, Record<string, unknown>>;
}

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
  platform?: string | null;
  app_version?: string | null;
  device_id?: string | null;
};

function platformFromEndpoint(host: string): string {
  if (host.includes("push.apple.com")) return "ios";
  if (host.includes("fcm.googleapis.com") || host.includes("android.googleapis.com")) return "android";
  if (host.includes("mozilla.com") || host.includes("windows.com")) return "web";
  return "web";
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

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

function uint32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

async function hmac(keyBytes: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(keyBytes),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, toArrayBuffer(data)));
}

async function hkdfExpand(keyBytes: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const okm = await hmac(keyBytes, concatBytes(info, new Uint8Array([1])));
  return okm.slice(0, length);
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

async function encryptPushPayload(subscription: PushSubscriptionLike, payload: string): Promise<Uint8Array> {
  const { publicKeyBytes: vapidPublicKeyBytes } = await getVapidKeys();
  const userPublicKeyBytes = base64UrlToBytes(subscription.keys.p256dh);
  const authSecret = base64UrlToBytes(subscription.keys.auth);
  const userPublicKey = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(userPublicKeyBytes),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  const senderKeys = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  const senderPublicKeyBytes = new Uint8Array(await crypto.subtle.exportKey("raw", senderKeys.publicKey));
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: userPublicKey }, senderKeys.privateKey, 256)
  );

  // RFC 8291: derive the input keying material from the subscription auth
  // secret, ECDH shared secret, and both public keys.
  const prkKey = await hmac(authSecret, sharedSecret);
  const keyInfo = concatBytes(
    encoder.encode("WebPush: info\0"),
    userPublicKeyBytes,
    senderPublicKeyBytes
  );
  const ikm = await hkdfExpand(prkKey, keyInfo, 32);

  // RFC 8188 aes128gcm content coding.
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(salt, ikm);
  const cek = await hkdfExpand(prk, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdfExpand(prk, encoder.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM", length: 128 }, false, ["encrypt"]);
  const plaintext = concatBytes(encoder.encode(payload), new Uint8Array([2]));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, toArrayBuffer(plaintext)));

  const recordSize = 4096;
  return concatBytes(salt, uint32(recordSize), new Uint8Array([senderPublicKeyBytes.length]), senderPublicKeyBytes, ciphertext);
}

async function sendWebPush(
  subscription: PushSubscriptionLike,
  payload: string,
  options: PushOptions
): Promise<{ statusCode: number }> {
  const endpoint = new URL(subscription.endpoint);
  const jwt = await createVapidJwt(endpoint.origin);
  const encryptedPayload = await encryptPushPayload(subscription, payload);
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      ...options.headers,
      TTL: String(options.TTL),
      Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
    },
    body: encryptedPayload,
  });

  if (!response.ok) {
    const err = new Error(`Push service returned HTTP ${response.status}`) as PushDeliveryError;
    err.statusCode = response.status;
    err.body = await response.text().catch(() => undefined);
    err.headers = Object.fromEntries(response.headers.entries());
    throw err;
  }

  return { statusCode: response.status };
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
    await getVapidKeys();

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
      .select(
        "id, endpoint, p256dh, auth, user_id, platform, app_version, device_id, " +
          Object.values(categoryColumn).filter(Boolean).join(", ")
      );

    if (body.user_id) query = query.eq("user_id", body.user_id);
    else if (body.user_ids?.length) query = query.in("user_id", body.user_ids);
    else return json({ error: "user_id or user_ids required" }, 400);

    const filterCol = categoryColumn[body.category];
    if (filterCol) query = query.eq(filterCol, true);

    const { data: subsData, error } = await query;
    if (error) return json({ error: error.message }, 500);
    const subs = (subsData ?? []) as unknown as PushSubscriptionRow[];
    if (!subs?.length) return json({ sent: 0, removed: 0 });

    // Resolve a per-user event_id for analytics correlation. Three modes:
    //   1. body.event_ids_by_user provides one id per user (used by the
    //      cron dispatcher for batch sends).
    //   2. body.event_id provides a single id (single-user send).
    //   3. Neither — generate one per user, scoped to this dispatch.
    const trackedCategories = new Set(["dinner_reveal", "evening_checkin", "weekly_plan_ready"]);
    const trackThis = trackedCategories.has(body.category);
    const eventIdForUser = (uid: string): string | null => {
      if (!trackThis) return null;
      if (body.event_ids_by_user?.[uid]) return body.event_ids_by_user[uid];
      if (body.event_id && (body.user_id === uid || subs.length === 1)) return body.event_id;
      return crypto.randomUUID();
    };
    const userEventIds = new Map<string, string | null>();
    for (const s of subs) {
      if (!userEventIds.has(s.user_id)) userEventIds.set(s.user_id, eventIdForUser(s.user_id));
    }

    // Build the push payload per-user (event_id varies). Same encoding as
    // before — kept minimal for iOS compatibility (title/body/url only),
    // event_id is appended to the URL so the SW + frontend can pick it up
    // without needing extra fields that WebKit might strip.
    const baseUrl = body.url ?? "/planner";
    const payloadFor = (uid: string): string => {
      const evt = userEventIds.get(uid);
      let url = baseUrl;
      if (evt) {
        const sep = url.includes("?") ? "&" : "?";
        url = `${url}${sep}npx_evt=${evt}`;
      }
      return JSON.stringify({
        title: body.title,
        body: body.body,
        url,
      });
    };

    const pushOptions = {
      TTL: 60 * 60 * 24,
      headers: {
        Urgency: "high",
      },
    };

    console.log("[send-push] dispatching", {
      category: body.category,
      recipients: subs.length,
      uniqueUsers: userEventIds.size,
      tracked: trackThis,
      pushOptions,
    });

    let sent = 0;
    let retriesAttempted = 0;
    let retriesRecovered = 0;
    const toRemove: string[] = [];
    const failures: Array<{ endpointHost: string; status?: number; message: string; attempts: number }> = [];
    // One delivered analytics row per device (subscription) that received the
    // push, so we can slice metrics by platform / app version.
    const deliveredSubs: Array<{ sub: PushSubscriptionRow; endpointHost: string }> = [];

    // Retry transient push-service failures (5xx + 429). APNs and FCM
    // occasionally return these under load; a small bounded backoff
    // recovers most of them without hammering the service.
    const MAX_ATTEMPTS = 3;
    const isTransient = (status?: number) =>
      status === 429 || (typeof status === "number" && status >= 500 && status < 600);
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    await Promise.all(
      subs.map(async (sub) => {
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
            const res = await sendWebPush(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payloadFor(sub.user_id),
              pushOptions
            );
            sent++;
            deliveredSubs.push({ sub, endpointHost });
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
          subs.map((s) => s.id).filter((id) => !toRemove.includes(id))
        );
    }

    // Analytics: one `delivered` event PER DEVICE so we can break down
    // delivery / engagement by platform and app_version. Idempotent on
    // (event_id, event_type, subscription_id).
    if (trackThis && deliveredSubs.length > 0) {
      const rows: Array<Record<string, unknown>> = [];
      for (const { sub, endpointHost } of deliveredSubs) {
        const evt = userEventIds.get(sub.user_id);
        if (!evt) continue;
        const platform = sub.platform && sub.platform !== "unknown"
          ? sub.platform
          : platformFromEndpoint(endpointHost);
        rows.push({
          event_id: evt,
          user_id: sub.user_id,
          subscription_id: sub.id,
          category: body.category,
          event_type: "delivered",
          weekday: typeof body.weekday === "number" ? body.weekday : null,
          local_hour: typeof body.local_hour === "number" ? body.local_hour : null,
          local_minute: typeof body.local_minute === "number" ? body.local_minute : null,
          platform,
          app_version: sub.app_version ?? null,
          device_id: sub.device_id ?? null,
          endpoint_host: endpointHost,
          metadata: {},
        });
      }
      if (rows.length) {
        const { error: evtErr } = await supabase
          .from("push_notification_events")
          .upsert(rows, {
            onConflict: "event_id,event_type,subscription_id",
            ignoreDuplicates: true,
          });
        if (evtErr) {
          console.error("[send-push] failed to log delivered events", evtErr);
        } else {
          console.log("[send-push] logged delivered events", { count: rows.length });
        }
      }
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
