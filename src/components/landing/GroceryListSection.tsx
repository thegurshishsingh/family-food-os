import { motion } from "framer-motion";
import { Check, Leaf, Carrot, Beef, Package } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const BULLETS = [
  "Organized by aisle, not by recipe",
  "Auto-adjusts when you swap meals",
  "Knows what's already in your pantry",
  "One list. One trip. No do-overs.",
];

const GroceryCategories = [
  {
    icon: Carrot,
    title: "Produce",
    count: "3 items",
    items: [
      { name: "Lemons", checked: true },
      { name: "Garlic", checked: true },
      { name: "Baby spinach", checked: false },
    ],
    gradient: "from-primary to-sage-dark",
  },
  {
    icon: Beef,
    title: "Proteins",
    count: "2 items",
    items: [
      { name: "Chicken thighs", checked: true },
      { name: "Salmon", checked: false },
    ],
    gradient: "from-coral to-accent",
  },
  {
    icon: Package,
    title: "Pantry",
    count: "2 items",
    items: [
      { name: "Jasmine rice", checked: false },
      { name: "Black beans", checked: false },
    ],
    gradient: "from-sky to-primary",
  },
];

const GroceryListSection = () => {
  const { fadeUp, viewport, initialState } = useScrollReveal();

  return (
    <section className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 right-0 w-[400px] h-[500px] rounded-full bg-gradient-to-l from-sage-light/30 to-transparent blur-3xl" />
      </div>

      <div className="container max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Phone-style grocery list */}
          <motion.div
            className="flex justify-center lg:justify-start order-2 lg:order-1"
            initial={initialState}
            whileInView="visible"
            viewport={viewport}
            variants={fadeUp}
            custom={1}
          >
            <motion.div
              initial={{ rotate: -3 }}
              whileHover={{ rotate: -1, transition: { duration: 0.4 } }}
            >
              <PhoneFrame widthClassName="w-[268px]">
                <GroceryScreen />
              </PhoneFrame>
            </motion.div>
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
            <div className="inline-flex items-center gap-2 mb-5 text-muted-foreground/70 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <Leaf className="w-3.5 h-3.5 text-primary" />
              The Grocery List
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-foreground mb-5 tracking-tight leading-[1.1]">
              Groceries built<br /> from{" "}
              <span className="italic text-sage-dark">your week.</span>
            </h2>
            <p className="text-muted-foreground/80 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              No more scribbled notes or forgotten ingredients. Your list updates the moment your week does — clean, organized, ready.
            </p>
            <ul className="space-y-3 max-w-md">
              {BULLETS.map((b, i) => (
                <motion.li
                  key={b}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewport}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] text-foreground/85">{b}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GroceryListSection;
