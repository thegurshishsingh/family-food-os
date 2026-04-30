import { forwardRef } from "react";
import { motion } from "framer-motion";
import { X, Clock, Flame, ChefHat, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MealSuggestion } from "./SwapMealDialog";

interface RecipePreviewOverlayProps {
  meal: MealSuggestion;
  onClose: () => void;
  onSelect?: (meal: MealSuggestion) => void;
  confirming?: boolean;
}

const RecipePreviewOverlay = forwardRef<HTMLDivElement, RecipePreviewOverlayProps>(
  ({ meal, onClose, onSelect, confirming }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 z-50 flex flex-col bg-background text-foreground rounded-lg overflow-hidden shadow-xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2 border-b border-border">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-base text-foreground leading-snug">
              {meal.meal_name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 dark:text-foreground/75">
              {meal.meal_description}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {meal.cuisine_type && (
                <Badge variant="secondary" className="text-[10px]">{meal.cuisine_type}</Badge>
              )}
              {meal.prep_time_minutes && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" /> {meal.prep_time_minutes} min
                </span>
              )}
              {meal.calories && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Flame className="w-3 h-3" /> {meal.calories} cal
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-3 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Protein", value: meal.protein_g, unit: "g" },
                { label: "Carbs", value: meal.carbs_g, unit: "g" },
                { label: "Fat", value: meal.fat_g, unit: "g" },
                { label: "Fiber", value: meal.fiber_g, unit: "g" },
              ].map(({ label, value, unit }) =>
                value ? (
                  <div key={label} className="text-center rounded-lg bg-muted py-1.5 px-1 border border-border/60">
                    <p className="text-xs font-semibold text-foreground">{value}{unit}</p>
                    <p className="text-[10px] font-medium text-muted-foreground dark:text-foreground/75">{label}</p>
                  </div>
                ) : null
              )}
            </div>

            {meal.ingredients && meal.ingredients.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ChefHat className="w-3 h-3" /> Ingredients
                </h4>
                <ul className="space-y-0.5">
                  {meal.ingredients.map((ing, i) => (
                    <li key={i} className="text-xs text-muted-foreground dark:text-foreground/75 flex items-baseline gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>
                        <span className="text-foreground font-medium">{ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}</span>{" "}
                        {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meal.instructions && meal.instructions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Steps
                </h4>
                <ol className="space-y-1.5">
                  {meal.instructions.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-primary font-semibold shrink-0 w-4 text-right">{i + 1}.</span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground">Hold preview</p>
          {onSelect && (
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              disabled={confirming}
              onClick={() => onSelect(meal)}
            >
              {confirming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Swapping…
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Use this
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    );
  }
);

RecipePreviewOverlay.displayName = "RecipePreviewOverlay";

export default RecipePreviewOverlay;
