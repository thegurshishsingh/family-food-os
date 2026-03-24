import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TAG_EXAMPLES: Record<string, string> = {
  "Newborn at home": "3 meals under 20 min, 2 takeout nights, zero Sunday prep required.",
  "Toddler phase": "Flexible meals the whole family eats — no separate toddler cooking.",
  "Picky eaters": "Kid-approved meals every night — no separate cooking.",
  "Sports week": "Quick dinners on practice nights, easy grab-and-go for game days.",
  "Guests visiting": "Scale up for the nights they're there, back to normal the rest of the week.",
  "One parent traveling": "Simplified plan for one adult — fewer dishes, easier nights.",
  "Budget-tight week": "Stretch one protein across 3 meals. No waste, no overbuying.",
  "High-protein goals": "Every dinner hits 30g+ protein without turning into a meal prep chore.",
  "Low-cleanup mode": "Sheet pan meals, one-pot dinners, and smart leftover nights all week.",
};

const TAGS = Object.keys(TAG_EXAMPLES);

const InteractiveTagCloud = () => {
  const [selected, setSelected] = useState(TAGS[0]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2.5 mb-6">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelected(tag)}
            className={`px-4 py-2 rounded-full text-sm border transition-all cursor-pointer ${
              selected === tag
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-sage-light text-primary border-primary/10 hover:border-primary/30"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={selected}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-center text-base md:text-lg text-foreground/80 font-medium italic max-w-xl mx-auto mb-10"
        >
          "{TAG_EXAMPLES[selected]}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default InteractiveTagCloud;
