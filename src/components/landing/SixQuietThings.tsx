import { motion } from "framer-motion";
import { CalendarDays, ShoppingBasket, MessageSquare, BookOpen, Leaf, Clock } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const ITEMS = [
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
    icon: MessageSquare,
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

const SixQuietThings = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="container max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-14"
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

        <motion.div
          className="rounded-3xl bg-background/95 backdrop-blur-sm border border-border/40 shadow-xl overflow-hidden"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={1}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                className="p-7 md:p-9 border-border/40 border-b last:border-b-0 sm:[&:nth-child(2n)]:border-r-0 sm:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0 lg:[&:nth-child(2n)]:border-r group hover:bg-primary/[0.02] transition-colors"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: 0.05 * i, duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -2 }}
              >
                <div className="mb-5">
                  <item.icon className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl md:text-[22px] font-serif font-semibold text-foreground mb-3 tracking-tight leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SixQuietThings;
