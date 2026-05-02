import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  arrayBufferToBase64,
  getBrowserTimezone,
  isPushSupported,
  urlBase64ToUint8Array,
} from "@/lib/push";
import { useAuth } from "@/hooks/useAuth";

// Fetch the VAPID public key from the server so the client always uses the
// same key the server signs with. Avoids client/server key mismatch when
// keys are rotated.
async function fetchVapidPublicKey(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("send-push", {
      method: "GET",
    });
    if (error) {
      console.error("[push] failed to fetch VAPID public key", error);
      return null;
    }
    return (data as { publicKey?: string })?.publicKey ?? null;
  } catch (e) {
    console.error("[push] failed to fetch VAPID public key", e);
    return null;
  }
}

type Status = "loading" | "unsupported" | "denied" | "default" | "subscribed";

export function usePushNotifications() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    const permission = Notification.permission;
    if (permission === "denied") {
      setStatus("denied");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setEndpoint(sub.endpoint);
        setStatus("subscribed");
      } else {
        setStatus(permission === "granted" ? "default" : "default");
      }
    } catch {
      setStatus("default");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (!isPushSupported()) {
      setStatus("unsupported");
      return false;
    }
    // VAPID public key is fetched from the server below.
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "default");
        return false;
      }

      const vapidPublicKey = await fetchVapidPublicKey();
      if (!vapidPublicKey) {
        console.error("[push] VAPID public key unavailable");
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      // If a subscription exists but was created with a different VAPID key,
      // it must be re-subscribed (e.g. after key rotation). Unsubscribe and
      // recreate so the server can encrypt push payloads correctly.
      if (sub) {
        const existingKey = arrayBufferToBase64(sub.options.applicationServerKey ?? null);
        const expectedKey = arrayBufferToBase64(
          urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer
        );
        if (existingKey !== expectedKey) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          await sub.unsubscribe();
          sub = null;
        }
      }

      if (!sub) {
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          // Cast to BufferSource — TS DOM lib types are stricter than the runtime requirement
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      }

      const json = sub.toJSON();
      const p256dh = json.keys?.p256dh ?? arrayBufferToBase64(sub.getKey("p256dh"));
      const auth = json.keys?.auth ?? arrayBufferToBase64(sub.getKey("auth"));

      const { error } = await supabase
        .from("push_subscriptions")
        .upsert(
          {
            user_id: user.id,
            endpoint: sub.endpoint,
            p256dh,
            auth,
            user_agent: navigator.userAgent,
            timezone: getBrowserTimezone(),
            last_used_at: new Date().toISOString(),
          },
          { onConflict: "endpoint" }
        );
      if (error) {
        console.error("[push] save subscription failed", error);
        return false;
      }
      setEndpoint(sub.endpoint);
      setStatus("subscribed");
      return true;
    } catch (e) {
      console.error("[push] subscribe failed", e);
      return false;
    } finally {
      setBusy(false);
    }
  }, [user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setEndpoint(null);
      setStatus("default");
      return true;
    } catch (e) {
      console.error("[push] unsubscribe failed", e);
      return false;
    } finally {
      setBusy(false);
    }
  }, [user]);

  const sendTest = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase.functions.invoke("send-push", {
      body: {
        user_id: user.id,
        category: "test",
        title: "Hello from Family Food OS 👋",
        body: "Notifications are working. We'll only ping you when it matters.",
        url: "/planner",
      },
    });
    if (error) {
      console.error("[push] test send failed", error);
      return false;
    }
    return true;
  }, [user]);

  const updatePreferences = useCallback(
    async (prefs: {
      enabled_dinner_reveal?: boolean;
      enabled_evening_checkin?: boolean;
      enabled_weekly_plan_ready?: boolean;
      dinner_reveal_time?: string;
      evening_checkin_time?: string;
      weekly_plan_ready_time?: string;
      weekly_plan_ready_days?: number[];
    }): Promise<boolean> => {
      if (!user) return false;
      const { error } = await supabase
        .from("push_subscriptions")
        .update(prefs)
        .eq("user_id", user.id);
      return !error;
    },
    [user]
  );

  return {
    status,
    endpoint,
    busy,
    refresh,
    subscribe,
    unsubscribe,
    sendTest,
    updatePreferences,
  };
}
