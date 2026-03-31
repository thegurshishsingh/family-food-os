import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const SCENES = [
  { time: "4:45 PM", emoji: "😩", text: "\"Ugh, I forgot to defrost the chicken.\"" },
  { time: "5:10 PM", emoji: "📱", text: "Scrolling through 400 saved recipes... nothing sounds good." },
  { time: "5:25 PM", emoji: "🤷", text: "\"Kids, what do you want?\" — \"NUGGETS!\" (for the 4th time)." },
  { time: "5:40 PM", emoji: "🛒", text: "Emergency grocery run. Again." },
  { time: "6:15 PM", emoji: "😤", text: "Cooking something nobody asked for while everyone's hangry." },
];

const TheStruggle = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="container max-w-3xl">
        <motion.div
          className="text-center mb-10"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <span className="text-4xl mb-3 block">🫠</span>
          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-foreground mb-3">
            Sound familiar?
          </h2>
          <p className="text-muted-foreground text-base">
            Every family's 5pm looks something like this.
          </p>
        </motion.div>

        <div className="space-y-3">
          {SCENES.map((scene, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors"
              initial={initialState}
              whileInView="visible"
              viewport={viewport}
              variants={fadeUp}
              custom={i + 1}
            >
              <span className="text-xs font-mono text-muted-foreground/50 mt-1 shrink-0 w-14">
                {scene.time}
              </span>
              <span className="text-xl shrink-0">{scene.emoji}</span>
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                {scene.text}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={6}
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary/8 border border-primary/15">
            <span className="text-lg">💡</span>
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
