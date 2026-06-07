import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
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
import { getCategory, type Guide, type ScreenKey } from "@/content/guides";
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

interface GuideCardProps {
  guide: Guide;
  /** Larger horizontal layout for the featured pillar guide. */
  variant?: "default" | "feature";
  index?: number;
}

const GuideCard = ({ guide, variant = "default", index = 0 }: GuideCardProps) => {
  const category = getCategory(guide.category);
  const Screen = SCREENS[guide.heroScreen];
  const href = `/guides/${guide.slug}`;

  if (variant === "feature") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60"
      >
        <div className="grid grid-cols-1 items-center gap-6 p-6 md:grid-cols-2 md:gap-10 md:p-8">
          <div className="order-2 md:order-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {category.label}
            </span>
            <h2 className="mt-3 font-serif text-2xl md:text-3xl font-semibold leading-tight tracking-tight text-foreground">
              <Link to={href} className="transition-colors hover:text-primary">
                <span className="absolute inset-0" aria-hidden="true" />
                {guide.title}
              </Link>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{guide.excerpt}</p>
            <div className="mt-5 flex items-center gap-3 text-sm font-medium text-primary">
              <span className="inline-flex items-center gap-1.5">
                Read the guide <ArrowUpRight className="h-4 w-4" />
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                <Clock className="h-3.5 w-3.5" /> {guide.readMinutes} min read
              </span>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <ShowcaseStage screen={Screen} tone={guide.tone} crop cropHeightClassName="h-[230px] sm:h-[260px]" />
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.25) }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_32px_-12px_hsl(var(--primary)/0.25)]"
    >
      <div className="relative h-[150px] overflow-hidden border-b border-border/50">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            guide.tone === "sky" && "from-sky/[0.14] to-background",
            guide.tone === "sage" && "from-primary/[0.12] to-background",
            guide.tone === "amber" && "from-warm/[0.16] to-background",
            guide.tone === "coral" && "from-coral/[0.13] to-background",
          )}
        />
        <div className="absolute left-1/2 top-6 w-[170px] -translate-x-1/2 scale-[0.92] origin-top">
          <ShowcaseStage screen={Screen} tone={guide.tone} crop cropHeightClassName="h-[150px]" phoneWidth="w-[170px]" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">
          {category.label}
        </span>
        <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-foreground">
          <Link to={href} className="transition-colors hover:text-primary">
            <span className="absolute inset-0" aria-hidden="true" />
            {guide.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {guide.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground/70">
          <Clock className="h-3.5 w-3.5" /> {guide.readMinutes} min read
        </div>
      </div>
    </motion.article>
  );
};

export default GuideCard;
