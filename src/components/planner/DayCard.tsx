import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, Unlock, Shuffle, Pencil, Check, X, GripVertical, Heart, Bookmark } from "lucide-react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
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

const SWIPE_THRESHOLD = 60;
const ACTION_WIDTH = 72;

const DayCard = ({
  day, index, feedback, isSwapping, isDragged, isDragOver, isToday, householdId, householdSize, checkedIn, isSavedMeal,
  onSwapMeal, onToggleLock, onCycleMealMode, onSubmitFeedback, onSaveEdit,
  onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, onCheckedIn,
}: DayCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const isMobile = useIsMobile();

  const dragX = useMotionValue(0);
  const swipeRef = useRef<boolean>(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handleTouchStart = useCallback(() => {
    if (!isMobile || !day.meal_name) return;
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setDetailOpen(true);
      // Gentle haptic if available
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  }, [isMobile, day.meal_name]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // Cancel long-press if user starts dragging
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Background action opacity based on drag direction
  const lockOpacity = useTransform(dragX, [0, ACTION_WIDTH], [0, 1]);
  const swapOpacity = useTransform(dragX, [-ACTION_WIDTH, 0], [1, 0]);

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

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset < -SWIPE_THRESHOLD && !day.is_locked) {
      // Swiped left → swap
      swipeRef.current = true;
      animate(dragX, 0, { type: "spring", stiffness: 400, damping: 30 });
      onSwapMeal(day);
    } else if (offset > SWIPE_THRESHOLD) {
      // Swiped right → lock/unlock
      swipeRef.current = true;
      animate(dragX, 0, { type: "spring", stiffness: 400, damping: 30 });
      onToggleLock(day);
    } else {
      animate(dragX, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  const cardContent = (
    <Card className={`overflow-hidden transition-all ${day.is_locked ? "ring-1 ring-primary/20" : ""} ${isDragged ? "opacity-50 scale-[0.98]" : ""} ${isDragOver ? "ring-2 ring-primary shadow-lg" : ""}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Day label + mode */}
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
            {/* Desktop action buttons — hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleLock(day)}>
                        {day.is_locked ? <Lock className="w-4 h-4 text-primary" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
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
            {/* Mobile edit buttons — only show when editing */}
            {editing && (
              <div className="flex sm:hidden items-center gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave} title="Save">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEditing} title="Cancel">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile quick actions row — tap-based, replaces swipe for edit */}
          {!editing && isMobile && (
            <div className="flex items-center gap-1 mt-1.5 -ml-1">
              <button
                onClick={startEditing}
                disabled={day.is_locked}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
              <span className="text-muted-foreground/30 text-[10px]">·</span>
              <span className="text-[10px] text-muted-foreground/50 italic">
                Swipe · Hold for details
              </span>
            </div>
          )}

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
  );

  return (
    <motion.div
      key={day.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      draggable={!isMobile && !day.is_locked}
      onDragStart={() => !isMobile && onDragStart(day.id)}
      onDragOver={(e) => !isMobile && onDragOver(e, day.id)}
      onDragLeave={() => !isMobile && onDragLeave()}
      onDrop={() => !isMobile && onDrop(day.id)}
      onDragEnd={() => !isMobile && onDragEnd()}
    >
      {isMobile ? (
        <div className="relative overflow-hidden rounded-lg">
          {/* Swipe-right background: Lock/Unlock */}
          <motion.div
            className="absolute inset-y-0 left-0 flex items-center justify-start pl-4 rounded-lg"
            style={{
              opacity: lockOpacity,
              backgroundColor: day.is_locked ? "hsl(var(--muted))" : "hsl(var(--primary) / 0.15)",
              width: ACTION_WIDTH,
            }}
          >
            <div className="flex flex-col items-center gap-0.5">
              {day.is_locked ? (
                <Unlock className="w-5 h-5 text-primary" />
              ) : (
                <Lock className="w-5 h-5 text-primary" />
              )}
              <span className="text-[10px] font-medium text-primary">
                {day.is_locked ? "Unlock" : "Lock"}
              </span>
            </div>
          </motion.div>

          {/* Swipe-left background: Swap */}
          <motion.div
            className={`absolute inset-y-0 right-0 flex items-center justify-end pr-4 rounded-lg ${day.is_locked ? "bg-muted" : ""}`}
            style={{
              opacity: swapOpacity,
              backgroundColor: day.is_locked ? "hsl(var(--muted))" : "hsl(var(--accent) / 0.2)",
              width: ACTION_WIDTH,
            }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Shuffle className={`w-5 h-5 ${day.is_locked ? "text-muted-foreground" : "text-accent-foreground"}`} />
              <span className={`text-[10px] font-medium ${day.is_locked ? "text-muted-foreground" : "text-accent-foreground"}`}>
                {day.is_locked ? "Locked" : "Swap"}
              </span>
            </div>
          </motion.div>

          {/* Draggable card on top */}
          <motion.div
            style={{ x: dragX }}
            drag="x"
            dragConstraints={{ left: -ACTION_WIDTH, right: ACTION_WIDTH }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            className="relative z-10"
          >
            {cardContent}
          </motion.div>
        </div>
      ) : (
        cardContent
      )}
      <MealDetailDialog day={day} open={detailOpen} onOpenChange={setDetailOpen} defaultServings={householdSize || 4} />
    </motion.div>
  );
};

export default DayCard;
