import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Flame, Beef, Wheat, Droplets, Leaf, UtensilsCrossed } from "lucide-react";
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
    { label: "Calories", value: day.calories, unit: "kcal", icon: Flame },
    { label: "Protein", value: day.protein_g ? Number(day.protein_g) : null, unit: "g", icon: Beef },
    { label: "Carbs", value: day.carbs_g ? Number(day.carbs_g) : null, unit: "g", icon: Wheat },
    { label: "Fat", value: day.fat_g ? Number(day.fat_g) : null, unit: "g", icon: Droplets },
    { label: "Fiber", value: day.fiber_g ? Number(day.fiber_g) : null, unit: "g", icon: Leaf },
  ].filter((item) => item.value != null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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

        {/* Nutrition */}
        {nutritionItems.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Nutrition</h4>
              <div className="grid grid-cols-2 gap-3">
                {nutritionItems.map(({ label, value, unit, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">{value} {unit}</p>
                    </div>
                  </div>
                ))}
              </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default MealDetailDialog;
