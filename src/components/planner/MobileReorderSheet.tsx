import { useState, useCallback, useRef } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Lock, Check } from "lucide-react";
import { DAYS, MODE_CONFIG, type PlanDay } from "./types";

interface MobileReorderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: PlanDay[];
  onReorder: (sourceId: string, targetId: string) => void;
}

const MobileReorderSheet = ({ open, onOpenChange, days, onReorder }: MobileReorderSheetProps) => {
  const [orderedDays, setOrderedDays] = useState<PlanDay[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const touchStartY = useRef(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Sync when opening
  const handleOpenChange = useCallback((o: boolean) => {
    if (o) setOrderedDays([...days]);
    else {
      setDraggingIndex(null);
      setOverIndex(null);
    }
    onOpenChange(o);
  }, [days, onOpenChange]);

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    if (orderedDays[index].is_locked) return;
    touchStartY.current = e.touches[0].clientY;
    setDraggingIndex(index);
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingIndex === null) return;
    const currentY = e.touches[0].clientY;

    // Find which item we're over
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (currentY >= rect.top && currentY <= rect.bottom && i !== draggingIndex) {
        setOverIndex(i);
        return;
      }
    }
    setOverIndex(null);
  };

  const handleTouchEnd = () => {
    if (draggingIndex !== null && overIndex !== null && draggingIndex !== overIndex) {
      const sourceDay = orderedDays[draggingIndex];
      const targetDay = orderedDays[overIndex];

      if (!targetDay.is_locked) {
        // Swap in local state for visual feedback
        const newOrder = [...orderedDays];
        // Swap meal data between the two positions
        const mealFields: (keyof PlanDay)[] = ["meal_name", "meal_description", "meal_mode", "cuisine_type", "prep_time_minutes", "calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "notes", "takeout_budget"];
        const sourceData: any = {};
        const targetData: any = {};
        mealFields.forEach(f => { sourceData[f] = (sourceDay as any)[f]; targetData[f] = (targetDay as any)[f]; });
        newOrder[draggingIndex] = { ...newOrder[draggingIndex], ...targetData };
        newOrder[overIndex] = { ...newOrder[overIndex], ...sourceData };
        setOrderedDays(newOrder);

        // Persist
        onReorder(sourceDay.id, targetDay.id);
        if (navigator.vibrate) navigator.vibrate(20);
      }
    }
    setDraggingIndex(null);
    setOverIndex(null);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="font-serif text-lg">Reorder Meals</DrawerTitle>
          <DrawerDescription className="text-sm">
            Hold and drag a meal to swap it with another day.
          </DrawerDescription>
        </DrawerHeader>

        <div
          className="px-4 pb-6 space-y-1.5 overflow-y-auto"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {orderedDays.map((day, i) => {
            const mode = MODE_CONFIG[day.meal_mode];
            const Icon = mode.icon;
            const isDragging = draggingIndex === i;
            const isOver = overIndex === i;
            const isLocked = !!day.is_locked;

            return (
              <div
                key={day.id}
                ref={(el) => { itemRefs.current[i] = el; }}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-3 transition-all select-none
                  ${isDragging ? "bg-primary/10 scale-[1.02] shadow-md z-10 relative" : ""}
                  ${isOver && !isLocked ? "ring-2 ring-primary/40 bg-primary/[0.04]" : ""}
                  ${isLocked ? "opacity-50" : ""}
                  ${!isDragging && !isOver ? "bg-card border border-border/60" : ""}
                `}
              >
                {/* Drag handle */}
                <div
                  className={`touch-none p-1.5 rounded-lg transition-colors ${
                    isLocked ? "text-muted-foreground/30" : "text-muted-foreground active:text-primary active:bg-primary/10"
                  }`}
                  onTouchStart={(e) => handleTouchStart(i, e)}
                >
                  {isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <GripVertical className="w-4 h-4" />
                  )}
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

                {isLocked && (
                  <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </Badge>
                )}
              </div>
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
