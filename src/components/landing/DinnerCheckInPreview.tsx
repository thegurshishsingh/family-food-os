import { motion } from "framer-motion";
import { Sparkles, CalendarDays, Utensils, Clock, Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const CHECKIN_CHIPS = [
  { label: "Cooked it", active: true },
  { label: "Ordered out instead", active: false },
  { label: "Kids liked it", active: true },
  { label: "Too much work", active: false },
  { label: "Great leftovers", active: false },
];

const LEARNINGS = [
  { icon: CalendarDays, text: "Wednesdays often become takeout", gradient: "from-accent to-coral" },
  { icon: Utensils, text: "Kids prefer low-spice meals", gradient: "from-primary to-sky" },
  { icon: Clock, text: "Thursdays should stay under 25 min", gradient: "from-violet to-primary" },
];

const DinnerCheckInPreview = () => {
  const { viewport, isMobile } = useScrollReveal();

  return (
    <div className="rounded-2xl glass-strong overflow-hidden flex flex-col w-full shadow-xl">
      <div className="px-6 pt-5 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-sky flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-[17px] h-[17px] text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-[17px] font-serif font-semibold text-foreground leading-tight">Dinner Check-In</h3>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed font-medium">A 10-second nightly ritual that helps the system learn.</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 flex-1 flex flex-col">
        <p className="text-[13px] font-bold text-foreground mb-4 tracking-tight">How did dinner go tonight?</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {CHECKIN_CHIPS.map((chip) => (
            <span
              key={chip.label}
              className={`inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[11px] font-semibold transition-all cursor-default ${
                chip.active
                  ? "bg-gradient-to-r from-primary/15 to-sky/10 text-primary border border-primary/20 shadow-sm"
                  : "glass text-muted-foreground/70 hover:text-muted-foreground"
              }`}
            >
              {chip.active && <Check className="w-3 h-3 text-primary" />}
              {chip.label}
            </span>
          ))}
        </div>
        <div className="h-px bg-border/30 mb-5" />
        <div className="rounded-xl glass border-primary/10 px-4 py-3.5 mb-5 bg-gradient-to-r from-primary/5 to-sky/3">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-sky flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <p className="text-[13px] text-foreground font-semibold leading-relaxed">
              Got it. Thursdays should stay low-effort for your family.
            </p>
          </div>
        </div>
        <div className="mt-auto pt-1">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em] mb-3">This week's learning</p>
          <div className="space-y-2">
            {LEARNINGS.map((item, i) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, y: isMobile ? 0 : 4 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                  <item.icon className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-[12px] text-muted-foreground/80 leading-snug font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DinnerCheckInPreview;
