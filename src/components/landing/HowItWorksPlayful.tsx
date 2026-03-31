import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const STEPS = [
  {
    num: "1",
    emoji: "👨‍👩‍👧‍👦",
    title: "Tell us about your crew",
    desc: "Kids' ages, who's picky, allergies, budget, how much cooking energy you actually have. No judgment — just honesty.",
    color: "bg-sage-light border-primary/15",
  },
  {
    num: "2",
    emoji: "🧠",
    title: "We plan your real week",
    desc: "Not 7 recipes. A realistic mix of cook nights, leftover nights, takeout slots, and dine-out evenings — based on your actual schedule.",
    color: "bg-warm-light border-accent/15",
  },
  {
    num: "3",
    emoji: "🔄",
    title: "It gets smarter every week",
    desc: "After dinner, tap how it went. Over time, the system learns your patterns — and your plans keep getting better.",
    color: "bg-sage-light border-primary/15",
  },
];

const HowItWorksPlayful = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-12 md:py-20 px-4 bg-card/50 border-y border-border">
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
            Here's how it actually works
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Three steps. Five minutes. Your whole week, handled.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className={`relative p-6 rounded-2xl border ${step.color} text-center`}
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <span className="text-4xl mb-3 block">{step.emoji}</span>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-3">
                {step.num}
              </div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksPlayful;
