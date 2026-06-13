import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Sparkles, Clock, Flame, ChefHat, Check } from "lucide-react";
import { DAYS, type PlanDay } from "./types";
import type { MealSuggestion } from "./SwapMealDialog";
import { formatCalories, formatGrams } from "@/lib/nutritionFormat";

interface MealSearchProps {
  days: PlanDay[];
  householdId: string;
  todayDow: number;
  onAdded: (dayId: string, meal: MealSuggestion) => void;
}

const MealSearch = ({ days, householdId, todayDow, onAdded }: MealSearchProps) => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [previewMeal, setPreviewMeal] = useState<MealSuggestion | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Days ordered from today onward so the picker matches the plan view.
  const orderedDays = [...days].sort((a, b) => {
    const ra = (a.day_of_week - todayDow + 7) % 7;
    const rb = (b.day_of_week - todayDow + 7) % 7;
    return ra - rb;
  });

  const handleSearch = async () => {
    const name = query.trim().slice(0, 200);
    if (!name) return;
    if (days.length === 0) {
      toast({ variant: "destructive", title: "Generate a plan first", description: "You need a weekly plan before adding meals." });
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("swap-meal", {
        body: {
          plan_day_id: days[0].id,
          household_id: householdId,
          action: "preview",
          selected_meal: { meal_name: name, meal_description: "" },
        },
      });
      if (error) throw error;
      if (data?.meal) {
        setPreviewMeal(data.meal);
        const todayDay = orderedDays.find((d) => d.day_of_week === todayDow);
        setSelectedDayId(todayDay?.id ?? orderedDays[0]?.id ?? null);
        setDialogOpen(true);
      } else {
        throw new Error("No recipe returned");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Couldn't find that recipe", description: err.message });
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!previewMeal || !selectedDayId) return;
    setConfirming(true);
    try {
      const { data, error } = await supabase.functions.invoke("swap-meal", {
        body: {
          plan_day_id: selectedDayId,
          household_id: householdId,
          action: "confirm",
          selected_meal: previewMeal,
        },
      });
      if (error) throw error;
      if (data?.meal) {
        onAdded(selectedDayId, data.meal);
        const dayName = DAYS[days.find((d) => d.id === selectedDayId)?.day_of_week ?? 0];
        toast({ title: "Meal added!", description: `${data.meal.meal_name} is now on ${dayName}. Grocery list updated.` });
        setDialogOpen(false);
        setPreviewMeal(null);
        setQuery("");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Couldn't add meal", description: err.message });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      {/* Search bar */}
      <div className="mb-5 glass-card rounded-2xl border border-border/40 p-3 sm:p-4">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> Search any meal
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              placeholder="e.g. Chicken parmesan, Thai green curry…"
              maxLength={200}
              disabled={searching}
              className="pl-9 h-11 text-sm bg-background/60"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || searching}
            className="h-11 gap-1.5 rounded-xl sm:min-w-[130px]"
          >
            {searching ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Finding…
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Find recipe
              </>
            )}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed">
          We'll build the recipe with ingredients & nutrition, then you pick a day to add it.
        </p>
      </div>

      {/* Recipe + day picker dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!confirming) setDialogOpen(o); }}>
        <DialogContent className="flex flex-col max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[88vh] overflow-hidden p-0 rounded-lg gap-0">
          <div className="px-5 pt-5 pb-3 border-b border-border/60">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg sm:text-xl">{previewMeal?.meal_name}</DialogTitle>
              <DialogDescription className="text-sm">
                Review the recipe, then choose which day to add it to.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="px-5 py-4 space-y-5">
              {previewMeal && (
                <>
                  {previewMeal.meal_description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{previewMeal.meal_description}</p>
                  )}

                  {/* Meta pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {previewMeal.cuisine_type && <Badge variant="secondary" className="text-[10px]">{previewMeal.cuisine_type}</Badge>}
                    {previewMeal.prep_time_minutes && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> {previewMeal.prep_time_minutes} min
                      </span>
                    )}
                    {formatCalories(previewMeal.calories) && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3" /> {formatCalories(previewMeal.calories)}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/70">per serving</span>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Protein", value: previewMeal.protein_g },
                      { label: "Carbs", value: previewMeal.carbs_g },
                      { label: "Fat", value: previewMeal.fat_g },
                      { label: "Fiber", value: previewMeal.fiber_g },
                    ].map(({ label, value }) => {
                      const display = formatGrams(value);
                      return display ? (
                        <div key={label} className="text-center rounded-lg bg-muted py-1.5 px-1 border border-border/60">
                          <p className="text-xs font-semibold text-foreground">{display}</p>
                          <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
                        </div>
                      ) : null;
                    })}
                  </div>

                  {/* Ingredients */}
                  {previewMeal.ingredients && previewMeal.ingredients.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <ChefHat className="w-3 h-3" /> Ingredients
                      </h4>
                      <ul className="space-y-0.5">
                        {previewMeal.ingredients.map((ing, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-baseline gap-1.5">
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

                  {/* Steps */}
                  {previewMeal.instructions && previewMeal.instructions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">Steps</h4>
                      <ol className="space-y-1.5">
                        {previewMeal.instructions.map((step, i) => (
                          <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                            <span className="text-primary font-semibold shrink-0 w-4 text-right">{i + 1}.</span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Day picker */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Add to which day?</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {orderedDays.map((d) => {
                        const isSelected = selectedDayId === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDayId(d.id)}
                            disabled={confirming}
                            className={`flex items-center gap-2.5 text-left rounded-xl border p-2.5 transition-all active:scale-[0.98] disabled:opacity-50 ${
                              isSelected ? "border-primary ring-2 ring-primary/30 bg-primary/[0.04]" : "border-border/60 hover:border-primary/30"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? "border-primary bg-primary" : "border-border"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {DAYS[d.day_of_week]}
                                {d.day_of_week === todayDow && <span className="ml-1.5 text-[10px] text-primary font-semibold">TODAY</span>}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {d.meal_name ? `Replaces: ${d.meal_name}` : "Empty"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border/60 bg-background flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={confirming} className="h-9 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!selectedDayId || confirming} className="h-9 text-xs gap-1.5 min-w-[120px]">
              {confirming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Add to plan
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MealSearch;
