import { motion } from "framer-motion";
import { Check, Leaf } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import groceriesMockup from "@/assets/app-mockup-groceries.png";

const HIGHLIGHTS = [
  "Organized by aisle, not by recipe",
  "Auto-adjusts when you swap meals",
  "Knows what's already in your pantry",
  "One list. One trip. No do-overs.",
];

const GroceryShowcase = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-sage/[0.08] blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Phone mockup */}
          <motion.div
            className="relative order-2 lg:order-1 mx-auto max-w-[320px] lg:max-w-[380px]"
            initial={{ opacity: 0, y: 40, rotate: 3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={viewport}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute -inset-10 bg-gradient-to-tr from-sage/15 via-primary/10 to-accent/10 rounded-[3rem] blur-3xl" aria-hidden="true" />
            <img
              src={groceriesMockup}
              alt="Family Food OS grocery list on a phone, organized by aisle"
              loading="lazy"
              width={1024}
              height={1536}
              className="relative w-full h-auto drop-shadow-[0_30px_60px_hsl(var(--primary)/0.25)]"
            />
          </motion.div>

          {/* Copy */}
          <motion.div
            className="order-1 lg:order-2"
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 mb-5">
              <Leaf className="w-4 h-4 text-primary/70" strokeWidth={1.75} />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary/80">
                The grocery list
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-foreground mb-5 tracking-[-0.02em] leading-[1.05]">
              Groceries built<br className="hidden md:block" /> from <span className="italic text-primary">your week.</span>
            </h2>
            <p className="text-muted-foreground/80 text-base md:text-lg leading-relaxed font-light mb-8 max-w-md">
              No more scribbled notes or forgotten ingredients. Your list updates the moment your week does — clean, organized, ready.
            </p>
            <ul className="space-y-3">
              {HIGHLIGHTS.map((item, i) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3"
                  initial={initialState}
                  whileInView="visible"
                  viewport={viewport}
                  variants={fadeUp}
                  custom={i + 1}
                >
                  <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 shrink-0">
                    <Check className="w-3 h-3 text-primary" strokeWidth={2.5} />
                  </span>
                  <span className="text-[15px] text-foreground/85 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GroceryShowcase;
