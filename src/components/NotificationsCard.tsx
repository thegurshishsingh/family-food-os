import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, RefreshCw, RotateCcw, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

type CategoryOption = {
  value: TestCategory;
  label: string;
  groupLabel: string;
  description: string;
  title: string;
  body: string;
};

const TITLE_MAX = 60;
const BODY_MAX = 160;

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "test",
    label: "Generic test",
    groupLabel: "Diagnostic",
    description: "A no-op ping that bypasses category preferences. Use this to verify delivery.",
    title: "Hello from Family Food OS 👋",
    body: "Notifications are working. We'll only ping you when it matters.",
  },
  {
    value: "dinner_reveal",
    label: "1 PM dinner reveal",
    groupLabel: "Meal reminder",
    description: "Daily lunchtime nudge with tonight's planned dinner. Respects the 'Dinner reveal' toggle.",
    title: "Tonight's dinner is ready 🍽️",
    body: "Tap to see what's on the menu and start prepping.",
  },
  {
    value: "evening_checkin",
    label: "Evening check-in",
    groupLabel: "Meal reminder",
    description: "~7:30 PM nudge to log how dinner went. Respects the 'Evening check-in' toggle.",
    title: "How did dinner go? ✨",
    body: "Take 10 seconds to log tonight — it makes next week smarter.",
  },
  {
    value: "weekly_plan_ready",
    label: "Weekly plan ready",
    groupLabel: "Weekly plan update",
    description: "Heads-up that next week's plan has been generated. Respects the 'Weekly plan' toggle.",
    title: "Next week's plan is ready 📅",
    body: "Your dinners are set. Take a peek and tweak anything.",
  },
];

const findCategory = (value: TestCategory) =>
  CATEGORY_OPTIONS.find((o) => o.value === value) ?? CATEGORY_OPTIONS[0];

type FailureEntry = {
  endpointHost: string;
  status?: number;
  message: string;
  attempts: number;
};

type FailureBucketKey = "removed" | "apns_payload" | "auth" | "transient" | "other";

const BUCKET_META: Record<
  FailureBucketKey,
  { label: string; tone: string; hint: string }
> = {
  removed: {
    label: "Removed (404/410)",
    tone: "bg-muted text-muted-foreground border-border",
    hint: "Subscription is dead — device unsubscribed or token expired. Re-enable on that device.",
  },
  apns_payload: {
    label: "Payload / APNs rejected (4xx)",
    tone: "bg-destructive/10 text-destructive border-destructive/30",
    hint: "Apple rejected the push. Usually a malformed payload, missing VAPID, or bad headers.",
  },
  auth: {
    label: "Auth / VAPID (401/403)",
    tone: "bg-destructive/10 text-destructive border-destructive/30",
    hint: "VAPID keys mismatch or JWT invalid. Check VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY secrets.",
  },
  transient: {
    label: "Transient (429 / 5xx, retried)",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    hint: "Push service was overloaded or rate-limited. We retried but they still failed.",
  },
  other: {
    label: "Other / network",
    tone: "bg-muted text-muted-foreground border-border",
    hint: "Unknown error — check edge function logs for details.",
  },
};

const bucketFor = (f: FailureEntry): FailureBucketKey => {
  const s = f.status;
  if (s === 404 || s === 410) return "removed";
  if (s === 401 || s === 403) return "auth";
  if (s === 429 || (typeof s === "number" && s >= 500 && s < 600)) return "transient";
  if (typeof s === "number" && s >= 400 && s < 500) return "apns_payload";
  return "other";
};

const hostKind = (host: string) => {
  if (host.includes("push.apple.com")) return "iOS (APNs)";
  if (host.includes("fcm.googleapis.com") || host.includes("android.googleapis.com"))
    return "Android (FCM)";
  if (host.includes("mozilla")) return "Firefox (Mozilla)";
  if (host.includes("windows.com") || host.includes("notify.windows")) return "Windows (WNS)";
  return host;
};

const FailureBreakdown = ({
  failures,
  removedCount,
  retriesAttempted,
  retriesRecovered,
}: {
  failures: FailureEntry[];
  removedCount: number;
  retriesAttempted: number;
  retriesRecovered: number;
}) => {
  const grouped = failures.reduce<Record<FailureBucketKey, FailureEntry[]>>(
    (acc, f) => {
      const k = bucketFor(f);
      (acc[k] ||= []).push(f);
      return acc;
    },
    { removed: [], apns_payload: [], auth: [], transient: [], other: [] }
  );

  const order: FailureBucketKey[] = [
    "apns_payload",
    "auth",
    "transient",
    "removed",
    "other",
  ];

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
          Failure breakdown
        </p>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {failures.length} endpoint{failures.length === 1 ? "" : "s"}
          {removedCount ? ` · ${removedCount} removed` : ""}
          {retriesAttempted
            ? ` · ${retriesRecovered}/${retriesAttempted} retries recovered`
            : ""}
        </span>
      </div>
      <div className="space-y-2">
        {order
          .filter((k) => grouped[k].length > 0)
          .map((k) => {
            const meta = BUCKET_META[k];
            const items = grouped[k];
            return (
              <div key={k} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wide ${meta.tone}`}
                  >
                    {meta.label} · {items.length}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {meta.hint}
                </p>
                <ul className="space-y-1 pl-1">
                  {items.slice(0, 4).map((f, idx) => (
                    <li
                      key={`${f.endpointHost}-${idx}`}
                      className="text-[11px] text-foreground/80 font-mono leading-snug break-all"
                    >
                      <span className="text-muted-foreground">
                        [{hostKind(f.endpointHost)}]
                      </span>{" "}
                      {f.status ? `HTTP ${f.status}` : "no status"}
                      {f.attempts > 1 ? ` · ${f.attempts} attempts` : ""}
                      {f.message ? ` — ${f.message}` : ""}
                    </li>
                  ))}
                  {items.length > 4 && (
                    <li className="text-[10px] text-muted-foreground">
                      …and {items.length - 4} more
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const NotificationsCard = () => {
  const { user } = useAuth();
  const { status, busy, subscribe, unsubscribe, refresh, updatePreferences } =
    usePushNotifications();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState({
    enabled_dinner_reveal: true,
    enabled_evening_checkin: true,
    enabled_weekly_plan_ready: true,
    dinner_reveal_time: "13:00",
    evening_checkin_time: "19:30",
    weekly_plan_ready_time: "09:00",
    weekly_plan_ready_days: [0] as number[], // 0=Sun … 6=Sat
  });
  const [testCategory, setTestCategory] = useState<TestCategory>("test");
  const [testTitle, setTestTitle] = useState<string>(CATEGORY_OPTIONS[0].title);
  const [testBody, setTestBody] = useState<string>(CATEGORY_OPTIONS[0].body);
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    sent: number;
    removed: number;
    failed?: number;
    retriesAttempted?: number;
    retriesRecovered?: number;
    failures?: FailureEntry[];
  } | null>(null);
  const [testFailures, setTestFailures] = useState<FailureEntry[]>([]);
  const [testReason, setTestReason] = useState<
    "no_subs" | "all_removed" | "server_error" | "network" | null
  >(null);
  const [autoResub, setAutoResub] = useState(true);
  const [resubBusy, setResubBusy] = useState(false);
  const [resubAttempted, setResubAttempted] = useState(false);
  const [testAttempts, setTestAttempts] = useState(0);
  const [retryCooldownUntil, setRetryCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const activeOption = useMemo(() => findCategory(testCategory), [testCategory]);
  const isEdited = testTitle !== activeOption.title || testBody !== activeOption.body;
  const titleOver = testTitle.length > TITLE_MAX;
  const bodyOver = testBody.length > BODY_MAX;
  const hasContent = testTitle.trim().length > 0 && testBody.trim().length > 0;

  const MAX_TEST_ATTEMPTS = 3; // initial + 2 auto-retries
  const RETRY_COOLDOWN_MS = 3000;
  const cooldownRemaining = Math.max(0, retryCooldownUntil - now);
  const cooldownActive = cooldownRemaining > 0;

  useEffect(() => {
    if (!cooldownActive) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [cooldownActive]);

  useEffect(() => {
    if (!user || status !== "subscribed") return;
    supabase
      .from("push_subscriptions")
      .select(
        "enabled_dinner_reveal, enabled_evening_checkin, enabled_weekly_plan_ready, dinner_reveal_time, evening_checkin_time, weekly_plan_ready_time, weekly_plan_ready_days"
      )
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const rawDays = Array.isArray(data.weekly_plan_ready_days)
            ? (data.weekly_plan_ready_days as number[])
                .map((d) => Number(d))
                .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
            : [];
          setPrefs((p) => ({
            ...p,
            ...data,
            // Postgres returns "HH:MM:SS" — trim to "HH:MM" for <input type="time">
            dinner_reveal_time: (data.dinner_reveal_time ?? p.dinner_reveal_time).slice(0, 5),
            evening_checkin_time: (data.evening_checkin_time ?? p.evening_checkin_time).slice(0, 5),
            weekly_plan_ready_time: (data.weekly_plan_ready_time ?? p.weekly_plan_ready_time).slice(0, 5),
            weekly_plan_ready_days: rawDays.length ? rawDays : p.weekly_plan_ready_days,
          }));
        }
      });
  }, [user, status]);

  const handleToggle = async (
    key: "enabled_dinner_reveal" | "enabled_evening_checkin" | "enabled_weekly_plan_ready",
    value: boolean
  ) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    const ok = await updatePreferences({ [key]: value });
    if (!ok) toast({ title: "Couldn't update preference", variant: "destructive" });
  };

  const handleTimeChange = async (
    key: "dinner_reveal_time" | "evening_checkin_time" | "weekly_plan_ready_time",
    value: string
  ) => {
    // value from <input type="time"> is "HH:MM"
    if (!/^\d{2}:\d{2}$/.test(value)) return;
    setPrefs((p) => ({ ...p, [key]: value }));
    const ok = await updatePreferences({ [key]: value });
    if (!ok) toast({ title: "Couldn't update notification time", variant: "destructive" });
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
    opt: CategoryOption,
    overrides: { title: string; body: string }
  ): Promise<
    | {
        ok: true;
        result: {
          sent: number;
          removed: number;
          failed?: number;
          retriesAttempted?: number;
          retriesRecovered?: number;
          failures?: FailureEntry[];
        };
      }
    | {
        ok: false;
        message: string;
        retriesAttempted?: number;
        failures?: FailureEntry[];
        reason?: "no_subs" | "all_removed" | "server_error" | "network";
      }
  > => {
    const { data, error } = await supabase.functions.invoke("send-push", {
      body: {
        user_id: user!.id,
        category: opt.value,
        title: overrides.title,
        body: overrides.body,
        url: "/planner",
      },
    });
    if (error)
      return { ok: false, message: error.message ?? "Unknown error", reason: "network" };
    const res = (data ?? {}) as {
      sent?: number;
      removed?: number;
      failed?: number;
      retries_attempted?: number;
      retries_recovered?: number;
      failures?: FailureEntry[];
      error?: string;
    };
    const failures = Array.isArray(res.failures) ? res.failures : [];
    if (res.error)
      return {
        ok: false,
        message: res.error,
        retriesAttempted: res.retries_attempted,
        failures,
        reason: "server_error",
      };
    if ((res.sent ?? 0) === 0) {
      const allRemoved = (res.removed ?? 0) > 0;
      return {
        ok: false,
        message: allRemoved
          ? "No active subscriptions — your device subscription was removed by the push service."
          : "No matching subscription on server. Re-enable notifications and try again.",
        retriesAttempted: res.retries_attempted,
        failures,
        reason: allRemoved ? "all_removed" : "no_subs",
      };
    }
    return {
      ok: true,
      result: {
        sent: res.sent ?? 0,
        removed: res.removed ?? 0,
        failed: res.failed,
        retriesAttempted: res.retries_attempted,
        retriesRecovered: res.retries_recovered,
        failures,
      },
    };
  };

  const attemptTest = async (
    attemptNumber: number,
    opts: { resetResubFlag?: boolean } = {}
  ) => {
    if (!user) return;
    const opt = findCategory(testCategory);
    const overrides = {
      title: testTitle.trim().slice(0, TITLE_MAX) || opt.title,
      body: testBody.trim().slice(0, BODY_MAX) || opt.body,
    };
    setTestStatus("sending");
    setTestError(null);
    setTestResult(null);
    setTestFailures([]);
    setTestReason(null);
    if (opts.resetResubFlag !== false) setResubAttempted(false);
    setTestAttempts(attemptNumber);

    let lastError = "";
    let lastFailures: FailureEntry[] = [];
    let lastReason: typeof testReason = null;
    for (let i = attemptNumber; i <= MAX_TEST_ATTEMPTS; i++) {
      setTestAttempts(i);
      const result = await runTestSend(opt, overrides);
      if (result.ok) {
        setTestStatus("success");
        setTestResult(result.result);
        setTestFailures(result.result.failures ?? []);
        const { sent, removed, failed, retriesAttempted, retriesRecovered } = result.result;
        toast({
          title: `Test sent: ${opt.label}`,
          description: `Delivered to ${sent} device${sent === 1 ? "" : "s"}${
            failed ? `, ${failed} failed` : ""
          }${removed ? `, ${removed} removed` : ""}${
            retriesAttempted
              ? `, ${retriesRecovered ?? 0}/${retriesAttempted} retries recovered`
              : ""
          }${
            i > 1 ? ` (attempt ${i})` : ""
          }. Check your device shortly.`,
        });
        return;
      }
      const failed = result as {
        ok: false;
        message: string;
        failures?: FailureEntry[];
        reason?: typeof lastReason;
      };
      lastError = failed.message ?? "Unknown error";
      lastFailures = failed.failures ?? lastFailures;
      lastReason = failed.reason ?? lastReason;
      // If subscription is gone, retrying the same call won't help — break early.
      if (lastReason === "no_subs" || lastReason === "all_removed") break;
      if (i < MAX_TEST_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    setTestStatus("error");
    setTestError(lastError);
    setTestFailures(lastFailures);
    setTestReason(lastReason);
    setRetryCooldownUntil(Date.now() + RETRY_COOLDOWN_MS);
    setNow(Date.now());
    toast({
      title: `Test failed`,
      description: lastError || "Try again shortly.",
      variant: "destructive",
    });
  };

  const needsResub = testReason === "no_subs" || testReason === "all_removed";

  const handleResubscribe = async (autoRetest: boolean) => {
    if (!user || resubBusy) return;
    setResubBusy(true);
    setResubAttempted(true);
    try {
      // Tear down any stale local subscription, then re-subscribe so the
      // browser hands us a fresh endpoint that the server can store.
      await unsubscribe();
      const ok = await subscribe();
      await refresh();
      if (!ok) {
        toast({
          title: "Couldn't resubscribe",
          description:
            Notification.permission === "denied"
              ? "Notifications are blocked in your browser settings."
              : "Permission was not granted. Try again from this device.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Resubscribed",
        description: "A fresh push subscription was registered for this device.",
      });
      if (autoRetest) {
        // Small delay so the upsert is visible to the next select.
        await new Promise((r) => setTimeout(r, 400));
        attemptTest(1, { resetResubFlag: false });
      }
    } finally {
      setResubBusy(false);
    }
  };

  // Auto-resubscribe + auto-retest when the user opted in and the test failed
  // because the server has no live subscription for them.
  useEffect(() => {
    if (
      autoResub &&
      needsResub &&
      !resubAttempted &&
      !resubBusy &&
      testStatus === "error"
    ) {
      handleResubscribe(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResub, needsResub, resubAttempted, resubBusy, testStatus]);

  const handleTest = () => {
    if (cooldownActive) return;
    attemptTest(1);
  };
  const handleRetry = () => {
    if (cooldownActive) return;
    setRetryCooldownUntil(Date.now() + RETRY_COOLDOWN_MS);
    setNow(Date.now());
    attemptTest(1);
  };

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
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleEnable} disabled={busy || resubBusy}>
                <Bell className="w-4 h-4 mr-2" />
                Enable notifications
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResubscribe(true)}
                disabled={busy || resubBusy}
                title="Force a fresh push subscription on this device and send a test"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${resubBusy ? "animate-spin" : ""}`}
                />
                {resubBusy ? "Resubscribing…" : "Force re-subscribe"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Already enabled but nothing arrives? Tap <strong>Force re-subscribe</strong> to replace
              the stored push token with a fresh one and send a test.
            </p>
          </div>
        )}

        {status === "subscribed" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="dinner-reveal" className="text-sm">
                    Dinner reveal
                  </Label>
                  <Switch
                    id="dinner-reveal"
                    checked={prefs.enabled_dinner_reveal}
                    onCheckedChange={(v) => handleToggle("enabled_dinner_reveal", v)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="dinner-reveal-time" className="text-xs text-muted-foreground">
                    Send at
                  </Label>
                  <Input
                    id="dinner-reveal-time"
                    type="time"
                    value={prefs.dinner_reveal_time}
                    onChange={(e) => handleTimeChange("dinner_reveal_time", e.target.value)}
                    disabled={!prefs.enabled_dinner_reveal}
                    className="h-8 w-[120px] text-sm"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="evening-checkin" className="text-sm">
                    Evening check-in
                  </Label>
                  <Switch
                    id="evening-checkin"
                    checked={prefs.enabled_evening_checkin}
                    onCheckedChange={(v) => handleToggle("enabled_evening_checkin", v)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="evening-checkin-time" className="text-xs text-muted-foreground">
                    Send at
                  </Label>
                  <Input
                    id="evening-checkin-time"
                    type="time"
                    value={prefs.evening_checkin_time}
                    onChange={(e) => handleTimeChange("evening_checkin_time", e.target.value)}
                    disabled={!prefs.enabled_evening_checkin}
                    className="h-8 w-[120px] text-sm"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="weekly-plan" className="text-sm">
                    Weekly plan ready
                  </Label>
                  <Switch
                    id="weekly-plan"
                    checked={prefs.enabled_weekly_plan_ready}
                    onCheckedChange={(v) => handleToggle("enabled_weekly_plan_ready", v)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="weekly-plan-time" className="text-xs text-muted-foreground">
                    Preferred time
                  </Label>
                  <Input
                    id="weekly-plan-time"
                    type="time"
                    value={prefs.weekly_plan_ready_time}
                    onChange={(e) => handleTimeChange("weekly_plan_ready_time", e.target.value)}
                    disabled={!prefs.enabled_weekly_plan_ready}
                    className="h-8 w-[120px] text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/50">
              <div className="space-y-2">
                <Label htmlFor="test-category" className="text-xs text-muted-foreground">
                  Send a test for
                </Label>
                <Select
                  value={testCategory}
                  onValueChange={(v) => {
                    const next = findCategory(v as TestCategory);
                    setTestCategory(next.value);
                    setTestTitle(next.title);
                    setTestBody(next.body);
                    setTestStatus("idle");
                    setTestError(null);
                  }}
                >
                  <SelectTrigger id="test-category" className="h-9 w-full sm:w-[260px]">
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

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    {activeOption.groupLabel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{activeOption.description}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="test-title" className="text-xs text-muted-foreground">
                      Title
                    </Label>
                    <span
                      className={`text-[10px] tabular-nums ${
                        titleOver ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {testTitle.length}/{TITLE_MAX}
                    </span>
                  </div>
                  <Input
                    id="test-title"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder={activeOption.title}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="test-body" className="text-xs text-muted-foreground">
                      Message body
                    </Label>
                    <span
                      className={`text-[10px] tabular-nums ${
                        bodyOver ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {testBody.length}/{BODY_MAX}
                    </span>
                  </div>
                  <Textarea
                    id="test-body"
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    placeholder={activeOption.body}
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {isEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setTestTitle(activeOption.title);
                      setTestBody(activeOption.body);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to default
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
                  Preview
                </p>
                <div className="flex items-start gap-3 rounded-lg bg-background border border-border/60 p-3 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {testTitle.trim() || activeOption.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">now</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {testBody.trim() || activeOption.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">Family Food OS</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="auto-resub"
                    className="text-xs font-medium cursor-pointer"
                  >
                    Auto-recover stale subscription
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    If the test finds no live subscription on this device, automatically
                    re-subscribe and re-run the test.
                  </p>
                </div>
                <Switch
                  id="auto-resub"
                  checked={autoResub}
                  onCheckedChange={setAutoResub}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={
                    busy || testStatus === "sending" || resubBusy || !hasContent || titleOver || bodyOver
                  }
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {testStatus === "sending"
                    ? testAttempts > 1
                      ? `Retrying (${testAttempts}/${MAX_TEST_ATTEMPTS})…`
                      : "Sending…"
                    : "Send test"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResubscribe(true)}
                  disabled={busy || resubBusy || testStatus === "sending"}
                  title="Unsubscribe and re-subscribe this device, then send a test"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 mr-1.5 ${resubBusy ? "animate-spin" : ""}`}
                  />
                  {resubBusy ? "Resubscribing…" : "Force re-subscribe"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDisable} disabled={busy}>
                  <BellOff className="w-3.5 h-3.5 mr-1.5" />
                  Turn off
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-1 leading-snug">
                Not getting notifications on this device? Tap <strong>Force re-subscribe</strong> — it
                replaces the stored push token with a fresh one and sends a test.
              </p>
              {testStatus === "success" && testResult && (
                <p className="text-xs text-primary">
                  ✓ Sent to {testResult.sent} device{testResult.sent === 1 ? "" : "s"}
                  {testResult.failed ? `, ${testResult.failed} failed` : ""}
                  {testResult.removed ? `, ${testResult.removed} removed` : ""}
                  {testResult.retriesAttempted
                    ? `, ${testResult.retriesRecovered ?? 0}/${testResult.retriesAttempted} server retries recovered`
                    : ""}
                  . Check your device in a few seconds.
                </p>
              )}
              {testStatus === "error" && (
                <div className="space-y-2">
                  <p className="text-xs text-destructive">
                    ✗ Test failed{testError ? `: ${testError}` : "."}
                  </p>

                  {needsResub && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
                        {testReason === "all_removed"
                          ? "Your previous subscription was removed by the push service (token expired or device unsubscribed)."
                          : "We don't have a live push subscription stored for this device."}{" "}
                        {autoResub && resubAttempted
                          ? "We tried to re-subscribe automatically — see result above."
                          : autoResub
                          ? "Auto-recovery will run momentarily…"
                          : "Re-subscribe this device to fix it."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResubscribe(true)}
                        disabled={resubBusy || busy}
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 mr-1.5 ${
                            resubBusy ? "animate-spin" : ""
                          }`}
                        />
                        {resubBusy
                          ? "Resubscribing…"
                          : resubAttempted
                          ? "Try resubscribe again"
                          : "Re-check & resubscribe"}
                      </Button>
                    </div>
                  )}

                  {!needsResub && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      disabled={busy || cooldownActive}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {cooldownActive
                        ? `Retry in ${Math.ceil(cooldownRemaining / 1000)}s`
                        : "Retry"}
                    </Button>
                  )}
                </div>
              )}

              {(testStatus === "success" || testStatus === "error") &&
                testFailures.length > 0 && (
                  <FailureBreakdown
                    failures={testFailures}
                    removedCount={testResult?.removed ?? 0}
                    retriesAttempted={testResult?.retriesAttempted ?? 0}
                    retriesRecovered={testResult?.retriesRecovered ?? 0}
                  />
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
