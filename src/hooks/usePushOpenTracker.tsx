import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

declare const __APP_VERSION__: string | undefined;
const APP_VERSION: string =
  (typeof __APP_VERSION__ !== "undefined" && __APP_VERSION__) ||
  (import.meta.env.VITE_APP_VERSION as string | undefined) ||
  "dev";

function detectPlatform(ua: string): string {
  if (!ua) return "unknown";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "web";
}

function getDeviceId(): string | null {
  try {
    return window.localStorage.getItem("ffos.device_id");
  } catch {
    return null;
  }
}

/**
 * If the current URL contains a `?npx_evt=<uuid>` parameter (appended to the
 * notification target URL by send-push), record an `opened` event in the
 * push_notification_events table and strip the param from the URL so it
 * isn't recorded twice on refresh or shared via copy/paste.
 *
 * Sends platform / app_version / device_id so engagement can be sliced by
 * iOS vs Android and by app version.
 *
 * Idempotent server-side via the (event_id, event_type, subscription_id) unique index.
 */
export function usePushOpenTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const eventId = url.searchParams.get("npx_evt");
    if (!eventId) return;

    // Fire-and-forget; ignore failures.
    supabase.functions
      .invoke("track-push-event", {
        body: {
          event_id: eventId,
          event_type: "opened",
          platform: detectPlatform(navigator.userAgent),
          app_version: APP_VERSION,
          device_id: getDeviceId(),
        },
      })
      .catch((err) => {
        console.warn("[usePushOpenTracker] failed to track open", err);
      });

    // Clean up the URL so refresh / copy doesn't re-trigger.
    url.searchParams.delete("npx_evt");
    const cleaned = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "") + url.hash;
    window.history.replaceState(window.history.state, "", cleaned);
  }, []);
}
