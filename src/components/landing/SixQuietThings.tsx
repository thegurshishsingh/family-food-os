import { motion } from "framer-motion";
import { CalendarDays, ShoppingBasket, MessageSquare, BookOpen, Leaf, Clock } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { IconTile } from "./primitives";
import {
  PhoneFrame,
  WeeklyPlanScreen,
  GroceryScreen,
  InsightsScreen,
} from "./screens";

type Feature = { icon: typeof CalendarDays; title: string; desc: string };

const ROWS: {
  Screen: () => JSX.Element;
  reverse: boolean;
  features: Feature[];
}[] = [
  {
    Screen: WeeklyPlanScreen,
    reverse: false,
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

        <div className="space-y-16 md:space-y-24">
          {ROWS.map((row, i) => {
            const { Screen } = row;
            return (
              <div
                key={i}
                className="grid md:grid-cols-2 gap-10 md:gap-14 items-center"
              >
                {/* Phone */}
                <motion.div
                  className={`flex justify-center ${row.reverse ? "md:order-2" : ""}`}
                  initial={initialState}
                  whileInView="visible"
                  viewport={viewport}
                  variants={fadeUp}
                  custom={1}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  >
                    <PhoneFrame widthClassName="w-[238px] sm:w-[256px]">
                      <Screen />
                    </PhoneFrame>
                  </motion.div>
                </motion.div>

                {/* Copy */}
                <motion.div
                  className={`space-y-7 ${row.reverse ? "md:order-1" : ""}`}
                  initial={initialState}
                  whileInView="visible"
                  viewport={viewport}
                  variants={fadeUp}
                  custom={2}
                >
                  {row.features.map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <IconTile size="lg" gradient="from-primary/15 to-sage/10">
                        <f.icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
                      </IconTile>
                      <div>
                        <h3 className="text-xl md:text-[22px] font-serif font-semibold text-foreground mb-2 tracking-tight leading-snug">
                          {f.title}
                        </h3>
                        <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SixQuietThings;
