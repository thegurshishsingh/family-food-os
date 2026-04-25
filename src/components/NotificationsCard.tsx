import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type TestCategory = "test" | "dinner_reveal" | "evening_checkin" | "weekly_plan_ready";

const CATEGORY_OPTIONS: { value: TestCategory; label: string; title: string; body: string }[] = [
  {
    value: "test",
    label: "Generic test",
    title: "Hello from Family Food OS 👋",
    body: "Notifications are working. We'll only ping you when it matters.",
  },
  {
    value: "dinner_reveal",
    label: "1 PM dinner reveal",
    title: "Tonight's dinner is ready 🍽️",
    body: "Tap to see what's on the menu and start prepping.",
  },
  {
    value: "evening_checkin",
    label: "Evening check-in",
    title: "How did dinner go? ✨",
    body: "Take 10 seconds to log tonight — it makes next week smarter.",
  },
  {
    value: "weekly_plan_ready",
    label: "Weekly plan ready",
    title: "Next week's plan is ready 📅",
    body: "Your dinners are set. Take a peek and tweak anything.",
  },
];

const NotificationsCard = () => {
  const { user } = useAuth();
  const { status, busy, subscribe, unsubscribe, updatePreferences } =
    usePushNotifications();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState({
    enabled_dinner_reveal: true,
    enabled_evening_checkin: true,
    enabled_weekly_plan_ready: true,
  });
  const [testCategory, setTestCategory] = useState<TestCategory>("test");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [testAttempts, setTestAttempts] = useState(0);

  const MAX_TEST_ATTEMPTS = 3; // initial + 2 auto-retries

  useEffect(() => {
    if (!user || status !== "subscribed") return;
    supabase
      .from("push_subscriptions")
      .select("enabled_dinner_reveal, enabled_evening_checkin, enabled_weekly_plan_ready")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPrefs(data);
      });
  }, [user, status]);

  const handleToggle = async (
    key: keyof typeof prefs,
    value: boolean
  ) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    const ok = await updatePreferences({ [key]: value });
    if (!ok) toast({ title: "Couldn't update preference", variant: "destructive" });
  };

  const handleEnable = async () => {
    const ok = await subscribe();
    if (ok) toast({ title: "Notifications enabled", description: "We'll ping you at the right moments." });
    else if (Notification.permission === "denied") {
      toast({
        title: "Notifications blocked",
        description: "Allow notifications for this site in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleDisable = async () => {
    const ok = await unsubscribe();
    if (ok) toast({ title: "Notifications turned off" });
  };

  const runTestSend = async (
    opt: (typeof CATEGORY_OPTIONS)[number]
  ): Promise<{ ok: true } | { ok: false; message: string }> => {
    const { error } = await supabase.functions.invoke("send-push", {
      body: {
        user_id: user!.id,
        category: opt.value,
        title: opt.title,
        body: opt.body,
        url: "/planner",
      },
    });
    if (error) return { ok: false, message: error.message ?? "Unknown error" };
    return { ok: true };
  };

  const attemptTest = async (attemptNumber: number) => {
    if (!user) return;
    const opt = CATEGORY_OPTIONS.find((c) => c.value === testCategory) ?? CATEGORY_OPTIONS[0];
    setTestStatus("sending");
    setTestError(null);
    setTestAttempts(attemptNumber);

    let lastError = "";
    for (let i = attemptNumber; i <= MAX_TEST_ATTEMPTS; i++) {
      setTestAttempts(i);
      const result = await runTestSend(opt);
      if (result.ok) {
        setTestStatus("success");
        toast({
          title: `Test sent: ${opt.label}`,
          description:
            i > 1
              ? `Delivered on attempt ${i}. Check your notifications shortly.`
              : "Check your notifications in a few seconds.",
        });
        return;
      }
      lastError = "message" in result ? result.message : "Unknown error";
      if (i < MAX_TEST_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    setTestStatus("error");
    setTestError(lastError);
    toast({
      title: `Test failed after ${MAX_TEST_ATTEMPTS} attempts`,
      description: lastError || "Try again shortly.",
      variant: "destructive",
    });
  };

  const handleTest = () => attemptTest(1);
  const handleRetry = () => attemptTest(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-primary" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "unsupported" && (
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support push notifications. On iPhone, install Family Food OS to your
            Home Screen first (Share → Add to Home Screen) — notifications work from there on iOS 16.4+.
          </p>
        )}

        {status === "denied" && (
          <div className="text-sm text-muted-foreground">
            Notifications are blocked for this site. Enable them in your browser/site settings, then
            refresh.
          </div>
        )}

        {(status === "default" || status === "loading") && status !== "loading" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Get a friendly nudge at <strong>1 PM</strong> with tonight's dinner, an evening check-in
              reminder, and a heads-up when next week's plan is ready.
            </p>
            <Button onClick={handleEnable} disabled={busy}>
              <Bell className="w-4 h-4 mr-2" />
              Enable notifications
            </Button>
          </div>
        )}

        {status === "subscribed" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="dinner-reveal" className="text-sm">
                  1 PM dinner reveal
                </Label>
                <Switch
                  id="dinner-reveal"
                  checked={prefs.enabled_dinner_reveal}
                  onCheckedChange={(v) => handleToggle("enabled_dinner_reveal", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="evening-checkin" className="text-sm">
                  Evening check-in (~7:30 PM)
                </Label>
                <Switch
                  id="evening-checkin"
                  checked={prefs.enabled_evening_checkin}
                  onCheckedChange={(v) => handleToggle("enabled_evening_checkin", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-plan" className="text-sm">
                  Weekly plan ready
                </Label>
                <Switch
                  id="weekly-plan"
                  checked={prefs.enabled_weekly_plan_ready}
                  onCheckedChange={(v) => handleToggle("enabled_weekly_plan_ready", v)}
                />
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-border/50">
              <Label htmlFor="test-category" className="text-xs text-muted-foreground">
                Send a test for
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={testCategory}
                  onValueChange={(v) => {
                    setTestCategory(v as TestCategory);
                    setTestStatus("idle");
                    setTestError(null);
                  }}
                >
                  <SelectTrigger id="test-category" className="h-9 w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={busy || testStatus === "sending"}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {testStatus === "sending"
                    ? testAttempts > 1
                      ? `Retrying (${testAttempts}/${MAX_TEST_ATTEMPTS})…`
                      : "Sending…"
                    : "Send test"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDisable} disabled={busy}>
                  <BellOff className="w-3.5 h-3.5 mr-1.5" />
                  Turn off
                </Button>
              </div>
              {testStatus === "success" && (
                <p className="text-xs text-primary">
                  ✓ Test sent — check your device in a few seconds.
                </p>
              )}
              {testStatus === "error" && (
                <div className="space-y-2">
                  <p className="text-xs text-destructive">
                    ✗ Test failed after {MAX_TEST_ATTEMPTS} attempts
                    {testError ? `: ${testError}` : ""}.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={busy || testStatus === "sending"}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
