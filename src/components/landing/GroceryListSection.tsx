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
            <div className="relative w-[280px]">
              <div className="absolute -inset-8 -z-10 bg-gradient-to-br from-primary/10 via-sage-light/20 to-accent/8 blur-3xl rounded-full" />
              <motion.div
                className="rounded-[36px] p-[3px] shadow-[0_30px_80px_-20px_hsl(var(--foreground)/0.35)]"
                style={{
                  background:
                    "linear-gradient(145deg, hsl(var(--foreground)/0.85), hsl(var(--foreground)/0.55), hsl(var(--foreground)/0.75))",
                  transform: "rotate(-3deg)",
                }}
                whileHover={{ rotate: -1, transition: { duration: 0.4 } }}
              >
                <div className="rounded-[33px] bg-background overflow-hidden">
                  <div className="flex items-center justify-between px-5 pt-2 pb-1">
                    <span className="text-[10px] font-semibold text-foreground/70">9:41</span>
                    <div className="w-20 h-5 bg-foreground/85 rounded-full" />
                    <div className="w-4 h-2.5 border border-foreground/40 rounded-[3px]">
                      <div className="w-2.5 h-full bg-primary/60 rounded-[1px]" />
                    </div>
                  </div>
                  <div className="px-4 pt-3 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold text-muted-foreground px-2 py-1 rounded-full bg-muted/60">
                        1 list · 6 meals
                      </span>
                      <span className="text-foreground/40">···</span>
                    </div>
                    <h4 className="text-[22px] font-serif font-semibold text-foreground mb-4 leading-tight">
                      Your week's<br /> groceries
                      <Leaf className="inline-block w-5 h-5 text-primary/70 ml-1 -translate-y-1" />
                    </h4>
                    <div className="space-y-3">
                      {GroceryCategories.map((cat) => (
                        <div key={cat.title} className="rounded-xl bg-muted/40 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                                <cat.icon className="w-3 h-3 text-primary-foreground" />
                              </span>
                              <span className="text-[12px] font-semibold text-foreground">{cat.title}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{cat.count} ⌄</span>
                          </div>
                          <ul className="space-y-1.5 pl-1">
                            {cat.items.map((it) => (
                              <li key={it.name} className="flex items-center gap-2 text-[12px] text-foreground/85">
                                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${it.checked ? "bg-primary border-primary" : "border-foreground/30"}`}>
                                  {it.checked && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
                                </span>
                                <span className={it.checked ? "line-through text-muted-foreground/70" : ""}>{it.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-3 py-2.5 rounded-xl bg-muted/60 text-[12px] font-semibold text-foreground/80 hover:bg-muted transition-colors">
                      ⊕ Add item
                    </button>
                  </div>
                  <div className="flex justify-center pb-2">
                    <div className="w-20 h-[3px] bg-foreground/20 rounded-full" />
                  </div>
                </div>
              </motion.div>
            </div>
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
