import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const CHECKIN_CHIPS = [
  { label: "Cooked it", active: true },
  { label: "Ordered out instead", active: false },
  { label: "Kids liked it", active: true },
  { label: "Too much work", active: false },
  { label: "Great leftovers", active: false },
];

const DinnerCheckInPreview = () => {
  const { viewport, isMobile } = useScrollReveal();

  return (
    <div className="relative">
      <div className="relative rounded-lg overflow-hidden flex flex-col w-full bg-card">
        <div className="px-4 pt-3 pb-2 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-[14px] font-serif font-semibold text-foreground leading-tight">Dinner Check-In</h3>
              <p className="text-[9px] text-muted-foreground/70 mt-0.5 leading-relaxed font-medium">A 10-second nightly ritual</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 flex-1 flex flex-col">
          <p className="text-[12px] font-bold text-foreground mb-2.5 tracking-tight">How did dinner go tonight?</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {CHECKIN_CHIPS.map((chip) => (
              <span
                key={chip.label}
                className={`inline-flex items-center gap-1 px-2 py-[5px] rounded-md text-[10px] font-semibold transition-all cursor-default ${
                  chip.active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted/50 text-muted-foreground/60"
                }`}
              >
                {chip.active && <Check className="w-2.5 h-2.5 text-primary" />}
                {chip.label}
              </span>
            ))}
          </div>
          <div className="h-px bg-border/20 mb-3" />
          <div className="rounded-lg bg-primary/5 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-sage-dark flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
              <p className="text-[11px] text-foreground font-semibold leading-relaxed">
                Got it. Thursdays should stay low-effort for your family.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DinnerCheckInPreview;
