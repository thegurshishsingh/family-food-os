import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, ChefHat, Loader2, X, Plus, Sparkles } from "lucide-react";
import { DAYS } from "./types";

export interface PlanSetupData {
  takeoutCount: number;
  takeoutDays: number[];
  leftoverCount: number;
  leftoverDays: number[];
  specialMeals: string[];
  weekIntensity: "relaxed" | "normal" | "busy";
  lockedSavedMeals: string[];
  savedMealDayAssignments: Record<string, number>;
  weekContextTags: string[];
}

export interface SavedMealOption {
  id: string;
  meal_name: string;
  meal_description: string | null;
  frequency: string;
}

interface WeeklyPlanSetupProps {
  onGenerate: (data: PlanSetupData) => void;
  generating: boolean;
  householdName?: string;
  savedMeals?: SavedMealOption[];
}

const WEEK_CONTEXT_OPTIONS = [
  { value: "chaotic_week", label: "Chaotic week", emoji: "🌪️", desc: "Maximize convenience" },
  { value: "budget_week", label: "Budget-tight", emoji: "💰", desc: "Affordable meals" },
  { value: "sports_week", label: "Sports week", emoji: "⚽", desc: "High energy meals" },
  { value: "guests_visiting", label: "Guests visiting", emoji: "🏠", desc: "Bigger portions" },
  { value: "one_parent_traveling", label: "Solo parenting", emoji: "✈️", desc: "Simpler meals" },
  { value: "low_cleanup_week", label: "Low cleanup", emoji: "🍳", desc: "One-pot meals" },
  { value: "sick_week", label: "Sick week", emoji: "🤒", desc: "Comfort food" },
  { value: "high_protein_week", label: "High protein", emoji: "💪", desc: "Protein-focused" },
  { value: "newborn_in_house", label: "Newborn at home", emoji: "👶", desc: "Very easy meals" },
];

const ALL_STEPS = ["takeout", "leftovers", "saved", "specials", "context", "intensity", "confirm"] as const;
type Step = typeof ALL_STEPS[number];

const WeeklyPlanSetup = ({ onGenerate, generating, householdName, savedMeals = [] }: WeeklyPlanSetupProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("takeout");

  const [takeoutCount, setTakeoutCount] = useState(0);
  const [takeoutDays, setTakeoutDays] = useState<number[]>([]);
  const [leftoverCount, setLeftoverCount] = useState(0);
  const [leftoverDays, setLeftoverDays] = useState<number[]>([]);
  const [lockedSavedMeals, setLockedSavedMeals] = useState<string[]>([]);
  const [savedMealDayAssignments, setSavedMealDayAssignments] = useState<Record<string, number>>({});
  const [specialMeals, setSpecialMeals] = useState<string[]>([]);
  const [mealInput, setMealInput] = useState("");
  const [weekIntensity, setWeekIntensity] = useState<"relaxed" | "normal" | "busy">("normal");
  const [weekContextTags, setWeekContextTags] = useState<string[]>([]);

  // Skip "saved" step if no saved meals
  const activeSteps: readonly Step[] = savedMeals.length > 0
    ? ALL_STEPS
    : ALL_STEPS.filter(s => s !== "saved");

  const stepIdx = activeSteps.indexOf(step);

  // Days already taken by takeout or leftovers
  const takenDays = new Set([...takeoutDays, ...leftoverDays]);
  const availableDaysForMeals = DAYS.map((_, i) => i).filter(i => !takenDays.has(i));
  // Days already assigned to a saved meal
  const assignedDays = new Set(Object.values(savedMealDayAssignments));

  const canAdvance = () => {
    if (step === "takeout" && takeoutCount > 0 && takeoutDays.length < takeoutCount) return false;
    if (step === "leftovers" && leftoverCount > 0 && leftoverDays.length < leftoverCount) return false;
    return true;
  };

  const next = () => {
    if (stepIdx < activeSteps.length - 1) setStep(activeSteps[stepIdx + 1]);
  };
  const back = () => {
    if (stepIdx > 0) setStep(activeSteps[stepIdx - 1]);
  };

  const toggleDay = (dayIdx: number, list: number[], setList: (v: number[]) => void, max: number) => {
    if (list.includes(dayIdx)) {
      setList(list.filter((d) => d !== dayIdx));
    } else if (list.length < max) {
      setList([...list, dayIdx]);
    }
  };

  const toggleSavedMeal = (mealName: string) => {
    setLockedSavedMeals(prev => {
      if (prev.includes(mealName)) {
        // Remove meal and its day assignment
        const newAssignments = { ...savedMealDayAssignments };
        delete newAssignments[mealName];
        setSavedMealDayAssignments(newAssignments);
        return prev.filter(m => m !== mealName);
      }
      return prev.length < 5 ? [...prev, mealName] : prev;
    });
  };

  const assignDayToMeal = (mealName: string, dayIdx: number | null) => {
    setSavedMealDayAssignments(prev => {
      const next = { ...prev };
      if (dayIdx === null) {
        delete next[mealName];
      } else {
        next[mealName] = dayIdx;
      }
      return next;
    });
  };

  const addSpecialMeal = () => {
    const trimmed = mealInput.trim();
    if (trimmed && specialMeals.length < 5 && !specialMeals.includes(trimmed)) {
      setSpecialMeals([...specialMeals, trimmed]);
      setMealInput("");
    }
  };

  const toggleContextTag = (tag: string) => {
    setWeekContextTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleGenerate = () => {
    onGenerate({
      takeoutCount,
      takeoutDays,
      leftoverCount,
      leftoverDays,
      specialMeals,
      weekIntensity,
      lockedSavedMeals,
      savedMealDayAssignments,
      weekContextTags,
    });
  };

  const intensityOptions = [
    { value: "relaxed" as const, label: "Relaxed week", desc: "More time for cooking" },
    { value: "normal" as const, label: "Normal week", desc: "Balanced mix" },
    { value: "busy" as const, label: "Busy week", desc: "Quick & easy meals" },
  ];

  const cookNights = 7 - takeoutCount - leftoverCount;

  const frequencyLabel: Record<string, string> = {
    every_week: "Weekly",
    every_other_week: "Bi-weekly",
    once_a_month: "Monthly",
    occasionally: "Occasional",
  };

  return (
    <>
      {/* Banner */}
      <Card className="border-primary/20 bg-primary/[0.03] shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <h2 className="text-base sm:text-xl font-serif font-semibold text-foreground">
                  Plan this week's dinners
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                We'll create a plan based on {householdName ? `${householdName}'s` : "your family's"} habits.
              </p>
            </div>
            <Button onClick={() => setOpen(true)} className="gap-2 shrink-0 w-full sm:w-auto">
              <ChefHat className="w-4 h-4" />
              Generate this week's plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[85vh] flex flex-col w-[calc(100%-2rem)] mx-auto">
          {/* Progress bar */}
          <div className="h-1 bg-muted shrink-0">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${((stepIdx + 1) / activeSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0">
            <DialogHeader className="mb-4 sm:mb-5">
              <DialogTitle className="text-base sm:text-lg font-serif">
                {step === "takeout" && "Takeout nights"}
                {step === "leftovers" && "Leftover nights"}
                {step === "saved" && "Include saved meals"}
                {step === "specials" && "Special meal requests"}
                {step === "context" && "What's happening this week?"}
                {step === "intensity" && "Week intensity"}
                {step === "confirm" && "Ready to generate"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Step {stepIdx + 1} of {activeSteps.length} in weekly plan setup
              </DialogDescription>
            </DialogHeader>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step: Takeout */}
                {step === "takeout" && (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Do you want to plan any takeout nights this week?
                    </p>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((n) => (
                        <button
                          key={n}
                          onClick={() => { setTakeoutCount(n); if (n === 0) setTakeoutDays([]); }}
                          className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium border transition-all
                            ${takeoutCount === n
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary/30"
                            }`}
                        >
                          {n === 0 ? "No takeout" : `${n} night${n > 1 ? "s" : ""}`}
                        </button>
                      ))}
                    </div>
                    {takeoutCount > 0 && (
                      <div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mb-2">Which day{takeoutCount > 1 ? "s" : ""}?</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {DAYS.map((d, i) => {
                            const selected = takeoutDays.includes(i);
                            const disabled = !selected && takeoutDays.length >= takeoutCount;
                            return (
                              <button
                                key={i}
                                disabled={disabled}
                                onClick={() => toggleDay(i, takeoutDays, setTakeoutDays, takeoutCount)}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-all
                                  ${selected ? "border-primary bg-primary/10 text-primary" : disabled ? "border-border bg-muted/30 text-muted-foreground/40" : "border-border bg-card text-foreground hover:border-primary/30"}`}
                              >
                                {d.slice(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step: Leftovers */}
                {step === "leftovers" && (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Do you want to schedule leftover nights?
                    </p>
                    <div className="flex gap-2">
                      {[0, 1, 2].map((n) => (
                        <button
                          key={n}
                          onClick={() => { setLeftoverCount(n); if (n === 0) setLeftoverDays([]); }}
                          className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium border transition-all
                            ${leftoverCount === n
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary/30"
                            }`}
                        >
                          {n === 0 ? "No leftovers" : `${n} night${n > 1 ? "s" : ""}`}
                        </button>
                      ))}
                    </div>
                    {leftoverCount > 0 && (
                      <div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mb-2">Which day{leftoverCount > 1 ? "s" : ""}?</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {DAYS.map((d, i) => {
                            const selected = leftoverDays.includes(i);
                            const taken = takeoutDays.includes(i);
                            const disabled = taken || (!selected && leftoverDays.length >= leftoverCount);
                            return (
                              <button
                                key={i}
                                disabled={disabled}
                                onClick={() => toggleDay(i, leftoverDays, setLeftoverDays, leftoverCount)}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-all
                                  ${selected ? "border-primary bg-primary/10 text-primary" : disabled ? "border-border bg-muted/30 text-muted-foreground/40" : "border-border bg-card text-foreground hover:border-primary/30"}`}
                              >
                                {d.slice(0, 3)}{taken ? " 🛍" : ""}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step: Saved Meals */}
                {step === "saved" && (
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Pick any saved meals you definitely want this week.
                    </p>
                    <div className="space-y-2 max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1 -mr-1">
                      {savedMeals.map((meal) => {
                        const isSelected = lockedSavedMeals.includes(meal.meal_name);
                        const assignedDay = savedMealDayAssignments[meal.meal_name];
                        return (
                          <div key={meal.id} className="space-y-1.5">
                            <button
                              onClick={() => toggleSavedMeal(meal.meal_name)}
                              className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all flex items-start gap-2.5 sm:gap-3
                                ${isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-card hover:border-primary/30"
                                }`}
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                                ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                                {isSelected && (
                                  <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                  <p className={`text-xs sm:text-sm font-medium truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                                    {meal.meal_name}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground/60 shrink-0">
                                    {frequencyLabel[meal.frequency] || meal.frequency}
                                  </span>
                                </div>
                                {meal.meal_description && (
                                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">{meal.meal_description}</p>
                                )}
                              </div>
                            </button>

                            {/* Day assignment for selected meal */}
                            {isSelected && (
                              <div className="pl-7 sm:pl-9">
                                <p className="text-[10px] sm:text-[11px] text-muted-foreground mb-1.5">
                                  Assign to a day? <span className="text-muted-foreground/50">(optional)</span>
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {DAYS.map((d, i) => {
                                    const isTaken = takenDays.has(i);
                                    const isAssignedToOther = assignedDays.has(i) && assignedDay !== i;
                                    const isAssignedHere = assignedDay === i;
                                    const disabled = isTaken || isAssignedToOther;
                                    return (
                                      <button
                                        key={i}
                                        disabled={disabled}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          assignDayToMeal(meal.meal_name, isAssignedHere ? null : i);
                                        }}
                                        className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-medium border transition-all
                                          ${isAssignedHere
                                            ? "border-primary bg-primary/15 text-primary"
                                            : disabled
                                            ? "border-border/50 bg-muted/20 text-muted-foreground/30"
                                            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                          }`}
                                      >
                                        {d.slice(0, 3)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      {lockedSavedMeals.length > 0
                        ? `${lockedSavedMeals.length} meal${lockedSavedMeals.length > 1 ? "s" : ""} locked in`
                        : "Optional — skip if no preference."}
                    </p>
                  </div>
                )}

                {/* Step: Special meals */}
                {step === "specials" && (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Is there any meal you want to include this week?
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={mealInput}
                        onChange={(e) => setMealInput(e.target.value)}
                        placeholder="e.g. Taco night"
                        className="text-xs sm:text-sm"
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialMeal(); } }}
                      />
                      <Button variant="outline" size="icon" onClick={addSpecialMeal} disabled={!mealInput.trim()} className="shrink-0">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {specialMeals.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {specialMeals.map((m, i) => (
                          <Badge key={i} variant="secondary" className="gap-1 pr-1.5 text-[11px] sm:text-xs">
                            {m}
                            <button onClick={() => setSpecialMeals(specialMeals.filter((_, j) => j !== i))} className="ml-0.5 hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Optional — skip if no preference.</p>
                  </div>
                )}

                {/* Step: Weekly Context */}
                {step === "context" && (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Anything special about this week? Select all that apply.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {WEEK_CONTEXT_OPTIONS.map((opt) => {
                        const isSelected = weekContextTags.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => toggleContextTag(opt.value)}
                            className={`text-left px-3 py-2.5 rounded-xl border transition-all flex items-start gap-2
                              ${isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card hover:border-primary/30"
                              }`}
                          >
                            <span className="text-sm sm:text-base mt-0.5">{opt.emoji}</span>
                            <div className="min-w-0">
                              <p className={`text-[11px] sm:text-xs font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {opt.label}
                              </p>
                              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">{opt.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      {weekContextTags.length > 0
                        ? `${weekContextTags.length} context${weekContextTags.length > 1 ? "s" : ""} selected`
                        : "Optional — skip if it's a normal week."}
                    </p>
                  </div>
                )}

                {step === "intensity" && (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      How busy is your week?
                    </p>
                    <div className="space-y-2">
                      {intensityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setWeekIntensity(opt.value)}
                          className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all
                            ${weekIntensity === opt.value
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-primary/30"
                            }`}
                        >
                          <p className={`text-xs sm:text-sm font-medium ${weekIntensity === opt.value ? "text-primary" : "text-foreground"}`}>
                            {opt.label}
                          </p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Confirm */}
                {step === "confirm" && (
                  <div className="space-y-4">
                    <div className="bg-muted/40 rounded-xl p-3 sm:p-4 space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Cook nights</span>
                        <span className="font-medium text-foreground">{cookNights}</span>
                      </div>
                      {takeoutCount > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Takeout</span>
                          <span className="font-medium text-foreground">{takeoutDays.map((d) => DAYS[d].slice(0, 3)).join(", ")}</span>
                        </div>
                      )}
                      {leftoverCount > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Leftovers</span>
                          <span className="font-medium text-foreground">{leftoverDays.map((d) => DAYS[d].slice(0, 3)).join(", ")}</span>
                        </div>
                      )}
                      {lockedSavedMeals.length > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm gap-2">
                          <span className="text-muted-foreground shrink-0">Saved meals</span>
                          <span className="font-medium text-foreground text-right">
                            {lockedSavedMeals.map(m => {
                              const assignedDay = savedMealDayAssignments[m];
                              return assignedDay !== undefined ? `${m} (${DAYS[assignedDay].slice(0, 3)})` : m;
                            }).join(", ")}
                          </span>
                        </div>
                      )}
                      {specialMeals.length > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm gap-2">
                          <span className="text-muted-foreground shrink-0">Special requests</span>
                          <span className="font-medium text-foreground text-right">{specialMeals.join(", ")}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Week intensity</span>
                        <span className="font-medium text-foreground capitalize">{weekIntensity}</span>
                      </div>
                      {weekContextTags.length > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm gap-2">
                          <span className="text-muted-foreground shrink-0">Context</span>
                          <span className="font-medium text-foreground text-right">
                            {weekContextTags.map(t => WEEK_CONTEXT_OPTIONS.find(o => o.value === t)?.label || t).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-5 sm:mt-6">
              {stepIdx > 0 ? (
                <Button variant="ghost" size="sm" onClick={back} className="gap-1.5 text-xs sm:text-sm">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step === "confirm" ? (
                <Button onClick={handleGenerate} disabled={generating} className="gap-2 text-xs sm:text-sm">
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Building your week...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate my weekly plan
                    </>
                  )}
                </Button>
              ) : (
                <Button size="sm" onClick={next} disabled={!canAdvance()} className="gap-1.5 text-xs sm:text-sm">
                  {["specials", "saved", "context"].includes(step) ? "Skip / Next" : "Next"} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WeeklyPlanSetup;
