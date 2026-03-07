import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useHousehold } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ThumbsDown, Baby, ChefHat, RefreshCw, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FeedbackEntry = {
  id: string;
  meal_name: string;
  feedback: string;
  notes: string | null;
  created_at: string;
};

const FEEDBACK_CONFIG: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  loved: { label: "Loved It", icon: Heart, color: "text-destructive" },
  okay: { label: "Okay", icon: Star, color: "text-muted-foreground" },
  kids_refused: { label: "Kids Refused", icon: Baby, color: "text-accent" },
  too_hard: { label: "Too Much Work", icon: ChefHat, color: "text-muted-foreground" },
  good_leftovers: { label: "Good Leftovers", icon: RefreshCw, color: "text-primary" },
  reorder_worthy: { label: "Reorder-worthy", icon: Star, color: "text-accent" },
};

const MealMemory = () => {
  const { household } = useHousehold();
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!household) return;
    loadFeedback();
  }, [household]);

  const loadFeedback = async () => {
    if (!household) return;
    const { data } = await supabase
      .from("meal_feedback")
      .select("*")
      .eq("household_id", household.id)
      .order("created_at", { ascending: false });
    if (data) setFeedback(data as FeedbackEntry[]);
    setLoading(false);
  };

  const byType = (type: string) => feedback.filter((f) => f.feedback === type);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-2">Meal Memory</h1>
        <p className="text-muted-foreground text-sm mb-6">
          What your family loved, hated, and everything in between.
        </p>

        {feedback.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-serif font-semibold mb-2">No feedback yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                After meals, mark how they went. Over time, your plan gets smarter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="loved">
            <TabsList className="mb-6">
              <TabsTrigger value="loved">❤️ Loved</TabsTrigger>
              <TabsTrigger value="kids_refused">👶 Kids Refused</TabsTrigger>
              <TabsTrigger value="good_leftovers">♻️ Good Leftovers</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            {["loved", "kids_refused", "good_leftovers"].map((type) => (
              <TabsContent key={type} value={type}>
                <div className="space-y-2">
                  {byType(type).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No entries yet.</p>
                  ) : (
                    byType(type).map((f) => <FeedbackCard key={f.id} entry={f} />)
                  )}
                </div>
              </TabsContent>
            ))}

            <TabsContent value="all">
              <div className="space-y-2">
                {feedback.map((f) => <FeedbackCard key={f.id} entry={f} />)}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
};

const FeedbackCard = ({ entry }: { entry: FeedbackEntry }) => {
  const config = FEEDBACK_CONFIG[entry.feedback] || FEEDBACK_CONFIG.okay;
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="py-3 px-4 flex items-center gap-3">
        <Icon className={`w-5 h-5 shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{entry.meal_name}</p>
          {entry.notes && <p className="text-xs text-muted-foreground mt-0.5">{entry.notes}</p>}
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">{config.label}</Badge>
      </CardContent>
    </Card>
  );
};

export default MealMemory;
