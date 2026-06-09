import { Fragment, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Quote,
  Sparkles,
  Leaf,
  Sun,
  Heart,
  Compass,
  Lightbulb,
  Soup,
  Clock,
  Star,
  ChefHat,
  Refrigerator,
  Zap,
  ShoppingBag,
  Utensils,
  CornerDownRight,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowcaseStage } from "@/components/landing/primitives";
import {
  WeeklyPlanScreen,
  GroceryScreen,
  SavingsScreen,
  InsightsScreen,
  DailyDinnerScreen,
  RealityScoreScreen,
  OnboardingScreen,
} from "@/components/landing/screens";
import type { Block, ScreenKey, Tone } from "@/content/guides";
import { cn } from "@/lib/utils";

const SCREENS: Record<ScreenKey, () => JSX.Element> = {
  weeklyPlan: WeeklyPlanScreen,
  grocery: GroceryScreen,
  savings: SavingsScreen,
  insights: InsightsScreen,
  dailyDinner: DailyDinnerScreen,
  realityScore: RealityScoreScreen,
  onboarding: OnboardingScreen,
};

const calloutTone: Record<Tone, string> = {
  sky: "border-sky/25 bg-sky/[0.06]",
  sage: "border-primary/20 bg-primary/[0.05]",
  amber: "border-warm/30 bg-warm/[0.07]",
  coral: "border-coral/25 bg-coral/[0.06]",
};

const calloutIcon: Record<Tone, string> = {
  sky: "text-sky",
  sage: "text-primary",
  amber: "text-accent-foreground",
  coral: "text-coral",
};

/** Tone-aware styling for the per-section illustration medallion. */
const sectionMedallionTone: Record<Tone, string> = {
  sky: "border-sky/20 bg-sky/[0.08] text-sky",
  sage: "border-primary/20 bg-primary/[0.07] text-primary",
  amber: "border-warm/30 bg-warm/[0.10] text-accent-foreground",
  coral: "border-coral/20 bg-coral/[0.08] text-coral",
};

/**
 * Lightweight, supportive illustrations cycled across major (h2) sections so
 * each section gets its own visual anchor without heavy artwork.
 */
const SECTION_ICONS = [Leaf, Sun, Heart, Compass, Lightbulb, Soup, Clock, Star];

/** A soft visual divider + tone-colored illustration that opens each section. */
const SectionDivider = ({ tone, ordinal }: { tone: Tone; ordinal: number }) => {
  const Icon = SECTION_ICONS[ordinal % SECTION_ICONS.length];
  return (
    <div className="flex items-center gap-3 pt-8" aria-hidden="true">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          sectionMedallionTone[tone],
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-border/70 via-border/40 to-transparent" />
    </div>
  );
};

/** Icon per real-week mode, matched by label keyword. */
const MODE_ICONS: { match: string; Icon: typeof ChefHat }[] = [
  { match: "leftover", Icon: Refrigerator },
  { match: "low-effort", Icon: Zap },
  { match: "takeout", Icon: ShoppingBag },
  { match: "dine-out", Icon: Utensils },
  { match: "cook", Icon: ChefHat },
];

const modeIconFor = (label: string) => {
  const l = label.toLowerCase();
  return (MODE_ICONS.find((m) => l.includes(m.match)) ?? MODE_ICONS[MODE_ICONS.length - 1]).Icon;
};

/** Parse a minimal inline syntax: [label](/path) and **bold**. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on links first, keeping delimiters.
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const pushText = (chunk: string) => {
    // Handle **bold** within plain chunks.
    const boldRe = /\*\*([^*]+)\*\*/g;
    let li = 0;
    let m: RegExpExecArray | null;
    while ((m = boldRe.exec(chunk)) !== null) {
      if (m.index > li) nodes.push(<Fragment key={key++}>{chunk.slice(li, m.index)}</Fragment>);
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {m[1]}
        </strong>,
      );
      li = m.index + m[0].length;
    }
    if (li < chunk.length) nodes.push(<Fragment key={key++}>{chunk.slice(li)}</Fragment>);
  };

  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > lastIndex) pushText(text.slice(lastIndex, match.index));
    const label = match[1];
    const href = match[2];
    const isInternal = href.startsWith("/");
    if (isInternal) {
      nodes.push(
        <Link
          key={key++}
          to={href}
          className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary transition-colors"
        >
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <a
          key={key++}
          href={href}
          className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) pushText(text.slice(lastIndex));
  return nodes;
}

const slugifyHeading = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const GuideContent = ({ blocks, tone = "sage" }: { blocks: Block[]; tone?: Tone }) => {
  // Map each h2 block index to its sequential ordinal so every major section
  // gets a distinct, repeating illustration.
  const h2Ordinals = new Map<number, number>();
  let h2Counter = 0;
  blocks.forEach((b, idx) => {
    if (b.type === "h2") h2Ordinals.set(idx, h2Counter++);
  });

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="text-base md:text-lg text-foreground/80 leading-relaxed">
                {renderInline(block.text)}
              </p>
            );
          case "h2":
            return (
              <div key={i}>
                <SectionDivider tone={tone} ordinal={h2Ordinals.get(i) ?? 0} />
                <h2
                  id={block.id ?? slugifyHeading(block.text)}
                  className="scroll-mt-28 pt-4 text-2xl md:text-3xl font-serif font-semibold text-foreground tracking-tight leading-tight"
                >
                  {block.text}
                </h2>
              </div>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-1 text-xl font-serif font-semibold text-foreground">
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2.5 pl-1">
                {block.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-base md:text-lg text-foreground/80 leading-relaxed">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-2.5">
                {block.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-base md:text-lg text-foreground/80 leading-relaxed">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {j + 1}
                    </span>
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          case "callout": {
            const tone = block.tone ?? "sage";
            return (
              <div
                key={i}
                className={cn("rounded-2xl border p-5 md:p-6", calloutTone[tone])}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <Sparkles className={cn("h-4 w-4", calloutIcon[tone])} />
                  <p className="font-serif font-semibold text-foreground">{block.title}</p>
                </div>
                <p className="text-sm md:text-base text-foreground/75 leading-relaxed">
                  {renderInline(block.text)}
                </p>
              </div>
            );
          }
          case "quote":
            return (
              <figure key={i} className="relative my-2 rounded-2xl border border-border/60 bg-card/60 p-6 md:p-8">
                <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/15" aria-hidden="true" />
                <blockquote className="font-serif text-xl md:text-2xl font-medium text-foreground leading-snug">
                  &ldquo;{block.text}&rdquo;
                </blockquote>
                {block.attribution && (
                  <figcaption className="mt-3 text-sm text-muted-foreground">
                    — {block.attribution}
                  </figcaption>
                )}
              </figure>
            );
          case "stat":
            return (
              <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {block.items.map((s, j) => (
                  <div
                    key={j}
                    className="rounded-2xl border border-border/60 bg-card/60 p-5 text-center"
                  >
                    <p className="font-serif text-3xl font-semibold text-primary leading-none">
                      {s.value}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>
            );
          case "screen": {
            const Screen = SCREENS[block.screen];
            return (
              <figure key={i} className="my-4">
                <ShowcaseStage screen={Screen} tone={block.tone ?? "sage"} crop />
                {block.caption && (
                  <figcaption className="mt-3 text-center text-sm text-muted-foreground/80 italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          case "cta": {
            const label = block.buttonLabel ?? "Start your first week — free";
            const href = block.buttonHref ?? "/signup";
            return (
              <div
                key={i}
                className="my-4 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-sage/[0.05] to-background p-6 md:p-8 text-center"
              >
                <h3 className="text-xl md:text-2xl font-serif font-semibold text-foreground mb-2">
                  {block.title}
                </h3>
                <p className="mx-auto mb-5 max-w-md text-sm md:text-base text-foreground/75 leading-relaxed">
                  {block.text}
                </p>
                <Button
                  size="lg"
                  className="rounded-xl bg-gradient-to-r from-primary to-sage-dark shadow-md hover:from-primary/90 hover:to-sage-dark/90"
                  asChild
                >
                  <Link to={href}>
                    {label} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};

export default GuideContent;
