import { useEffect, useState } from "react";
import { BarChart3, RefreshCw, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type EventRow = {
  event_id: string;
  event_type: "delivered" | "clicked" | "opened";
  weekday: number | null;
  occurred_at: string;
  platform: string | null;
  app_version: string | null;
};

type DayBucket = {
  weekday: number;
  label: string;
  delivered: number;
  clicked: number;
  opened: number;
};

type SliceBucket = {
  key: string;
  label: string;
  delivered: number;
  clicked: number;
  opened: number;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RANGE_OPTIONS = [
  { value: "30", label: "Last 30 days" },
  { value: "60", label: "Last 60 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  unknown: "Unknown",
};

const WeeklyPlanReadyAnalytics = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeValue>("30");
  const [loading, setLoading] = useState(false);
  const [buckets, setBuckets] = useState<DayBucket[]>(
    DAY_LABELS.map((label, i) => ({ weekday: i, label, delivered: 0, clicked: 0, opened: 0 }))
  );
  const [totals, setTotals] = useState({ delivered: 0, clicked: 0, opened: 0 });
  const [platforms, setPlatforms] = useState<SliceBucket[]>([]);
  const [versions, setVersions] = useState<SliceBucket[]>([]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - parseInt(range, 10));
    const { data, error } = await supabase
      .from("push_notification_events")
      .select("event_id, event_type, weekday, occurred_at, platform, app_version")
      .eq("user_id", user.id)
      .eq("category", "weekly_plan_ready")
      .gte("occurred_at", since.toISOString())
      .order("occurred_at", { ascending: false })
      .limit(5000);
    setLoading(false);
    if (error) {
      console.error("[WeeklyPlanReadyAnalytics] failed", error);
      return;
    }
    const rows = (data ?? []) as EventRow[];
    const next = DAY_LABELS.map((label, i) => ({
      weekday: i,
      label,
      delivered: 0,
      clicked: 0,
      opened: 0,
    }));
    let tDelivered = 0;
    let tClicked = 0;
    let tOpened = 0;
    const platformMap = new Map<string, SliceBucket>();
    const versionMap = new Map<string, SliceBucket>();

    const bumpSlice = (
      map: Map<string, SliceBucket>,
      key: string,
      label: string,
      type: EventRow["event_type"]
    ) => {
      let b = map.get(key);
      if (!b) {
        b = { key, label, delivered: 0, clicked: 0, opened: 0 };
        map.set(key, b);
      }
      if (type === "delivered") b.delivered++;
      else if (type === "clicked") b.clicked++;
      else if (type === "opened") b.opened++;
    };

    for (const r of rows) {
      // Weekday breakdown
      if (r.weekday != null && r.weekday >= 0 && r.weekday <= 6) {
        const b = next[r.weekday];
        if (r.event_type === "delivered") {
          b.delivered++;
          tDelivered++;
        } else if (r.event_type === "clicked") {
          b.clicked++;
          tClicked++;
        } else if (r.event_type === "opened") {
          b.opened++;
          tOpened++;
        }
      } else {
        if (r.event_type === "delivered") tDelivered++;
        else if (r.event_type === "clicked") tClicked++;
        else if (r.event_type === "opened") tOpened++;
      }

      // Platform breakdown
      const pKey = (r.platform ?? "unknown").toLowerCase();
      bumpSlice(platformMap, pKey, PLATFORM_LABELS[pKey] ?? pKey, r.event_type);

      // App version breakdown
      const vKey = r.app_version ?? "unknown";
      bumpSlice(versionMap, vKey, vKey, r.event_type);
    }

    setBuckets(next);
    setTotals({ delivered: tDelivered, clicked: tClicked, opened: tOpened });
    setPlatforms(
      Array.from(platformMap.values()).sort((a, b) => b.delivered - a.delivered)
    );
    setVersions(
      Array.from(versionMap.values())
        .sort((a, b) => b.delivered - a.delivered)
        .slice(0, 8)
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, range]);

  const ctr =
    totals.delivered > 0
      ? Math.round(((totals.clicked + totals.opened) / totals.delivered) * 100)
      : 0;

  const ordered = [1, 2, 3, 4, 5, 6, 0].map((wd) => buckets[wd]);
  const maxDelivered = Math.max(1, ...ordered.map((b) => b.delivered));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly plan ready — engagement
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          See which weekdays, platforms, and app versions drive the most plan reviews.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Select value={range} onValueChange={(v) => setRange(v as RangeValue)}>
            <SelectTrigger className="h-9 w-[160px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Delivered" value={totals.delivered} />
          <StatCard label="Clicked" value={totals.clicked} />
          <StatCard label="Opened" value={totals.opened} />
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="flex items-end justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">By weekday</p>
            <p className="text-[11px] text-muted-foreground tabular-nums">
              CTR: <span className="text-foreground font-semibold">{ctr}%</span>
            </p>
          </div>
          {totals.delivered === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No weekly plan ready notifications in this range yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {ordered.map((b) => {
                const pct = (b.delivered / maxDelivered) * 100;
                const engaged = b.clicked + b.opened;
                const dayCtr =
                  b.delivered > 0 ? Math.round((engaged / b.delivered) * 100) : 0;
                return (
                  <div key={b.weekday} className="flex items-center gap-2">
                    <span className="w-9 text-[11px] font-medium text-muted-foreground">
                      {b.label}
                    </span>
                    <div className="flex-1 h-6 rounded-md bg-background border border-border/40 overflow-hidden relative">
                      <div
                        className="h-full bg-primary/20"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 h-full bg-primary"
                        style={{
                          width: `${(engaged / maxDelivered) * 100}%`,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <span className="w-[88px] text-right text-[11px] tabular-nums text-muted-foreground">
                      {engaged}/{b.delivered}
                      <span className="ml-1 text-foreground/70 font-medium">{dayCtr}%</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-[10px] text-muted-foreground leading-snug">
            Light bar = delivered. Solid bar = clicked or opened. Right-side ratio is
            engaged ÷ delivered.
          </p>
        </div>

        {/* Platform breakdown — iOS vs Android vs Web */}
        <SliceTable
          title="By platform"
          icon={<Smartphone className="w-3.5 h-3.5" />}
          rows={platforms}
          empty="No device data yet."
        />

        {/* App version breakdown */}
        <SliceTable
          title="By app version"
          rows={versions}
          empty="No version data yet."
          monoLabel
        />
      </CardContent>
    </Card>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-center">
    <p className="text-xl font-semibold text-foreground tabular-nums">{value}</p>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
  </div>
);

const SliceTable = ({
  title,
  icon,
  rows,
  empty,
  monoLabel,
}: {
  title: string;
  icon?: React.ReactNode;
  rows: SliceBucket[];
  empty: string;
  monoLabel?: boolean;
}) => {
  const totalDelivered = rows.reduce((s, r) => s + r.delivered, 0);
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
      </div>
      {rows.length === 0 || totalDelivered === 0 ? (
        <p className="text-xs text-muted-foreground py-3 text-center">{empty}</p>
      ) : (
        <div className="space-y-1.5">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-1 text-[10px] uppercase tracking-wide text-muted-foreground/80">
            <span>{title.replace("By ", "")}</span>
            <span className="text-right w-12">Sent</span>
            <span className="text-right w-12">Eng.</span>
            <span className="text-right w-10">CTR</span>
          </div>
          {rows.map((r) => {
            const engaged = r.clicked + r.opened;
            const ctr = r.delivered > 0 ? Math.round((engaged / r.delivered) * 100) : 0;
            return (
              <div
                key={r.key}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-1 items-center text-xs"
              >
                <span
                  className={`truncate ${monoLabel ? "font-mono text-[11px]" : ""}`}
                  title={r.label}
                >
                  {r.label}
                </span>
                <span className="text-right w-12 tabular-nums text-muted-foreground">
                  {r.delivered}
                </span>
                <span className="text-right w-12 tabular-nums text-muted-foreground">
                  {engaged}
                </span>
                <span className="text-right w-10 tabular-nums font-semibold text-foreground">
                  {ctr}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanReadyAnalytics;
