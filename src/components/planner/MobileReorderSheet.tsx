import { useState, useCallback } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Lock, Check } from "lucide-react";
import { DAYS, MODE_CONFIG, type PlanDay } from "./types";

interface MobileReorderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: PlanDay[];
  onReorder: (sourceId: string, targetId: string) => void;
}

const MobileReorderSheet = ({ open, onOpenChange, days, onReorder }: MobileReorderSheetProps) => {
  const [orderedDays, setOrderedDays] = useState<PlanDay[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Sync orderedDays when sheet opens or days change while open
  React.useEffect(() => {
    if (open) {
      setOrderedDays([...days]);
      setSelectedIndex(null);
    }
  }, [open, days]);

  const handleOpenChange = useCallback((o: boolean) => {
    onOpenChange(o);
  }, [onOpenChange]);

  const handleTap = (index: number) => {
    const day = orderedDays[index];
    if (day.is_locked) return;

    if (selectedIndex === null) {
      // First tap — select this day
      setSelectedIndex(index);
      if (navigator.vibrate) navigator.vibrate(15);
    } else if (selectedIndex === index) {
      // Tap same day — deselect
      setSelectedIndex(null);
    } else {
      // Second tap — swap with selected day
      const targetDay = orderedDays[index];
      if (targetDay.is_locked) {
        setSelectedIndex(null);
        return;
      }

      const sourceDay = orderedDays[selectedIndex];
      const mealFields: (keyof PlanDay)[] = ["meal_name", "meal_description", "meal_mode", "cuisine_type", "prep_time_minutes", "calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "notes", "takeout_budget"];
      const sourceData: any = {};
      const targetData: any = {};
      mealFields.forEach(f => { sourceData[f] = (sourceDay as any)[f]; targetData[f] = (targetDay as any)[f]; });

      const newOrder = [...orderedDays];
      newOrder[selectedIndex] = { ...newOrder[selectedIndex], ...targetData };
      newOrder[index] = { ...newOrder[index], ...sourceData };
      setOrderedDays(newOrder);

      onReorder(sourceDay.id, targetDay.id);
      if (navigator.vibrate) navigator.vibrate(20);
      setSelectedIndex(null);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="font-serif text-lg">Reorder Meals</DrawerTitle>
          <DrawerDescription className="text-sm">
            {selectedIndex !== null
              ? `Now tap another day to swap with ${DAYS[orderedDays[selectedIndex].day_of_week].slice(0, 3)}'s meal.`
              : "Tap a meal to select it, then tap another to swap."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-1.5 overflow-y-auto">
          {orderedDays.map((day, i) => {
            const mode = MODE_CONFIG[day.meal_mode];
            const Icon = mode.icon;
            const isSelected = selectedIndex === i;
            const isLocked = !!day.is_locked;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => handleTap(i)}
                disabled={isLocked}
                className={`
                  w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all text-left
                  ${isSelected ? "bg-primary/10 ring-2 ring-primary shadow-md" : "bg-card border border-border/60"}
                  ${isLocked ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"}
                `}
              >
                {/* Swap icon */}
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isSelected ? "text-primary" : isLocked ? "text-muted-foreground/30" : "text-muted-foreground"
                }`}>
                  {isLocked ? <Lock className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
                </div>

                {/* Day label */}
                <div className="w-12 shrink-0">
                  <p className="font-serif font-semibold text-xs text-foreground">
                    {DAYS[day.day_of_week].slice(0, 3)}
                  </p>
                </div>

                {/* Mode badge */}
                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${mode.color}`}>
                  <Icon className="w-2.5 h-2.5" />
                </div>

                {/* Meal name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {day.meal_name || "No meal"}
                  </p>
                </div>

                {isSelected && (
                  <Badge className="text-[10px] shrink-0 bg-primary text-primary-foreground">
                    Selected
                  </Badge>
                )}

                {isLocked && (
                  <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-6 pt-2 border-t border-border/60">
          <Button
            variant="outline"
            className="w-full h-10 text-sm gap-1.5"
            onClick={() => handleOpenChange(false)}
          >
            <Check className="w-4 h-4" />
            Done
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileReorderSheet;
