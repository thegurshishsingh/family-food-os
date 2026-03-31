import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const VOICES = [
  {
    emoji: "👩‍👧‍👦",
    name: "Sarah M.",
    family: "Mom of 3, ages 2–8",
    quote: "I used to dread 5pm every single day. Now dinner is just... handled. My husband thought I hired a chef.",
  },
  {
    emoji: "👨‍👧",
    name: "James R.",
    family: "Single dad, daughter age 6",
    quote: "The leftover planning alone saves me $60 a week. And my daughter actually eats the meals now.",
  },
  {
    emoji: "👩‍❤️‍👨",
    name: "Priya & Dev K.",
    family: "Dual-income, toddler + baby",
    quote: "We went from ordering Uber Eats 5x/week to actually cooking 4 nights. And it felt easy?",
  },
];

const FamilyVoices = () => {
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
            Real families, real weeks 💬
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {VOICES.map((v, i) => (
            <motion.div
              key={v.name}
              className="p-5 rounded-2xl bg-background border border-border flex flex-col"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <p className="text-sm text-foreground/80 leading-relaxed italic flex-1 mb-4">
                "{v.quote}"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <span className="text-2xl">{v.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.family}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FamilyVoices;
