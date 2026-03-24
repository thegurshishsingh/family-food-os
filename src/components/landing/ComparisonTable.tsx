import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Check, X } from "lucide-react";

const ROWS = [
  {
    other: "Gives you 7 dinner recipes",
    ours: "Plans your whole week including takeout & leftovers",
  },
  {
    other: "Starts fresh every week",
    ours: "Learns from last week's dinner check-ins",
  },
  {
    other: "Ignores your real life",
    ours: "Adapts to sports nights, guests, sick days",
  },
  {
    other: "Just a recipe generator",
    ours: "A system that improves week over week",
  },
];

const ComparisonTable = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <motion.div
      className="mt-12"
      initial={initialState}
      whileInView="visible"
      viewport={viewport}
      variants={fadeUp}
      custom={0}
    >
      <h3 className="text-xl md:text-2xl font-serif font-semibold text-foreground text-center mb-8">
        How we're different
      </h3>
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-2 bg-muted/30 border-b border-border">
          <div className="px-4 py-3 text-xs font-extrabold text-foreground/70 uppercase tracking-widest">
            Other apps
          </div>
          <div className="px-4 py-3 text-xs font-extrabold text-primary uppercase tracking-widest">
            Family Food OS
          </div>
        </div>
        {/* Rows */}
        {ROWS.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-2 border-b border-border/50 last:border-b-0"
          >
            <div className="px-4 py-3.5 flex items-start gap-2 text-sm text-muted-foreground">
              <X className="w-4 h-4 text-destructive/60 shrink-0 mt-0.5" />
              <span>{row.other}</span>
            </div>
            <div className="px-4 py-3.5 flex items-start gap-2 text-sm text-foreground font-medium bg-primary/5">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{row.ours}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ComparisonTable;
