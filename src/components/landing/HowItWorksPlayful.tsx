import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Users, Brain, RefreshCw } from "lucide-react";

const STEPS = [
  {
    num: "1",
    icon: Users,
    gradient: "from-primary via-sky to-primary",
    glow: "from-primary/10 to-sky/10",
    title: "Tell us about your crew",
    desc: "Kids' ages, who's picky, allergies, budget, how much cooking energy you actually have.",
  },
  {
    num: "2",
    icon: Brain,
    gradient: "from-accent via-coral to-accent",
    glow: "from-accent/10 to-coral/10",
    title: "We plan your real week",
    desc: "A realistic mix of cook nights, leftover nights, takeout slots, and dine-out evenings.",
  },
  {
    num: "3",
    icon: RefreshCw,
    gradient: "from-violet via-primary to-violet",
    glow: "from-violet/10 to-primary/10",
    title: "It gets smarter every week",
    desc: "After dinner, tap how it went. The system learns your patterns and keeps improving.",
  },
];

const HowItWorksPlayful = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-10 md:py-14 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-primary/4 via-violet/3 to-sky/4 blur-3xl" />
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
          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-2">
            Here's how it actually works
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Three steps. Five minutes. Your whole week, handled.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative p-5 rounded-2xl glass-card text-center group hover:shadow-lg transition-all"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${step.glow} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} mb-3 shadow-lg`}>
                  <step.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full glass-strong text-[10px] font-bold mb-2 text-foreground ml-2">
                  {step.num}
                </div>
                <h3 className="text-base font-serif font-semibold text-foreground mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksPlayful;
