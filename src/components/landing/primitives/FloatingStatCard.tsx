import { forwardRef, HTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FloatingStatCard — the signature "zoom card" lifted from Bevel's design
 * language: a crisp white card that looks like a single feature has been
 * zoomed out of the phone screen and lifted onto the page.
 *
 * Anatomy (frozen):
 *   row 1 — small icon + label  ........  trend chip / arrow
 *   row 2 — big value + unit
 *   row 3 — optional status line  OR  inline sparkline
 *
 * Lives in primitives/ (outside the visual-consistency scan) but still uses
 * only HSL design tokens — no raw colors.
 */

type Tone = "primary" | "sky" | "coral" | "accent" | "sage";

const toneText: Record<Tone, string> = {
  primary: "text-primary",
  sky: "text-sky",
  coral: "text-coral",
  accent: "text-accent",
  sage: "text-sage-dark",
};

const toneTint: Record<Tone, string> = {
  primary: "bg-primary/10",
  sky: "bg-sky/15",
  coral: "bg-coral/15",
  accent: "bg-accent/15",
  sage: "bg-sage/15",
};

const toneStroke: Record<Tone, string> = {
  primary: "hsl(var(--primary))",
  sky: "hsl(var(--sky))",
  coral: "hsl(var(--coral))",
  accent: "hsl(var(--accent))",
  sage: "hsl(var(--sage))",
};

function Sparkline({ points, tone }: { points: number[]; tone: Tone }) {
  const w = 64;
  const h = 26;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / span) * (h - 4) - 2;
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = coords[coords.length - 1];
  const gid = `spark-${tone}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-16 h-7 overflow-visible shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={toneStroke[tone]} stopOpacity="0.18" />
          <stop offset="100%" stopColor={toneStroke[tone]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={toneStroke[tone]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={toneStroke[tone]} />
    </svg>
  );
}

export interface FloatingStatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  /** Accent tone for the icon, sparkline and trend chip */
  tone?: Tone;
  /** Small zoom/expand arrow in the top-right corner (Bevel detail) */
  showArrow?: boolean;
  /** Directional trend chip shown beside the value */
  trend?: "up" | "down";
  trendTone?: Tone;
  /** Status line under the value, e.g. "Below normal" */
  status?: string;
  statusTone?: Tone;
  /** Inline sparkline drawn to the right of the value */
  sparkline?: number[];
  outerClassName?: string;
}

export const FloatingStatCard = forwardRef<HTMLDivElement, FloatingStatCardProps>(
  (
    {
      icon: Icon,
      label,
      value,
      unit,
      tone = "primary",
      showArrow = false,
      trend,
      trendTone,
      status,
      statusTone = "sky",
      sparkline,
      outerClassName,
      className,
      ...rest
    },
    ref,
  ) => {
    const tTone = trendTone ?? (trend === "up" ? "sky" : "coral");
    const TrendIcon = trend === "up" ? ArrowUp : ArrowDown;

    return (
      <div ref={ref} className={cn("relative", outerClassName)} {...rest}>
        <div
          className={cn(
            "rounded-2xl bg-card border border-border/50 px-3.5 py-3 shadow-[0_18px_40px_-16px_hsl(var(--foreground)/0.35)]",
            "will-change-transform transform-gpu transition-all duration-300 ease-out cursor-default motion-reduce:transition-none",
            "[@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:scale-[1.035] [@media(hover:hover)]:hover:border-border [@media(hover:hover)]:hover:shadow-[0_26px_55px_-18px_hsl(var(--foreground)/0.45)]",
            "[@media(hover:none)]:active:scale-[0.98]",
            className,
          )}
        >
          {/* Row 1 — icon + label + arrow */}
          <div className="flex items-center gap-1.5">
            <Icon className={cn("w-3.5 h-3.5 shrink-0", toneText[tone])} strokeWidth={2.2} />
            <span className="text-[11px] font-semibold text-muted-foreground leading-none truncate">
              {label}
            </span>
            {showArrow && (
              <ArrowUpRight className="w-3 h-3 text-muted-foreground/50 ml-auto shrink-0" />
            )}
          </div>

          {/* Row 2 — value + unit + (sparkline | trend) */}
          <div className="mt-1.5 flex items-end justify-between gap-2">
            <p className="leading-none">
              <span className="text-[22px] font-bold tracking-tight text-foreground">{value}</span>
              {unit && <span className="ml-1 text-[12px] font-semibold text-muted-foreground">{unit}</span>}
            </p>

            {sparkline ? (
              <Sparkline points={sparkline} tone={tone} />
            ) : trend ? (
              <span
                className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-md shrink-0",
                  toneTint[tTone],
                )}
              >
                <TrendIcon className={cn("w-3.5 h-3.5", toneText[tTone])} strokeWidth={2.6} />
              </span>
            ) : null}
          </div>

          {/* Row 3 — status */}
          {status && (
            <div className="mt-1.5 flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0",
                  toneTint[statusTone],
                )}
              >
                <ArrowDown className={cn("w-2.5 h-2.5", toneText[statusTone])} strokeWidth={2.6} />
              </span>
              <span className={cn("text-[11px] font-bold", toneText[statusTone])}>{status}</span>
            </div>
          )}
        </div>
      </div>
    );
  },
);
FloatingStatCard.displayName = "FloatingStatCard";
