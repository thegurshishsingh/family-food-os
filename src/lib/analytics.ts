import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight analytics tracker. Writes one row per event into
 * public.analytics_events. No-ops when the user isn't signed in.
 * Failures are swallowed — analytics must never break the UX.
 */
export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_name: eventName,
      properties: properties as never,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[analytics] trackEvent failed", eventName, e);
  }
}
