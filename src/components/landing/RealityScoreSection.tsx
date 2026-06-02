import { motion } from "framer-motion";
import { Gauge, ShieldCheck, Sparkles, ChefHat, Clock, TrendingUp } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { IconTile, ShowcaseStage, FloatingStatCard } from "./primitives";
import { RealityScoreScreen } from "./screens";

const PILLARS = [
  {
    icon: ChefHat,
    title: "Cook-to-convenience balance",
    desc: "It weighs cook nights against takeout and leftovers so the week never asks more than you've got.",
  },
  {
    icon: Clock,
    title: "Prep time vs. your tolerance",
    desc: "Every cook night is checked against the energy you actually said you have — not an ideal version of you.",
  },
  {
    icon: ShieldCheck,
    title: "Family context & safety",
    desc: "Allergies, kids' ages, picky eaters, and weekly stressors all pull the score up or down.",
  },
];

const RealityScoreSection = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-0 w-[480px] h-[480px] rounded-full bg-gradient-to-r from-warm/[0.06] to-transparent blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Copy */}
          <motion.div
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 mb-5 text-muted-foreground/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <Gauge className="w-3.5 h-3.5 text-accent" />
              The Reality Score
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-5 tracking-tight leading-[1.1]">
              The score your whole{" "}
              <span className="italic text-sage-dark">week is graded on.</span>
            </h2>
            <p className="text-muted-foreground/80 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Every plan gets a Reality Score from 0–100 — an honest read on whether
              this week is actually doable for your family. It's the metric the whole
              system optimizes for, so you never over-commit to a fantasy week.
            </p>

            <div className="space-y-6 max-w-md">
              {PILLARS.map((p, i) => (
                <motion.div
                  key={p.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <IconTile size="lg" gradient="from-accent/20 to-warm/10">
                    <p.icon className="w-5 h-5 text-accent" strokeWidth={1.7} />
                  </IconTile>
                  <div>
                    <h3 className="text-base md:text-lg font-serif font-semibold text-foreground mb-1 tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Phone showcase */}
          <motion.div
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={1}
          >
            <ShowcaseStage
              tone="amber"
              screen={RealityScoreScreen}
              phoneWidth="w-[244px] sm:w-[268px]"
              crop
              cropHeightClassName="h-[320px] sm:h-[348px]"
              cards={[
                {
                  pos: "top-10 -left-4 sm:-left-9 w-[150px]",
                  delay: 0.6,
                  node: (
                    <FloatingStatCard
                      icon={Gauge}
                      label="Reality score"
                      value="68"
                      unit="/100"
                      tone="accent"
                      status="Moderate"
                      statusTone="accent"
                      showArrow
                    />
                  ),
                },
                {
                  pos: "bottom-20 -right-4 sm:-right-9 w-[150px]",
                  delay: 1.3,
                  hideOnMobile: true,
                  node: (
                    <FloatingStatCard
                      icon={TrendingUp}
                      label="Doable week"
                      value="86"
                      unit="%"
                      tone="primary"
                      trend="up"
                      trendTone="primary"
                    />
                  ),
                },
              ]}
            />
            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold text-foreground/80">
                  Honest about what your week can really hold.
                </span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RealityScoreSection;
