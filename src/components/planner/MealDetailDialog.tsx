import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Flame, Beef, Wheat, Droplets, Leaf, UtensilsCrossed, ShoppingBasket, ListOrdered } from "lucide-react";
import { MODE_CONFIG, DAYS, type PlanDay } from "./types";

interface MealDetailDialogProps {
  day: PlanDay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MealDetailDialog = ({ day, open, onOpenChange }: MealDetailDialogProps) => {
  if (!day || !day.meal_name) return null;

  const mode = MODE_CONFIG[day.meal_mode];
  const ModeIcon = mode.icon;

  const nutritionItems = [
    { label: "Calories", value: day.calories, unit: "kcal", icon: Flame, accent: "text-orange-500" },
    { label: "Protein", value: day.protein_g ? Number(day.protein_g) : null, unit: "g", icon: Beef, accent: "text-red-500" },
    { label: "Carbs", value: day.carbs_g ? Number(day.carbs_g) : null, unit: "g", icon: Wheat, accent: "text-amber-500" },
    { label: "Fat", value: day.fat_g ? Number(day.fat_g) : null, unit: "g", icon: Droplets, accent: "text-blue-500" },
    { label: "Fiber", value: day.fiber_g ? Number(day.fiber_g) : null, unit: "g", icon: Leaf, accent: "text-green-500" },
  ].filter((item) => item.value != null);

  const ingredients = day.ingredients || [];
  const instructions = day.instructions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6 space-y-5">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground font-medium">{DAYS[day.day_of_week]}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${mode.color}`}>
                  <ModeIcon className="w-3 h-3" />
                  {mode.label}
                </span>
              </div>
              <DialogTitle className="text-xl font-serif">{day.meal_name}</DialogTitle>
            </DialogHeader>

            {day.meal_description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{day.meal_description}</p>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2">
              {day.prep_time_minutes && day.meal_mode === "cook" && (
                <Badge variant="outline" className="gap-1.5">
                  <Clock className="w-3 h-3" /> {day.prep_time_minutes} min
                </Badge>
              )}
              {day.cuisine_type && (
                <Badge variant="outline" className="gap-1.5">
                  <UtensilsCrossed className="w-3 h-3" /> {day.cuisine_type}
                </Badge>
              )}
              {day.takeout_budget && (day.meal_mode === "takeout" || day.meal_mode === "dine_out") && (
                <Badge variant="outline" className="gap-1.5">
                  ${Number(day.takeout_budget).toFixed(0)} budget
                </Badge>
              )}
            </div>

            {/* Macros */}
            {nutritionItems.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-muted-foreground" />
                    Nutrition per serving
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {nutritionItems.map(({ label, value, unit, icon: Icon, accent }) => (
                      <div key={label} className="flex flex-col items-center rounded-xl bg-muted/50 px-2 py-3 text-center">
                        <Icon className={`w-4 h-4 ${accent} mb-1`} />
                        <p className="text-base font-bold text-foreground leading-none">{value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{unit === "kcal" ? "cal" : label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ShoppingBasket className="w-4 h-4 text-muted-foreground" />
                    Ingredients
                    <Badge variant="secondary" className="text-[10px] ml-auto">{ingredients.length} items</Badge>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {ingredients.map((ing, i) => (
                      <li key={i} className="flex items-baseline gap-2 text-sm py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span className="text-foreground">
                          <span className="font-medium">{ing.quantity}{ing.unit ? ` ${ing.unit}` : ""}</span>
                          {" "}
                          <span className="text-muted-foreground">{ing.name}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Instructions */}
            {instructions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-muted-foreground" />
                    Instructions
                  </h4>
                  <ol className="space-y-3">
                    {instructions.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-muted-foreground leading-relaxed pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}

            {/* Notes */}
            {day.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground italic">{day.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MealDetailDialog;
