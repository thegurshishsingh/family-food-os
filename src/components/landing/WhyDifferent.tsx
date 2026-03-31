import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const POINTS = [
  {
    emoji: "📅",
    title: "Week-first, not recipe-first",
    desc: "We plan your week around real life — work trips, guests, low-energy days. Not just 7 random recipes.",
  },
  {
    emoji: "🍲",
    title: "Leftovers are a strategy",
    desc: "Monday's roast becomes Wednesday's tacos. The system knows, and your grocery list adjusts.",
  },
  {
    emoji: "📊",
    title: "Reality Score™",
    desc: "Planning 6 cook nights with a newborn? We'll gently suggest maybe... don't do that.",
  },
  {
    emoji: "🛒",
    title: "Groceries that make sense",
    desc: "Your list auto-adjusts for takeout nights, leftover days, and guest count. No waste, no \"why did I buy cilantro?\"",
  },
];

const WhyDifferent = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="container max-w-4xl">
        <motion.div
          className="text-center mb-10"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-3">
            This isn't another recipe app 🙅
          </h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            It's a weekly dinner system that actually understands your family.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              className="flex gap-4 p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <span className="text-2xl shrink-0 mt-0.5">{point.emoji}</span>
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
