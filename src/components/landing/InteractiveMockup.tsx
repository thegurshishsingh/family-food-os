import { motion, AnimatePresence } from "framer-motion";
import { useMockupMode, type MockupMode } from "./mockupModeStore";
import {
  Utensils,
  Package,
  Store,
  UtensilsCrossed,
  Clock,
  Check,
  Repeat,
  X,
  Flame,
  ShoppingBag,
  MapPin,
  Heart,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "cook" | "leftovers" | "takeout" | "dine_out";

const MODES: { id: Mode; label: string; icon: typeof Utensils; gradient: string }[] = [
  { id: "cook", label: "Cook", icon: Utensils, gradient: "from-primary to-sage-dark" },
  { id: "leftovers", label: "Leftovers", icon: Package, gradient: "from-sage to-primary" },
  { id: "takeout", label: "Takeout", icon: Store, gradient: "from-accent to-accent/70" },
  { id: "dine_out", label: "Dine Out", icon: UtensilsCrossed, gradient: "from-sage-dark to-primary" },
];

type Mode = MockupMode;

const MODES: { id: Mode; label: string; icon: typeof Utensils; gradient: string }[] = [
  { id: "cook", label: "Cook", icon: Utensils, gradient: "from-primary to-sage-dark" },
  { id: "leftovers", label: "Leftovers", icon: Package, gradient: "from-sage to-primary" },
  { id: "takeout", label: "Takeout", icon: Store, gradient: "from-accent to-accent/70" },
  { id: "dine_out", label: "Dine Out", icon: UtensilsCrossed, gradient: "from-sage-dark to-primary" },
];

const InteractiveMockup = () => {
  const [mode, setMode] = useMockupMode();
  const active = MODES.find((m) => m.id === mode)!;

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Mode tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {MODES.map((m) => {
          const isActive = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all",
                isActive
                  ? `text-primary-foreground bg-gradient-to-r ${m.gradient} shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.4)]`
                  : "text-muted-foreground bg-muted/60 hover:bg-muted",
              )}
              aria-pressed={isActive}
            >
              <m.icon className="w-3 h-3" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Phone frame */}
      <div className="relative mx-auto" style={{ perspective: "1200px" }}>
        <div className="absolute -inset-10 bg-gradient-to-br from-primary/15 via-sage/10 to-accent/10 rounded-[3rem] blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-[320px] h-[640px] rounded-[3rem] bg-foreground/90 p-2 shadow-[0_30px_60px_-15px_hsl(var(--primary)/0.35)]">
          {/* Notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3 w-28 h-6 bg-foreground rounded-full z-10" />
          {/* Screen */}
          <div className="relative w-full h-full rounded-[2.4rem] bg-background overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-7 pt-3 pb-1 text-[10px] font-semibold text-foreground/70">
              <span>9:41</span>
              <span className="font-mono">●●●</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-10 bottom-0 px-5 pb-5 overflow-hidden flex flex-col"
              >
                <ScreenHeader mode={active} />
                {mode === "cook" && <CookScreen />}
                {mode === "leftovers" && <LeftoversScreen />}
                {mode === "takeout" && <TakeoutScreen />}
                {mode === "dine_out" && <DineOutScreen />}
              </motion.div>
            </AnimatePresence>

            {/* Tab bar */}
            <div className="absolute inset-x-0 bottom-0 h-12 border-t border-border/40 bg-background/95 backdrop-blur-md flex items-center justify-around text-[9px] font-medium text-muted-foreground/70">
              <span className="text-primary">Plan</span>
              <span>Shop</span>
              <span>Pantry</span>
              <span>Profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ScreenHeader({ mode }: { mode: typeof MODES[number] }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Tonight · Thu</p>
        <h3 className="text-xl font-serif font-semibold text-foreground leading-tight">
          {mode.label === "Dine Out" ? "Dinner out" : mode.label === "Takeout" ? "Takeout night" : mode.label === "Leftovers" ? "Leftover night" : "Cook night"}
        </h3>
      </div>
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-primary-foreground bg-gradient-to-r ${mode.gradient}`}>
        <mode.icon className="w-2.5 h-2.5" />
        {mode.label}
      </span>
    </div>
  );
}

function CookScreen() {
  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-sage/10 h-32 flex items-end p-3 mb-3 relative overflow-hidden">
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-[9px] font-bold text-foreground">
          <Clock className="w-2.5 h-2.5" /> 35 min
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary/80">Tonight</p>
          <p className="text-sm font-serif font-semibold text-foreground leading-tight">Lemon herb<br />chicken bowls</p>
        </div>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">You'll need</p>
      <ul className="space-y-1 mb-3">
        {["Chicken thighs", "Jasmine rice", "Lemons · Garlic", "Baby spinach"].map((i) => (
          <li key={i} className="flex items-center gap-2 text-[11px] text-foreground/80">
            <span className="w-1 h-1 rounded-full bg-primary" /> {i}
          </li>
        ))}
      </ul>
      <div className="mt-auto grid grid-cols-3 gap-1.5">
        <ActionBtn icon={Check} label="Cooked it" primary />
        <ActionBtn icon={Repeat} label="Swap" />
        <ActionBtn icon={X} label="Skip" />
      </div>
    </>
  );
}

function LeftoversScreen() {
  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-sage/25 to-primary/10 h-32 flex items-end p-3 mb-3 relative overflow-hidden">
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-[9px] font-bold text-foreground">
          <Flame className="w-2.5 h-2.5" /> 5 min reheat
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-sage-dark">From Tuesday</p>
          <p className="text-sm font-serif font-semibold text-foreground leading-tight">Leftover taco<br />bowls</p>
        </div>
      </div>
      <div className="rounded-xl bg-sage/10 px-3 py-2 mb-3">
        <p className="text-[10px] font-bold text-sage-dark uppercase tracking-wider mb-0.5">Buy once · eat twice</p>
        <p className="text-[11px] text-foreground/75 leading-snug">Tuesday's seasoned beef + rice → tonight's bowls with fresh toppings.</p>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">Just grab</p>
      <ul className="space-y-1 mb-3">
        {["Avocado · Lime", "Shredded lettuce", "Salsa from fridge"].map((i) => (
          <li key={i} className="flex items-center gap-2 text-[11px] text-foreground/80">
            <Check className="w-3 h-3 text-primary" /> {i}
          </li>
        ))}
      </ul>
      <div className="mt-auto grid grid-cols-3 gap-1.5">
        <ActionBtn icon={Check} label="Reheated" primary />
        <ActionBtn icon={Repeat} label="Swap" />
        <ActionBtn icon={X} label="Skip" />
      </div>
    </>
  );
}

function TakeoutScreen() {
  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 h-32 flex items-end p-3 mb-3 relative overflow-hidden">
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-[9px] font-bold text-foreground">
          ~$48
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-accent">Picked for tonight</p>
          <p className="text-sm font-serif font-semibold text-foreground leading-tight">Family sushi<br />takeout</p>
        </div>
      </div>
      <div className="rounded-xl bg-accent/10 px-3 py-2 mb-3 flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-foreground truncate">Sakura Sushi · 0.6 mi</p>
          <p className="text-[10px] text-muted-foreground">Pickup ready in 25 min</p>
        </div>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">Family picks</p>
      <ul className="space-y-1 mb-3">
        {["🍣 Salmon rolls × 2", "🍱 Kids bento", "🥗 Seaweed salad"].map((i) => (
          <li key={i} className="text-[11px] text-foreground/80">{i}</li>
        ))}
      </ul>
      <div className="mt-auto grid grid-cols-2 gap-1.5">
        <ActionBtn icon={ShoppingBag} label="Order now" primary />
        <ActionBtn icon={Repeat} label="Swap" />
      </div>
    </>
  );
}

function DineOutScreen() {
  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-sage-dark/25 to-primary/15 h-32 flex items-end p-3 mb-3 relative overflow-hidden">
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur text-[9px] font-bold text-foreground">
          7:00 PM
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary/80">Friday ritual</p>
          <p className="text-sm font-serif font-semibold text-foreground leading-tight">Dinner<br />out</p>
        </div>
      </div>
      <div className="rounded-xl bg-primary/8 px-3 py-2 mb-3 flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-foreground truncate">Trattoria Bella</p>
          <p className="text-[10px] text-muted-foreground">Loved by the family · 4.8★</p>
        </div>
      </div>
      <div className="rounded-xl bg-muted/50 px-3 py-2 mb-3 flex items-start gap-2">
        <Leaf className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
        <p className="text-[11px] text-foreground/75 leading-snug">No cooking. No grocery hit. Just a Friday off — kept on purpose.</p>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-1.5">
        <ActionBtn icon={Heart} label="We went" primary />
        <ActionBtn icon={Repeat} label="Swap" />
      </div>
    </>
  );
}

function ActionBtn({ icon: Icon, label, primary }: { icon: typeof Check; label: string; primary?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl py-2 flex flex-col items-center gap-0.5 text-[9px] font-bold",
        primary
          ? "bg-primary text-primary-foreground"
          : "bg-muted/60 text-foreground/70",
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
      {label}
    </div>
  );
}

export default InteractiveMockup;
