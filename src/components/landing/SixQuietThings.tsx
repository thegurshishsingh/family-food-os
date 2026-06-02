import { motion } from "framer-motion";
import {
  CalendarDays,
  ShoppingBasket,
  MessageSquare,
  BookOpen,
  Leaf,
  Clock,
  Gauge,
  Utensils,
  Trash2,
  Heart,
  Repeat,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { IconTile, ShowcaseStage, FloatingStatCard, type StageCard } from "./primitives";
import { WeeklyPlanScreen, GroceryScreen, InsightsScreen } from "./screens";

type Feature = { icon: typeof CalendarDays; title: string; desc: string };
type Tone = "sky" | "sage" | "amber" | "coral";

const ROWS: {
  Screen: () => JSX.Element;
  reverse: boolean;
  tone: Tone;
  cards: StageCard[];
  features: Feature[];
  crop?: boolean;
  cropHeightClassName?: string;
}[] = [
  {
    Screen: WeeklyPlanScreen,
    reverse: false,
    tone: "sage",
    crop: true,
    cropHeightClassName: "h-[348px]",
    cards: [
      {
        pos: "top-10 -left-5 sm:-left-9 w-[148px]",
        delay: 0.6,
        node: (
          <FloatingStatCard
            icon={Gauge}
            label="Reality score"
            value="84"
            unit="/100"
            tone="primary"
            trend="up"
            trendTone="primary"
            showArrow
          />
        ),
      },
      {
        pos: "bottom-16 -right-4 sm:-right-9 w-[140px]",
        delay: 1.3,
        hideOnMobile: true,
        node: (
          <FloatingStatCard icon={Utensils} label="Cook nights" value="3" unit="/ 7" tone="sky" showArrow />
        ),
      },
    ],
    features: [
      {
        icon: CalendarDays,
        title: "Plans that fit real life.",
        desc: "A realistic mix of cook nights, leftovers, takeout, and dine-out evenings — never seven random recipes.",
      },
      {
        icon: Clock,
        title: "Time back you can actually feel.",
        desc: "No 5pm scramble. No grocery do-overs. Just dinner, handled — every week.",
      },
    ],
  },
  {
    Screen: GroceryScreen,
    reverse: true,
    tone: "sky",
    crop: true,
    cropHeightClassName: "h-[340px]",
    cards: [
      {
        pos: "top-12 -right-5 sm:-right-9 w-[146px]",
        delay: 0.7,
        node: (
          <FloatingStatCard icon={ShoppingBasket} label="One list" value="24" unit="items" tone="sky" showArrow />
        ),
      },
      {
        pos: "bottom-16 -left-4 sm:-left-9 w-[150px]",
        delay: 1.4,
        hideOnMobile: true,
        node: (
          <FloatingStatCard
            icon={Trash2}
            label="Less waste"
            value="38"
            unit="%"
            tone="coral"
            trend="down"
            trendTone="coral"
          />
        ),
      },
    ],
    features: [
      {
        icon: ShoppingBasket,
        title: "Groceries built from the week.",
        desc: "One clean list, organized by aisle, that maps to the meals you'll actually make.",
      },
      {
        icon: Leaf,
        title: "Seasonal requests, on demand.",
        desc: "Ask for cozy soups, summer grills, or back-to-school easy nights. The plan responds.",
      },
    ],
  },
  {
    Screen: InsightsScreen,
    reverse: false,
    tone: "amber",
    cards: [
      {
        pos: "top-10 -left-5 sm:-left-9 w-[150px]",
        delay: 0.6,
        node: (
          <FloatingStatCard
            icon={Heart}
            label="Loved meals"
            value="12"
            tone="primary"
            trend="up"
            trendTone="primary"
            showArrow
          />
        ),
      },
      {
        pos: "bottom-16 -right-4 sm:-right-9 w-[150px]",
        delay: 1.3,
        hideOnMobile: true,
        node: (
          <FloatingStatCard
            icon={Repeat}
            label="Repeat hits"
            value="5"
            tone="sky"
            sparkline={[2, 3, 3, 5, 4, 6, 7]}
            showArrow
          />
        ),
      },
    ],
    features: [
      {
        icon: MessageSquare,
        title: "Check-ins that make next week smarter.",
        desc: "A 5-second tap after dinner. The system learns what worked, what flopped, what to repeat.",
      },
      {
        icon: BookOpen,
        title: "Meal memory your family builds on.",
        desc: "Loved meals get saved automatically. Your library grows with every dinner you actually enjoy.",
      },
    ],
  },
];

const SixQuietThings = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="container max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <div className="inline-flex items-center gap-3 mb-5 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-[0.25em]">
            <span className="h-px w-8 bg-border" />
            The System
            <span className="h-px w-8 bg-border" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-4 tracking-tight leading-[1.1]">
            Six quiet things<br className="hidden sm:block" /> that change your week.
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Family Food OS isn't a recipe app. It's the small system that makes dinner feel handled — and gets better the longer you use it.
          </p>
        </motion.div>

        <div className="space-y-8 md:space-y-12">
          {ROWS.map((row, i) => {
            const { Screen } = row;
            return (
              <motion.div
                key={i}
                className="grid md:grid-cols-2 gap-8 md:gap-12 items-center rounded-3xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 sm:p-8 md:p-10 shadow-[0_24px_60px_-32px_hsl(var(--foreground)/0.25)]"
                initial={initialState}
                whileInView="visible"
                viewport={viewport}
                variants={fadeUp}
                custom={1}
              >
                {/* Showcase stage */}
                <div className={`${row.reverse ? "md:order-2" : ""}`}>
                  <ShowcaseStage
                    tone={row.tone}
                    screen={Screen}
                    cards={row.cards}
                    floatDelay={i * 0.4}
                  />
                </div>

                {/* Copy */}
                <div className={`space-y-7 ${row.reverse ? "md:order-1" : ""}`}>
                  {row.features.map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <IconTile size="lg" gradient="from-primary/15 to-sage/10">
                        <f.icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
                      </IconTile>
                      <div>
                        <h3 className="text-xl md:text-[26px] font-serif font-semibold text-foreground mb-2 tracking-tight leading-snug">
                          {f.title}
                        </h3>
                        <p className="text-sm md:text-[16px] text-muted-foreground leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SixQuietThings;
