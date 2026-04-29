import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DAYS, type PlanDay } from "./types";
import { deriveCheckInOutcome } from "@/lib/checkInOutcome";

const EFFORT_OPTIONS = [
  { value: "easy", emoji: "😌", label: "Easy" },
  { value: "fine", emoji: "👍", label: "Fine" },
  { value: "too_much", emoji: "😩", label: "Hard" },
];

const ALL_TAGS = [
  { value: "cooked_it", label: "Cooked it", emoji: "🍳" },
  { value: "ordered_out", label: "Ordered out", emoji: "📦" },
  { value: "everyone_liked", label: "Everyone liked", emoji: "😋" },
  { value: "kids_refused", label: "Kids refused", emoji: "👶" },
  { value: "easy_win", label: "Easy win", emoji: "✅" },
  { value: "great_leftovers", label: "Leftovers", emoji: "♻️" },
  { value: "not_again", label: "Not again", emoji: "🚫" },
];

function getSuggestedTags(meal: PlanDay): string[] {
  const s: string[] = [];
  if (meal.meal_mode === "cook") {
    s.push("cooked_it");
    s.push((meal.prep_time_minutes ?? 0) >= 30 ? "everyone_liked" : "easy_win");
  }
  if (meal.meal_mode === "takeout" || meal.meal_mode === "dine_out") s.push("ordered_out", "easy_win");
  if (meal.meal_mode === "leftovers") s.push("great_leftovers", "easy_win");
  if (meal.meal_mode === "emergency") s.push("ordered_out");
  if (!s.includes("everyone_liked")) s.push("everyone_liked");
  return [...new Set(s)].slice(0, 4);
}

function generateSmartLine(tags: string[], effort: string | null, meal: PlanDay): string {
  const dayName = DAYS[meal.day_of_week];
  const name = meal.meal_name || "that meal";
  if (tags.includes("kids_refused")) return `Noted. We'll adjust ${dayName}s for the kids.`;
  if (tags.includes("everyone_liked")) return `"${name}" is a keeper.`;
  if (tags.includes("not_again")) return `Won't suggest "${name}" again.`;
  if (tags.includes("easy_win")) return `Easy wins build momentum.`;
  if (effort === "too_much") return `We'll keep ${dayName}s lighter next time.`;
  if (effort === "easy") return `Smooth night. More of those coming.`;
  return `Got it. Next week gets smarter.`;
}

interface RetroCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: PlanDay | null;
  householdId: string;
  onCheckedIn: (dayId: string) => void;
}

const RetroCheckInDialog = ({ open, onOpenChange, day, householdId, onCheckedIn }: RetroCheckInDialogProps) => {
  const [effort, setEffort] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [smartLine, setSmartLine] = useState("");
  const { toast } = useToast();

  const suggested = useMemo(() => (day ? getSuggestedTags(day) : []), [day]);
  const suggestedTags = ALL_TAGS.filter((t) => suggested.includes(t.value));
  const otherTags = ALL_TAGS.filter((t) => !suggested.includes(t.value));

  const toggleTag = (v: string) =>
    setSelectedTags((prev) => (prev.includes(v) ? prev.filter((t) => t !== v) : [...prev, v]));

  const resetState = () => {
    setEffort(null);
    setSelectedTags([]);
    setSaving(false);
    setDone(false);
    setSmartLine("");
  };

  const handleSubmit = async () => {
    if (!day || (!effort && selectedTags.length === 0)) return;
    setSaving(true);
    const outcome = deriveCheckInOutcome(selectedTags, effort);
    const { error } = await supabase.from("evening_checkins").insert({
      plan_day_id: day.id,
      household_id: householdId,
      tags: [...selectedTags, "retro_checkin"],
      effort_level: effort,
      outcome,
    } as any);
    if (error) {
      toast({ variant: "destructive", title: "Check-in failed", description: error.message });
      setSaving(false);
      return;
    }
    setSmartLine(generateSmartLine(selectedTags, effort, day));
    setDone(true);
    setSaving(false);
    setTimeout(() => {
      onCheckedIn(day.id);
      onOpenChange(false);
      resetState();
    }, 2500);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) resetState();
    onOpenChange(o);
  };

  if (!day) return null;

  const dayName = DAYS[day.day_of_week];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            How was {dayName}'s dinner?
          </DialogTitle>
          {day.meal_name && (
            <p className="text-sm text-muted-foreground mt-1">{day.meal_name}</p>
          )}
        </DialogHeader>

        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm font-serif text-foreground">{smartLine}</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Effort */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">How was the effort?</p>
              <div className="flex gap-2">
                {EFFORT_OPTIONS.map((opt) => {
                  const sel = effort === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setEffort(sel ? null : opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                        sel
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">What happened?</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((tag) => {
                  const sel = selectedTags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        sel
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-transparent bg-muted/30 text-muted-foreground/70 hover:bg-muted/50"
                      }`}
                    >
                      <span>{tag.emoji}</span>
                      {tag.label}
                    </button>
                  );
                })}
                {otherTags.map((tag) => {
                  const sel = selectedTags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all border ${
                        sel
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-transparent bg-muted/20 text-muted-foreground/50 hover:bg-muted/40"
                      }`}
                    >
                      <span>{tag.emoji}</span>
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSubmit}
                disabled={saving || (!effort && selectedTags.length === 0)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-opacity"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Log {dayName}
              </button>
              <button
                onClick={() => handleOpenChange(false)}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RetroCheckInDialog;
