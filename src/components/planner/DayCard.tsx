import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lock, Unlock, Shuffle, Pencil, Check, X, GripVertical, Heart } from "lucide-react";
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
}

const DayCard = ({
  day, index, feedback, isSwapping, isDragged, isDragOver,
  onSwapMeal, onToggleLock, onCycleMealMode, onSubmitFeedback, onSaveEdit,
  onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
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
          {/* Day label + mode */}
          <div className="flex items-center gap-3 p-4 sm:w-48 sm:border-r border-border">
            {!day.is_locked && (
              <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0 hidden sm:block" />
            )}
            <div className="text-center sm:text-left">
              <p className="font-serif font-semibold text-foreground">{DAYS[day.day_of_week]}</p>
              <button
                onClick={() => onCycleMealMode(day)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 transition-colors ${mode.color}`}
                disabled={day.is_locked}
              >
                <Icon className="w-3 h-3" />
                {mode.label}
              </button>
            </div>
          </div>

          {/* Meal info */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
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
                    <h3
                      className={`font-medium truncate ${day.meal_name ? "text-foreground hover:text-primary cursor-pointer underline-offset-2 hover:underline transition-colors" : "text-muted-foreground"}`}
                      onClick={() => day.meal_name && setDetailOpen(true)}
                    >
                      {day.meal_name || "No meal assigned"}
                    </h3>
                    {day.meal_description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{day.meal_description}</p>
                    )}
                    {day.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{day.notes}</p>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={startEditing} disabled={day.is_locked} title="Edit meal">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSwapMeal(day)} disabled={day.is_locked || isSwapping} title="Swap meal">
                      {isSwapping ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Shuffle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleLock(day)}>
                      {day.is_locked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Nutrition badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {day.calories && <Badge variant="secondary" className="text-xs">{day.calories} cal</Badge>}
              {day.protein_g && <Badge variant="secondary" className="text-xs">{Number(day.protein_g)}g protein</Badge>}
              {day.carbs_g && <Badge variant="secondary" className="text-xs">{Number(day.carbs_g)}g carbs</Badge>}
              {day.fat_g && <Badge variant="secondary" className="text-xs">{Number(day.fat_g)}g fat</Badge>}
              {day.prep_time_minutes && day.meal_mode === "cook" && <Badge variant="outline" className="text-xs">{day.prep_time_minutes} min</Badge>}
              {day.cuisine_type && <Badge variant="outline" className="text-xs">{day.cuisine_type}</Badge>}
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
          </div>
        </div>
      </Card>
      <MealDetailDialog day={day} open={detailOpen} onOpenChange={setDetailOpen} />
    </motion.div>
  );
};

export default DayCard;
