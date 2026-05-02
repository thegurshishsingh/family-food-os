import { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw, Smartphone, Users } from "lucide-react";
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

type HouseholdContext = {
  flags?: string[];
  child_age_bands?: string[];
  num_adults?: number | null;
  num_children?: number | null;
  has_kids?: boolean;
};

type EventRow = {
  event_id: string;
  event_type: "delivered" | "clicked" | "opened";
  weekday: number | null;
  occurred_at: string;
  platform: string | null;
  app_version: string | null;
  household_context: HouseholdContext | null;
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

// All filterable household-context keys. Each value is the predicate that
// decides whether an event matches the filter. Labels are user-facing.
type ContextFilterKey =
  | "all"
  | "flag:budget_week"
  | "flag:low_cleanup_week"
  | "flag:sick_week"
  | "flag:chaotic_week"
  | "flag:sports_week"
  | "flag:newborn_in_house"
  | "flag:guests_visiting"
  | "flag:one_parent_traveling"
  | "flag:high_protein_week"
  | "kids:has_kids"
  | "kids:no_kids"
  | "age:baby"
  | "age:toddler"
  | "age:school_age"
  | "age:teen";

const CONTEXT_FILTERS: Array<{ value: ContextFilterKey; label: string; group?: string }> = [
  { value: "all", label: "All contexts" },
  { value: "flag:budget_week", label: "Budget-tight week", group: "Weekly flags" },
  { value: "flag:low_cleanup_week", label: "Low cleanup week", group: "Weekly flags" },
  { value: "flag:sick_week", label: "Sick week", group: "Weekly flags" },
  { value: "flag:chaotic_week", label: "Chaotic week", group: "Weekly flags" },
  { value: "flag:sports_week", label: "Sports week", group: "Weekly flags" },
  { value: "flag:newborn_in_house", label: "Newborn in house", group: "Weekly flags" },
  { value: "flag:guests_visiting", label: "Guests visiting", group: "Weekly flags" },
  { value: "flag:one_parent_traveling", label: "One parent traveling", group: "Weekly flags" },
  { value: "flag:high_protein_week", label: "High-protein week", group: "Weekly flags" },
  { value: "kids:has_kids", label: "Has kids", group: "Household" },
  { value: "kids:no_kids", label: "No kids", group: "Household" },
  { value: "age:baby", label: "Has baby (0–1)", group: "Kids ages" },
  { value: "age:toddler", label: "Has toddler (2–4)", group: "Kids ages" },
  { value: "age:school_age", label: "Has school-age (5–12)", group: "Kids ages" },
  { value: "age:teen", label: "Has teen (13+)", group: "Kids ages" },
];

const CONTEXT_FLAG_LABELS: Record<string, string> = {
  budget_week: "Budget-tight",
  low_cleanup_week: "Low cleanup",
  sick_week: "Sick",
  chaotic_week: "Chaotic",
  sports_week: "Sports",
  newborn_in_house: "Newborn",
  guests_visiting: "Guests",
  one_parent_traveling: "Parent traveling",
  high_protein_week: "High protein",
};

const AGE_BAND_LABELS: Record<string, string> = {
  baby: "Baby (0–1)",
  toddler: "Toddler (2–4)",
  school_age: "School age (5–12)",
  teen: "Teen (13+)",
};

function eventMatchesFilter(ctx: HouseholdContext | null, filter: ContextFilterKey): boolean {
  if (filter === "all") return true;
  const c = ctx ?? {};
  if (filter.startsWith("flag:")) {
    const key = filter.slice(5);
    return Array.isArray(c.flags) && c.flags.includes(key);
  }
  if (filter === "kids:has_kids") {
    if (typeof c.has_kids === "boolean") return c.has_kids;
    return (c.num_children ?? 0) > 0;
  }
  if (filter === "kids:no_kids") {
    if (typeof c.has_kids === "boolean") return !c.has_kids;
    return (c.num_children ?? 0) === 0;
  }
  if (filter.startsWith("age:")) {
    const band = filter.slice(4);
    return Array.isArray(c.child_age_bands) && c.child_age_bands.includes(band);
  }
  return true;
}

const WeeklyPlanReadyAnalytics = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeValue>("30");
  const [contextFilter, setContextFilter] = useState<ContextFilterKey>("all");
  const [loading, setLoading] = useState(false);
  const [allRows, setAllRows] = useState<EventRow[]>([]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - parseInt(range, 10));
    const { data, error } = await supabase
      .from("push_notification_events")
      .select(
        "event_id, event_type, weekday, occurred_at, platform, app_version, household_context"
      )
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
    setAllRows((data ?? []) as EventRow[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, range]);

  // Filter + aggregate in-memory so changing the context filter is instant.
  const view = useMemo(() => {
    const filtered = allRows.filter((r) => eventMatchesFilter(r.household_context, contextFilter));
    const next: DayBucket[] = DAY_LABELS.map((label, i) => ({
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

    for (const r of filtered) {
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
      const pKey = (r.platform ?? "unknown").toLowerCase();
      bumpSlice(platformMap, pKey, PLATFORM_LABELS[pKey] ?? pKey, r.event_type);
      const vKey = r.app_version ?? "unknown";
      bumpSlice(versionMap, vKey, vKey, r.event_type);
    }

    return {
      buckets: next,
      totals: { delivered: tDelivered, clicked: tClicked, opened: tOpened },
      platforms: Array.from(platformMap.values()).sort((a, b) => b.delivered - a.delivered),
      versions: Array.from(versionMap.values())
        .sort((a, b) => b.delivered - a.delivered)
        .slice(0, 8),
      filteredCount: filtered.length,
    };
  }, [allRows, contextFilter]);

  // Context breakdown is ALWAYS computed across all rows (ignores filter)
  // so users can see at a glance which contexts drive engagement.
  const contextBreakdown = useMemo(() => {
    const buckets = new Map<string, SliceBucket>();
    const bump = (key: string, label: string, type: EventRow["event_type"]) => {
      let b = buckets.get(key);
      if (!b) {
        b = { key, label, delivered: 0, clicked: 0, opened: 0 };
        buckets.set(key, b);
      }
      if (type === "delivered") b.delivered++;
      else if (type === "clicked") b.clicked++;
      else if (type === "opened") b.opened++;
    };
    for (const r of allRows) {
      const c = r.household_context ?? {};
      const flags = Array.isArray(c.flags) ? c.flags : [];
      const ages = Array.isArray(c.child_age_bands) ? c.child_age_bands : [];
      if (flags.length === 0 && ages.length === 0) {
        bump("__none__", "No context", r.event_type);
      } else {
        for (const f of flags) bump(`flag:${f}`, CONTEXT_FLAG_LABELS[f] ?? f, r.event_type);
        for (const a of ages) bump(`age:${a}`, AGE_BAND_LABELS[a] ?? a, r.event_type);
      }
    }
    return Array.from(buckets.values()).sort((a, b) => b.delivered - a.delivered);
  }, [allRows]);

  const ctr =
    view.totals.delivered > 0
      ? Math.round(((view.totals.clicked + view.totals.opened) / view.totals.delivered) * 100)
      : 0;

  const ordered = [1, 2, 3, 4, 5, 6, 0].map((wd) => view.buckets[wd]);
  const maxDelivered = Math.max(1, ...ordered.map((b) => b.delivered));
  const filterIsActive = contextFilter !== "all";

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
          See which weekdays, platforms, app versions, and household contexts drive the most plan reviews.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
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
          <Select
            value={contextFilter}
            onValueChange={(v) => setContextFilter(v as ContextFilterKey)}
          >
            <SelectTrigger className="h-9 w-[200px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTEXT_FILTERS.map((opt, i) => {
                const prev = CONTEXT_FILTERS[i - 1];
                const showDivider = !!opt.group && opt.group !== prev?.group;
                return (
                  <div key={opt.value}>
                    {showDivider && (
                      <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                        {opt.group}
                      </div>
                    )}
                    <SelectItem value={opt.value}>{opt.label}</SelectItem>
                  </div>
                );
              })}
            </SelectContent>
          </Select>
          {filterIsActive && (
            <span className="text-[11px] text-muted-foreground">
              Showing {view.filteredCount} matching events
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Delivered" value={view.totals.delivered} />
          <StatCard label="Clicked" value={view.totals.clicked} />
          <StatCard label="Opened" value={view.totals.opened} />
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="flex items-end justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">By weekday</p>
            <p className="text-[11px] text-muted-foreground tabular-nums">
              CTR: <span className="text-foreground font-semibold">{ctr}%</span>
            </p>
          </div>
          {view.totals.delivered === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              {filterIsActive
                ? "No events match this household context filter."
                : "No weekly plan ready notifications in this range yet."}
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

        <SliceTable
          title="By platform"
          icon={<Smartphone className="w-3.5 h-3.5" />}
          rows={view.platforms}
          empty="No device data yet."
        />

        <SliceTable
          title="By app version"
          rows={view.versions}
          empty="No version data yet."
          monoLabel
        />

        {/* Always-visible context breakdown across all events (ignores filter
            so users can compare contexts side by side). */}
        <SliceTable
          title="By household context"
          icon={<Users className="w-3.5 h-3.5" />}
          rows={contextBreakdown}
          empty="No context data yet — newer events include household context automatically."
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
