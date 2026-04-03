import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Check, X, Zap } from "lucide-react";

const ROWS = [
  {
    other: "Gives you 7 dinner recipes",
    ours: "Plans your whole week — cook, takeout & leftover nights",
  },
  {
    other: "Starts fresh every week",
    ours: "Learns from last week's dinner check-ins",
  },
  {
    other: "Ignores your real life",
    ours: "Adapts to sports nights, guests & sick days",
  },
  {
    other: "Just a recipe generator",
    ours: "A system that improves week over week",
  },
];

const ComparisonTable = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-10 md:py-14 px-4 relative">
      <div className="container max-w-3xl relative z-10">
        <motion.div
          className="text-center mb-6"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet/15 to-primary/10 mb-3">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-2">
            Not another recipe app
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            See the difference a weekly dinner system makes.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl overflow-hidden glass-strong shadow-xl border border-border/30"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={1}
          style={{
            background: "hsla(var(--card), 0.5)",
            backdropFilter: "blur(24px) saturate(1.8)",
          }}
        >
          {/* Header */}
          <div className="grid grid-cols-2">
            <div className="px-5 py-3 border-b border-r border-border/30">
              <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-[0.15em]">
                Other apps
              </span>
            </div>
            <div className="px-5 py-3 border-b border-border/30 bg-primary/5">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.15em]">
                Family Food OS
              </span>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-2 border-b border-border/20 last:border-b-0"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ delay: 0.15 + i * 0.06 }}
            >
              <div className="px-5 py-3.5 flex items-start gap-2.5 border-r border-border/20">
                <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-destructive/60" />
                </div>
                <span className="text-sm text-muted-foreground leading-snug">{row.other}</span>
              </div>
              <div className="px-5 py-3.5 flex items-start gap-2.5 bg-primary/[0.03]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-sky flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-sm text-foreground font-medium leading-snug">{row.ours}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
