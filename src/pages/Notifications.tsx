import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePushNotifications } from "@/hooks/usePushNotifications";

type Prefs = {
  enabled_dinner_reveal: boolean;
  enabled_evening_checkin: boolean;
  enabled_weekly_plan_ready: boolean;
  dinner_reveal_time: string;
  evening_checkin_time: string;
  weekly_plan_ready_time: string;
  weekly_plan_ready_days: number[];
};

const DEFAULTS: Prefs = {
  enabled_dinner_reveal: true,
  enabled_evening_checkin: true,
  enabled_weekly_plan_ready: true,
  dinner_reveal_time: "13:00",
  evening_checkin_time: "19:30",
  weekly_plan_ready_time: "09:00",
  weekly_plan_ready_days: [0],
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// DB stores 0=Sun..6=Sat (smallint default ARRAY[0]). Convert to Mon-first for UI.
const dbToUi = (d: number) => (d === 0 ? 6 : d - 1);
const uiToDb = (d: number) => (d === 6 ? 0 : d + 1);

const toHHMM = (t: string | null | undefined, fallback: string) => {
  if (!t) return fallback;
  // postgres time may come as "HH:MM:SS"
  return t.length >= 5 ? t.slice(0, 5) : fallback;
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { status, busy, subscribe, unsubscribe, sendTest, updatePreferences } =
    usePushNotifications();

  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("push_subscriptions")
        .select(
          "enabled_dinner_reveal, enabled_evening_checkin, enabled_weekly_plan_ready, dinner_reveal_time, evening_checkin_time, weekly_plan_ready_time, weekly_plan_ready_days"
        )
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setPrefs({
          enabled_dinner_reveal: data.enabled_dinner_reveal,
          enabled_evening_checkin: data.enabled_evening_checkin,
          enabled_weekly_plan_ready: data.enabled_weekly_plan_ready,
          dinner_reveal_time: toHHMM(data.dinner_reveal_time, DEFAULTS.dinner_reveal_time),
          evening_checkin_time: toHHMM(data.evening_checkin_time, DEFAULTS.evening_checkin_time),
          weekly_plan_ready_time: toHHMM(data.weekly_plan_ready_time, DEFAULTS.weekly_plan_ready_time),
          weekly_plan_ready_days: (data.weekly_plan_ready_days ?? [0]) as number[],
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const update = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const toggleDay = (uiDay: number) => {
    const dbDay = uiToDb(uiDay);
    setPrefs((p) => {
      const has = p.weekly_plan_ready_days.includes(dbDay);
      const next = has
        ? p.weekly_plan_ready_days.filter((d) => d !== dbDay)
        : [...p.weekly_plan_ready_days, dbDay].sort();
      return { ...p, weekly_plan_ready_days: next.length ? next : [0] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await updatePreferences({
      enabled_dinner_reveal: prefs.enabled_dinner_reveal,
      enabled_evening_checkin: prefs.enabled_evening_checkin,
      enabled_weekly_plan_ready: prefs.enabled_weekly_plan_ready,
      dinner_reveal_time: prefs.dinner_reveal_time + ":00",
      evening_checkin_time: prefs.evening_checkin_time + ":00",
      weekly_plan_ready_time: prefs.weekly_plan_ready_time + ":00",
      weekly_plan_ready_days: prefs.weekly_plan_ready_days,
    });
    setSaving(false);
    toast(
      ok
        ? { title: "Notification settings saved" }
        : { variant: "destructive", title: "Couldn't save", description: "Try again." }
    );
  };

  const handleSubscribe = async () => {
    const ok = await subscribe();
    toast(
      ok
        ? { title: "Notifications on", description: "We'll only ping you when it matters." }
        : { variant: "destructive", title: "Couldn't enable notifications" }
    );
  };

  const handleUnsubscribe = async () => {
    const ok = await unsubscribe();
    if (ok) toast({ title: "Notifications turned off on this device" });
  };

  const handleTest = async () => {
    const ok = await sendTest();
    toast(
      ok
        ? { title: "Test sent", description: "Check your notifications." }
        : { variant: "destructive", title: "Couldn't send test" }
    );
  };

  const isSubscribed = status === "subscribed";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Notifications & Check-ins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose when Family Food OS nudges you. Turn anything off whenever you want.
          </p>
        </div>

        {/* Master toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isSubscribed ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-muted-foreground" />}
              Notifications on this device
            </CardTitle>
            <CardDescription>
              {status === "unsupported"
                ? "This browser doesn't support push notifications. Add Family Food OS to your Home Screen for the best experience."
                : status === "denied"
                ? "Notifications are blocked in your browser settings. Enable them there to continue."
                : isSubscribed
                ? "You're all set. Customize the times below."
                : "Allow notifications to enable dinner reminders and check-ins."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {!isSubscribed && status !== "unsupported" && status !== "denied" && (
              <Button onClick={handleSubscribe} disabled={busy} className="gap-2">
                <Bell className="w-4 h-4" /> Enable notifications
              </Button>
            )}
            {isSubscribed && (
              <>
                <Button onClick={handleTest} variant="outline" className="gap-2">
                  <Send className="w-4 h-4" /> Send test
                </Button>
                <Button onClick={handleUnsubscribe} variant="ghost" disabled={busy} className="gap-2 text-destructive hover:text-destructive">
                  <BellOff className="w-4 h-4" /> Turn off on this device
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className={!isSubscribed ? "opacity-60 pointer-events-none" : ""}>
          <CardHeader>
            <CardTitle className="text-lg">Reminder times</CardTitle>
            <CardDescription>Tune each reminder. Toggle any of them off individually.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dinner reveal */}
            <ReminderRow
              title="Today's dinner reveal"
              description="A morning nudge so you know what's for dinner."
              enabled={prefs.enabled_dinner_reveal}
              onEnabledChange={(v) => update("enabled_dinner_reveal", v)}
              time={prefs.dinner_reveal_time}
              onTimeChange={(v) => update("dinner_reveal_time", v)}
              loading={loading}
            />

            {/* Evening check-in */}
            <ReminderRow
              title="Evening check-in"
              description="A quick tap after dinner so next week's plan gets smarter."
              enabled={prefs.enabled_evening_checkin}
              onEnabledChange={(v) => update("enabled_evening_checkin", v)}
              time={prefs.evening_checkin_time}
              onTimeChange={(v) => update("evening_checkin_time", v)}
              loading={loading}
            />

            {/* Weekly plan ready */}
            <div className="space-y-3">
              <ReminderRow
                title="Weekly plan ready"
                description="When your fresh weekly plan is ready to review."
                enabled={prefs.enabled_weekly_plan_ready}
                onEnabledChange={(v) => update("enabled_weekly_plan_ready", v)}
                time={prefs.weekly_plan_ready_time}
                onTimeChange={(v) => update("weekly_plan_ready_time", v)}
                loading={loading}
              />
              {prefs.enabled_weekly_plan_ready && (
                <div className="pl-1">
                  <Label className="text-xs text-muted-foreground">Days</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {DAY_LABELS.map((label, uiDay) => {
                      const active = prefs.weekly_plan_ready_days.includes(uiToDb(uiDay));
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleDay(uiDay)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving || loading} className="w-full sm:w-auto">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

const ReminderRow = ({
  title,
  description,
  enabled,
  onEnabledChange,
  time,
  onTimeChange,
  loading,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  time: string;
  onTimeChange: (v: string) => void;
  loading: boolean;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-5 border-b last:border-b-0 last:pb-0">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={onEnabledChange} disabled={loading} />
        <Label className="font-medium text-foreground">{title}</Label>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 sm:ml-12">{description}</p>
    </div>
    <Input
      type="time"
      value={time}
      onChange={(e) => onTimeChange(e.target.value)}
      disabled={!enabled || loading}
      className="w-32 sm:ml-4"
    />
  </div>
);

export default NotificationsPage;
