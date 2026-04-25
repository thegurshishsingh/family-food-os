import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  VAPID_PUBLIC_KEY,
  arrayBufferToBase64,
  getBrowserTimezone,
  isPushSupported,
  urlBase64ToUint8Array,
} from "@/lib/push";
import { useAuth } from "@/hooks/useAuth";

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
    if (!VAPID_PUBLIC_KEY) {
      console.error("[push] VITE_VAPID_PUBLIC_KEY is not set");
      return false;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "default");
        return false;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
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
