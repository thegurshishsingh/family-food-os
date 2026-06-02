import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Users, Brain, RefreshCw } from "lucide-react";
import { IconTile } from "./primitives";

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
    <section id="how-it-works" className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-primary/4 via-violet/3 to-sky/4 blur-3xl" />
      </div>

      <div className="container max-w-5xl relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-3 tracking-tight leading-[1.1]">
            Here's how it actually works
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Three steps. Five minutes. Your whole week, handled.
          </p>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-5 md:gap-6">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-[58px] left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/30 via-accent/30 to-violet/30"
            aria-hidden="true"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative p-6 md:p-7 rounded-3xl border border-border/60 bg-card/40 backdrop-blur-sm text-center group hover:shadow-lg transition-all"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${step.glow} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                {/* Numbered icon */}
                <div className="relative inline-flex mb-5">
                  <IconTile size="xl" gradient={step.gradient} shadow="md">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </IconTile>
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border/60 text-[11px] font-bold text-foreground shadow-sm">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-serif font-semibold text-foreground mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm md:text-[15px] text-muted-foreground/85 leading-relaxed">
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
