import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * If the current URL contains a `?npx_evt=<uuid>` parameter (appended to the
 * notification target URL by send-push), record an `opened` event in the
 * push_notification_events table and strip the param from the URL so it
 * isn't recorded twice on refresh or shared via copy/paste.
 *
 * Idempotent server-side via the (event_id, event_type) unique index.
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
        body: { event_id: eventId, event_type: "opened" },
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
