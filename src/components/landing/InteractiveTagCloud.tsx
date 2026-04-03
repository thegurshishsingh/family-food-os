import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

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
            className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${
              selected === tag
                ? "bg-gradient-to-r from-primary to-sage-dark text-primary-foreground shadow-md"
                : "glass text-foreground/70 hover:text-foreground hover:shadow-sm"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="max-w-xl mx-auto mb-10 glass-card rounded-xl px-4 py-3"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-base md:text-lg text-foreground/80 font-medium italic">
              "{TAG_EXAMPLES[selected]}"
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InteractiveTagCloud;
