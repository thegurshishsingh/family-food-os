import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Flame, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  confirming,
}: SwapMealDialogProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onSelect(suggestions[selectedIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!confirming) { setSelectedIndex(null); onOpenChange(o); } }}>
      <DialogContent className="max-w-lg sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Swap {dayName}'s meal
          </DialogTitle>
          <DialogDescription>
            {currentMealName
              ? `Pick a replacement for "${currentMealName}". Your grocery list will update automatically.`
              : "Choose one of these suggestions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <AnimatePresence>
            {suggestions.map((meal, i) => {
              const isSelected = selectedIndex === i;
              return (
                <motion.div
                  key={meal.meal_name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card
                    className={`cursor-pointer transition-all p-4 ${
                      isSelected
                        ? "ring-2 ring-primary shadow-md bg-primary/5"
                        : "hover:shadow-sm hover:border-primary/30"
                    }`}
                    onClick={() => !confirming && setSelectedIndex(i)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">{meal.meal_name}</h3>
                          {meal.cuisine_type && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {meal.cuisine_type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{meal.meal_description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {meal.prep_time_minutes && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {meal.prep_time_minutes} min
                            </span>
                          )}
                          {meal.calories && (
                            <span className="inline-flex items-center gap-1">
                              <Flame className="w-3 h-3" /> {meal.calories} cal
                            </span>
                          )}
                          {meal.protein_g && (
                            <span>{meal.protein_g}g protein</span>
                          )}
                        </div>
                        {meal.ingredients && (
                          <p className="text-[11px] text-muted-foreground/60 mt-2 line-clamp-1">
                            {meal.ingredients.map(i => i.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected ? "border-primary bg-primary" : "border-border"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => { setSelectedIndex(null); onOpenChange(false); }} disabled={confirming}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIndex === null || confirming}>
            {confirming ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Swapping…
              </>
            ) : (
              "Confirm swap"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwapMealDialog;
