import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Snowflake, Search, HelpCircle, ShoppingCart, Flame, Lightbulb } from "lucide-react";
import { ContentCard, IconTile } from "./primitives";

const SCENES = [
  { time: "4:45 PM", icon: Snowflake, color: "from-sky to-primary", text: "\"Ugh, I forgot to defrost the chicken.\"" },
  { time: "5:10 PM", icon: Search, color: "from-violet to-primary", text: "Scrolling through 400 saved recipes... nothing sounds good." },
  { time: "5:25 PM", icon: HelpCircle, color: "from-coral to-accent", text: "\"Kids, what do you want?\" — \"NUGGETS!\" (for the 4th time)." },
  { time: "5:40 PM", icon: ShoppingCart, color: "from-lemon to-accent", text: "Emergency grocery run. Again." },
  { time: "6:15 PM", icon: Flame, color: "from-coral to-destructive", text: "Cooking something nobody asked for while everyone's hangry." },
];

const TheStruggle = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-14 md:py-20 px-4 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-b from-coral/5 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-3xl relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <IconTile size="xl" gradient="from-coral/15 to-accent/10" className="mb-4">
            <Flame className="w-6 h-6 text-coral" />
          </IconTile>
          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-3 tracking-tight leading-[1.15]">
            Sound familiar?
          </h2>
          <p className="text-muted-foreground/80 text-base leading-relaxed">
            Every family's 5pm looks something like this.
          </p>
        </motion.div>

        {/* Liquid glass bordered container */}
        <ContentCard halo="coral">
          {SCENES.map((scene, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-4 px-5 py-3.5 border-b border-border/20 last:border-b-0 group transition-colors hover:bg-primary/[0.02]"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <span className="text-xs font-mono text-muted-foreground/50 mt-1 shrink-0 w-14">
                {scene.time}
              </span>
              <IconTile size="md" gradient={scene.color}>
                <scene.icon className="w-4 h-4 text-primary-foreground" />
              </IconTile>
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                {scene.text}
              </p>
            </motion.div>
          ))}
        </ContentCard>

        <motion.div
          className="mt-5 text-center"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={6}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-sky flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-primary">
              What if dinner was already figured out before 5pm?
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TheStruggle;
