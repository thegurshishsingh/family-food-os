import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  CalendarDays,
  ShoppingBasket,
  MessageSquareHeart,
  BookOpen,
  Leaf,
  Clock,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Plans that fit real life.",
    desc: "A realistic mix of cook nights, leftovers, takeout, and dine-out evenings — never seven random recipes.",
  },
  {
    icon: ShoppingBasket,
    title: "Groceries built from the week.",
    desc: "One clean list, organized by aisle, that maps to the meals you'll actually make.",
  },
  {
    icon: MessageSquareHeart,
    title: "Check-ins that make next week smarter.",
    desc: "A 5-second tap after dinner. The system learns what worked, what flopped, what to repeat.",
  },
  {
    icon: BookOpen,
    title: "Meal memory your family can build on.",
    desc: "Loved meals get saved automatically. Your library grows with every dinner you actually enjoy.",
  },
  {
    icon: Leaf,
    title: "Seasonal requests when you want something fresh.",
    desc: "Ask for cozy soups, summer grills, or back-to-school easy nights. The plan responds.",
  },
  {
    icon: Clock,
    title: "Time back you can actually feel.",
    desc: "No 5pm scramble. No grocery do-overs. Just dinner, handled — every week.",
  },
];

const HowItWorksPlayful = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-sage/[0.07] blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-14 md:mb-20 max-w-2xl mx-auto"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary/80">
              The system
            </span>
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-foreground mb-5 tracking-[-0.02em] leading-[1.05]">
            Six quiet things<br /> that change your week.
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg leading-relaxed font-light">
            Family Food OS isn't a recipe app. It's the small system that makes dinner
            feel handled — and gets better the longer you use it.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 rounded-3xl overflow-hidden border border-border/40">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-card p-8 md:p-10 group hover:bg-primary/[0.02] transition-colors duration-300"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-medium text-foreground mb-3 tracking-[-0.01em] leading-snug">
                {feature.title}
              </h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed font-light">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksPlayful;
