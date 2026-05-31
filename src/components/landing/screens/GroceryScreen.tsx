import { ShoppingCart, Check, Repeat } from "lucide-react";

const SECTIONS = [
  {
    title: "Produce",
    items: [
      { name: "Bell peppers ×3", done: true },
      { name: "Baby spinach", done: true },
      { name: "Garlic", done: false },
    ],
  },
  {
    title: "Protein",
    items: [
      { name: "Chicken thighs (1kg)", done: true, swapped: true },
      { name: "Firm tofu", done: false },
    ],
  },
  {
    title: "Pantry",
    items: [
      { name: "Coconut milk ×2", done: false },
      { name: "Rice (jasmine)", done: false },
    ],
  },
];

export const GroceryScreen = () => (
  <div className="px-3.5 pt-1 pb-2">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Auto-generated</p>
        <h3 className="text-[16px] font-serif font-semibold text-foreground leading-tight">Grocery list</h3>
      </div>
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <ShoppingCart className="w-4 h-4 text-primary" />
      </div>
    </div>

    <div className="rounded-xl bg-primary/[0.06] border border-primary/15 px-2.5 py-2 mb-3">
      <p className="text-[10px] font-semibold text-foreground leading-snug">
        Built from this week's 7 dinners. Shared items merged, leftovers reused.
      </p>
    </div>

    <div className="space-y-2.5">
      {SECTIONS.map((s) => (
        <div key={s.title}>
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{s.title}</p>
          <div className="space-y-1">
            {s.items.map((it) => (
              <div key={it.name} className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded-md flex items-center justify-center shrink-0 ${
                    it.done ? "bg-primary" : "border border-border"
                  }`}
                >
                  {it.done && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    it.done ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {it.name}
                </span>
                {it.swapped && (
                  <span className="inline-flex items-center gap-0.5 px-1 py-[1px] rounded-full text-[7px] font-bold uppercase bg-accent/20 text-accent-foreground">
                    <Repeat className="w-2 h-2" /> Swapped
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default GroceryScreen;
