import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, Unlock, Shuffle, Pencil, Check, X, GripVertical, Heart, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { DAYS, MODE_CONFIG, FEEDBACK_OPTIONS, type PlanDay, type FeedbackType } from "./types";
import MealDetailDialog from "./MealDetailDialog";
import InlineCheckIn from "./InlineCheckIn";

interface DayCardProps {
  day: PlanDay;
  index: number;
  feedback?: FeedbackType;
  isSwapping: boolean;
  isDragged: boolean;
  isDragOver: boolean;
  isToday: boolean;
  householdId?: string;
  householdSize?: number;
  checkedIn?: boolean;
  isSavedMeal?: boolean;
  onSwapMeal: (day: PlanDay) => void;
  onToggleLock: (day: PlanDay) => void;
  onCycleMealMode: (day: PlanDay) => void;
  onSubmitFeedback: (day: PlanDay, feedback: FeedbackType) => void;
  onSaveEdit: (day: PlanDay, name: string, desc: string) => void;
  onDragStart: (dayId: string) => void;
  onDragOver: (e: React.DragEvent, dayId: string) => void;
  onDragLeave: () => void;
  onDrop: (dayId: string) => void;
  onDragEnd: () => void;
  onCheckedIn?: (dayId: string) => void;
}

const DayCard = ({
  day, index, feedback, isSwapping, isDragged, isDragOver, isToday, householdId, householdSize, checkedIn, isSavedMeal,
  onSwapMeal, onToggleLock, onCycleMealMode, onSubmitFeedback, onSaveEdit,
  onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, onCheckedIn,
}: DayCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);

  const mode = MODE_CONFIG[day.meal_mode];
  const Icon = mode.icon;

  const startEditing = () => {
    if (day.is_locked) return;
    setEditing(true);
    setEditName(day.meal_name || "");
    setEditDesc(day.meal_description || "");
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditName("");
    setEditDesc("");
  };

  const handleSave = () => {
    onSaveEdit(day, editName, editDesc);
    cancelEditing();
  };

  return (
    <motion.div
      key={day.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      draggable={!day.is_locked}
      onDragStart={() => onDragStart(day.id)}
      onDragOver={(e) => onDragOver(e, day.id)}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(day.id)}
      onDragEnd={onDragEnd}
    >
      <Card className={`overflow-hidden transition-all ${day.is_locked ? "ring-1 ring-primary/20" : ""} ${isDragged ? "opacity-50 scale-[0.98]" : ""} ${isDragOver ? "ring-2 ring-primary shadow-lg" : ""}`}>
        <div className="flex flex-col sm:flex-row">
          {/* Day label + mode - horizontal on mobile */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-1 sm:flex-col sm:gap-1 sm:p-4 sm:w-44 sm:border-r border-border sm:items-start">
            {!day.is_locked && (
              <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0 hidden sm:block" />
            )}
            <p className="font-serif font-semibold text-foreground text-sm sm:text-base">{DAYS[day.day_of_week]}</p>
            <button
              onClick={() => onCycleMealMode(day)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium transition-colors ${mode.color}`}
              disabled={day.is_locked}
            >
              <Icon className="w-3 h-3" />
              {mode.label}
            </button>
          </div>

          {/* Meal info */}
          <div className="flex-1 px-3 pb-3 pt-1 sm:p-4 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Meal name"
                      maxLength={200}
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancelEditing(); }}
                    />
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Description (optional)"
                      maxLength={500}
                      className="text-sm min-h-[60px] resize-none"
                      onKeyDown={(e) => { if (e.key === "Escape") cancelEditing(); }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <h3
                        className={`font-medium truncate ${day.meal_name ? "text-foreground hover:text-primary cursor-pointer underline-offset-2 hover:underline transition-colors" : "text-muted-foreground"}`}
                        onClick={() => day.meal_name && setDetailOpen(true)}
                      >
                        {day.meal_name || "No meal assigned"}
                      </h3>
                      {isSavedMeal && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Bookmark className="w-3.5 h-3.5 text-primary fill-primary shrink-0 cursor-default" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Saved to favorites
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {day.meal_description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{day.meal_description}</p>
                    )}
                    {day.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{day.notes}</p>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                {editing ? (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave} title="Save">
                      <Check className="w-4 h-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEditing} title="Cancel">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={startEditing} disabled={day.is_locked} title="Edit meal">
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => onSwapMeal(day)} disabled={day.is_locked || isSwapping} title="Swap meal">
                      {isSwapping ? (
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => onToggleLock(day)}>
                          {day.is_locked ? <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> : <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-center">
                        {day.is_locked
                          ? "This meal is locked — it won't change when you regenerate the plan. Click to unlock."
                          : "Lock this meal so it stays when you regenerate the plan"}
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            {/* Nutrition badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              {day.calories && <Badge variant="secondary" className="text-[11px] sm:text-xs">{day.calories} cal</Badge>}
              {day.protein_g && <Badge variant="secondary" className="text-[11px] sm:text-xs">{Number(day.protein_g)}g protein</Badge>}
              {day.carbs_g && <Badge variant="secondary" className="text-[11px] sm:text-xs hidden sm:inline-flex">{Number(day.carbs_g)}g carbs</Badge>}
              {day.fat_g && <Badge variant="secondary" className="text-[11px] sm:text-xs hidden sm:inline-flex">{Number(day.fat_g)}g fat</Badge>}
              {day.prep_time_minutes && day.meal_mode === "cook" && <Badge variant="outline" className="text-[11px] sm:text-xs">{day.prep_time_minutes} min</Badge>}
              {day.cuisine_type && <Badge variant="outline" className="text-[11px] sm:text-xs">{day.cuisine_type}</Badge>}
            </div>

            {/* Feedback */}
            {day.meal_name && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                {feedback ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Rated:</span>
                    <Badge variant="secondary" className="text-xs gap-1">
                      {FEEDBACK_OPTIONS.find((f) => f.value === feedback)?.emoji}
                      {FEEDBACK_OPTIONS.find((f) => f.value === feedback)?.label}
                    </Badge>
                  </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5 h-7 px-2">
                        <Heart className="w-3 h-3" /> Rate this meal
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <div className="grid grid-cols-2 gap-1">
                        {FEEDBACK_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => onSubmitFeedback(day, opt.value)}
                            className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <span>{opt.emoji}</span>
                            <span className="text-foreground">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}

            {/* Inline check-in for today */}
            {isToday && day.meal_name && !checkedIn && householdId && onCheckedIn && (
              <InlineCheckIn day={day} householdId={householdId} onCheckedIn={onCheckedIn} />
            )}
          </div>
        </div>
      </Card>
      <MealDetailDialog day={day} open={detailOpen} onOpenChange={setDetailOpen} defaultServings={householdSize || 4} />
    </motion.div>
  );
};

export default DayCard;
