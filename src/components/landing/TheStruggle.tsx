import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Snowflake, Search, HelpCircle, ShoppingCart, Flame, Lightbulb, Clock } from "lucide-react";
import { ContentCard, IconTile, ShowcaseStage, FloatingStatCard } from "./primitives";
import { DailyDinnerScreen } from "./screens";

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
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-b from-coral/5 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={initialState}
          whileInView="visible"
          viewport={viewport}
          variants={fadeUp}
          custom={0}
        >
          <IconTile size="xl" gradient="from-coral/15 to-accent/10" className="mb-5">
            <Flame className="w-6 h-6 text-coral" />
          </IconTile>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-4 tracking-tight leading-[1.1]">
            Dinner doesn't fall apart<br className="hidden md:block" /> because families lack recipes.
          </h2>
          <p className="text-muted-foreground/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            It falls apart because life changes — and most weeks, every 5pm looks something like this.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Left — the 5pm chaos timeline */}
          <motion.div
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={1}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral mb-4 flex items-center gap-2">
              <span className="h-px w-6 bg-coral/40" /> Without a system
            </p>
            <ContentCard halo="coral">
              {SCENES.map((scene, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 px-5 py-3.5 border-b border-border/20 last:border-b-0"
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
                </div>
              ))}
            </ContentCard>
          </motion.div>

          {/* Right — the calm alternative, shown in the real app */}
          <motion.div
            className="flex flex-col items-center"
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={2}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary mb-4 flex items-center gap-2 self-center md:self-start">
              <span className="h-px w-6 bg-primary/40" /> With Family Food OS
            </p>
            <div className="w-full">
              <ShowcaseStage
                tone="coral"
                screen={DailyDinnerScreen}
                phoneWidth="w-[244px] sm:w-[268px]"
                crop
                cropHeightClassName="h-[320px] sm:h-[348px]"
                cards={[
                  {
                    pos: "top-10 -right-4 sm:-right-8 w-[138px]",
                    delay: 0.7,
                    node: (
                      <FloatingStatCard icon={Flame} label="Streak" value="5" unit="days" tone="coral" showArrow />
                    ),
                  },
                  {
                    pos: "bottom-16 -left-4 sm:-left-8 w-[140px]",
                    delay: 1.3,
                    hideOnMobile: true,
                    node: (
                      <FloatingStatCard icon={Clock} label="Tonight" value="10" unit="min" tone="sky" showArrow />
                    ),
                  },
                ]}
              />
            </div>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-sky flex items-center justify-center">
                <Lightbulb className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary">
                Dinner figured out before 5pm.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TheStruggle;
