import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Flame, Check, RefreshCw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RecipePreviewOverlay from "./RecipePreviewOverlay";

export interface MealSuggestion {
  meal_name: string;
  meal_description: string;
  cuisine_type?: string;
  prep_time_minutes?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  ingredients?: { name: string; quantity: string; unit?: string }[];
  instructions?: string[];
}

interface SwapMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: MealSuggestion[];
  dayName: string;
  currentMealName?: string;
  onSelect: (meal: MealSuggestion) => void;
  onRegenerate: () => void;
  confirming: boolean;
  regenerating: boolean;
}

const SwapMealDialog = ({
  open,
  onOpenChange,
  suggestions,
  dayName,
  currentMealName,
  onSelect,
  onRegenerate,
  confirming,
  regenerating,
}: SwapMealDialogProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onSelect(suggestions[selectedIndex]);
    }
  };

  const startLongPress = useCallback((index: number) => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setPreviewIndex(index);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleCardClick = useCallback((index: number) => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    if (!confirming) setSelectedIndex(index);
  }, [confirming]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!confirming) { setSelectedIndex(null); setPreviewIndex(null); onOpenChange(o); } }}>
      <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 relative">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border/60">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg sm:text-xl">
              Swap {dayName}'s meal
            </DialogTitle>
            <DialogDescription className="text-sm">
              {currentMealName
                ? `Pick a replacement for "${currentMealName}". Your grocery list will update automatically.`
                : "Choose one of these suggestions."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable suggestions */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          <AnimatePresence mode="popLayout">
            {suggestions.map((meal, i) => {
              const isSelected = selectedIndex === i;
              return (
                <motion.div
                  key={`${meal.meal_name}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.08, duration: 0.25 }}
                  layout
                >
                  <Card
                    className={`cursor-pointer transition-all p-3.5 sm:p-4 active:scale-[0.98] ${
                      isSelected
                        ? "ring-2 ring-primary shadow-md bg-primary/[0.04]"
                        : "hover:shadow-sm hover:border-primary/30 border-border/60"
                    }`}
                    onClick={() => handleCardClick(i)}
                    onMouseDown={() => startLongPress(i)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchStart={() => startLongPress(i)}
                    onTouchEnd={cancelLongPress}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isSelected ? "border-primary bg-primary scale-110" : "border-border"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-foreground text-sm sm:text-base leading-snug">
                            {meal.meal_name}
                          </h3>
                          {meal.cuisine_type && (
                            <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5">
                              {meal.cuisine_type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {meal.meal_description}
                        </p>

                        {/* Metric pills */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {meal.prep_time_minutes && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> {meal.prep_time_minutes} min
                            </span>
                          )}
                          {meal.calories && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              <Flame className="w-3 h-3" /> {meal.calories} cal
                            </span>
                          )}
                          {meal.protein_g && (
                            <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              {meal.protein_g}g protein
                            </span>
                          )}
                        </div>

                        {/* Key ingredients preview */}
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <p className="text-[10px] text-muted-foreground/50 mt-1.5 line-clamp-1 leading-relaxed">
                            {meal.ingredients.slice(0, 6).map(ing => ing.name).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Sticky footer */}
        <div className="px-4 py-3 border-t border-border/60 bg-background flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedIndex(null); setPreviewIndex(null); onRegenerate(); }}
            disabled={confirming || regenerating}
            className="gap-1.5 text-muted-foreground text-xs h-9"
          >
            {regenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-[1.5px] border-muted-foreground border-t-transparent rounded-full animate-spin" />
                Loading…
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                New ideas
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedIndex(null); onOpenChange(false); }}
              disabled={confirming}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={selectedIndex === null || confirming}
              className="h-9 text-xs gap-1.5 min-w-[100px]"
            >
              {confirming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Swapping…
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Confirm
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Long-press recipe preview overlay */}
        <AnimatePresence>
          {previewIndex !== null && suggestions[previewIndex] && (
            <RecipePreviewOverlay
              meal={suggestions[previewIndex]}
              onClose={() => setPreviewIndex(null)}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default SwapMealDialog;
