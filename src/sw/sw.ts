/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

// Precache injected by Workbox at build time
precacheAndRoute(self.__WB_MANIFEST);

// Network-first navigation handler with offline fallback.
// Previously this served the offline shell on EVERY navigation, which made
// the app appear offline even when online (e.g. after sign-in redirect).
const offlineUrl = "/offline.html";
const navigationHandler = async ({ request }: { request: Request }) => {
  try {
    return await fetch(request);
  } catch {
    try {
      const cache = await caches.open("offline-fallback");
      const cached = await cache.match(offlineUrl);
      if (cached) return cached;
    } catch {}
    return new Response("Offline", { status: 503 });
  }
};
registerRoute(
  new NavigationRoute(navigationHandler, {
    denylist: [/^\/~oauth/, /^\/api/, /\/.*\.[a-zA-Z0-9]+$/],
  })
);

// Pre-cache offline page on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("offline-fallback").then((c) => c.add(offlineUrl)).catch(() => undefined)
  );
});

// Google Fonts caching
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new CacheFirst({
    cacheName: "google-fonts-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
);
registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "gstatic-fonts-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
);

// --- Web Push handlers ---

type PushPayload = {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
};

self.addEventListener("push", (event) => {
  const ts = new Date().toISOString();
  const hasData = !!event.data;
  let rawText = "";
  try {
    rawText = event.data ? event.data.text() : "";
  } catch (e) {
    console.warn("[sw/push] failed to read event.data.text()", e);
  }
  console.log("[sw/push] received", {
    ts,
    hasData,
    rawLength: rawText.length,
    rawPreview: rawText.slice(0, 500),
  });

  let data: PushPayload = {};
  try {
    data = rawText ? (JSON.parse(rawText) as PushPayload) : {};
  } catch (e) {
    console.warn("[sw/push] payload was not JSON, falling back to text", e);
    data = { title: "Family Food OS", body: rawText };
  }

  const title = data.title || "Family Food OS";
  // iOS-safe minimal payload: WebKit silently drops notifications when the
  // options object contains unsupported fields (actions, vibrate, image) or
  // overly large/nested `data`. Keep this strictly to title/body/icon and a
  // plain string URL in `data`.
  const options: NotificationOptions = {
    body: data.body || "",
    icon: data.icon || "/pwa-icon-192.png",
    data: data.url || "/planner",
  };

  console.log("[sw/push] showing notification", {
    title,
    titleLength: title.length,
    bodyLength: options.body?.length ?? 0,
    icon: options.icon,
    dataUrl: options.data,
    optionsKeys: Object.keys(options),
  });

  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => {
        console.log("[sw/push] showNotification resolved OK", { title });
      })
      .catch((err) => {
        console.error("[sw/push] showNotification FAILED", {
          name: (err as Error)?.name,
          message: (err as Error)?.message,
          stack: (err as Error)?.stack,
          title,
          options,
        });
      })
  );
});


// Vite injects these at build time. SUPABASE_URL/anon are public.
const SUPABASE_URL = (import.meta as unknown as { env: Record<string, string> }).env
  ?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as unknown as { env: Record<string, string> }).env
  ?.VITE_SUPABASE_PUBLISHABLE_KEY;

async function trackPushEvent(eventId: string, eventType: "clicked" | "opened") {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/track-push-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ event_id: eventId, event_type: eventType }),
      keepalive: true,
    });
  } catch (e) {
    console.warn("[sw] track-push-event failed", e);
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data;
  const targetUrl = (typeof raw === "string" ? raw : (raw as { url?: string })?.url) || "/planner";

  // Extract analytics correlation id from the URL we appended in send-push.
  let eventId: string | null = null;
  try {
    const u = new URL(targetUrl, self.location.origin);
    eventId = u.searchParams.get("npx_evt");
  } catch {
    eventId = null;
  }

  event.waitUntil(
    (async () => {
      if (eventId) {
        // Fire-and-forget click tracking — don't block window opening on it.
        trackPushEvent(eventId, "clicked");
      }
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // Match by pathname only — the npx_evt query string changes per push.
      let targetPath = targetUrl;
      try {
        targetPath = new URL(targetUrl, self.location.origin).pathname;
      } catch {}
      for (const client of allClients) {
        try {
          const url = new URL(client.url);
          if (url.pathname === targetPath && "focus" in client) {
            // Navigate the focused tab to the full URL (with npx_evt) so the
            // frontend can record an `opened` event.
            if ("navigate" in client) {
              await (client as WindowClient).navigate(targetUrl).catch(() => undefined);
            }
            return client.focus();
          }
        } catch {}
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
