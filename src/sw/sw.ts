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
  let data: PushPayload = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Family Food OS", body: event.data?.text() ?? "" };
  }

  const title = data.title || "Family Food OS";
  const options: NotificationOptions = {
    body: data.body || "",
    icon: data.icon || "/pwa-icon-192.png",
    badge: data.badge || "/pwa-icon-192.png",
    tag: data.tag || "family-food-os",
    data: { url: data.url || "/planner" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data as { url?: string })?.url || "/planner";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        const url = new URL(client.url);
        if (url.pathname === targetUrl && "focus" in client) {
          return client.focus();
        }
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
