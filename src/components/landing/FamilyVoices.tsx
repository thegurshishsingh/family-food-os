import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Quote, Star } from "lucide-react";

const VOICES = [
  {
    gradient: "from-primary to-sky",
    name: "Sarah M.",
    family: "Mom of 3, ages 2–8",
    quote: "I used to dread 5pm every single day. Now dinner is just... handled. My husband thought I hired a chef.",
    stars: 5,
  },
  {
    gradient: "from-accent to-coral",
    name: "James R.",
    family: "Single dad, daughter age 6",
    quote: "The leftover planning alone saves me $60 a week. And my daughter actually eats the meals now.",
    stars: 5,
  },
  {
    gradient: "from-violet to-primary",
    name: "Priya & Dev K.",
    family: "Dual-income, toddler + baby",
    quote: "We went from ordering Uber Eats 5x/week to actually cooking 4 nights. And it felt easy?",
    stars: 5,
  },
];

const FamilyVoices = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-10 md:py-14 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-gradient-to-b from-primary/4 via-violet/3 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-4xl relative z-10">
        <motion.div
          className="text-center mb-6"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-violet/10 mb-3">
            <Quote className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-2">
            Real families, real weeks
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {VOICES.map((v, i) => (
            <motion.div
              key={v.name}
              className="p-4 rounded-2xl glass-card flex flex-col hover:shadow-lg transition-all group"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: v.stars }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-lemon text-lemon" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic flex-1 mb-3">
                "{v.quote}"
              </p>
              <div className="flex items-center gap-2.5 pt-2.5 border-t border-border/30">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${v.gradient} flex items-center justify-center text-primary-foreground text-xs font-bold`}>
                  {v.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{v.name}</p>
                  <p className="text-[11px] text-muted-foreground">{v.family}</p>
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
