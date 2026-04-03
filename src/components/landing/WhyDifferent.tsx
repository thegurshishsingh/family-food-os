import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Calendar, Soup, BarChart3, ShoppingCart } from "lucide-react";

const POINTS = [
  {
    icon: Calendar,
    gradient: "from-primary to-sky",
    title: "Week-first, not recipe-first",
    desc: "We plan your week around real life — work trips, guests, low-energy days. Not just 7 random recipes.",
  },
  {
    icon: Soup,
    gradient: "from-accent to-coral",
    title: "Leftovers are a strategy",
    desc: "Monday's roast becomes Wednesday's tacos. The system knows, and your grocery list adjusts.",
  },
  {
    icon: BarChart3,
    gradient: "from-violet to-primary",
    title: "Reality Score™",
    desc: "Planning 6 cook nights with a newborn? We'll gently suggest maybe... don't do that.",
  },
  {
    icon: ShoppingCart,
    gradient: "from-lemon to-accent",
    title: "Groceries that make sense",
    desc: "Your list auto-adjusts for takeout nights, leftover days, and guest count. No waste, no \"why did I buy cilantro?\"",
  },
];

const WhyDifferent = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-12 md:py-20 px-4 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] rounded-full bg-gradient-to-tl from-violet/5 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-4xl relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-3">
            This isn't another recipe app
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            It's a weekly dinner system that actually understands your family.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              className="flex gap-4 p-5 rounded-2xl glass-card hover:shadow-lg transition-all group"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${point.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                <point.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-base font-serif font-semibold text-foreground mb-1">
                  {point.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;
