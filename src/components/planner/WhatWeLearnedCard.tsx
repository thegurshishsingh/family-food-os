import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, AlertTriangle, TrendingUp, Sparkles, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type UserInsight = {
  icon: "love" | "warn" | "trend" | "info";
  text: string;
};

interface WhatWeLearnedCardProps {
  householdId: string;
}

const ICON_MAP: Record<UserInsight["icon"], { Icon: typeof Heart; className: string }> = {
  love:  { Icon: Heart,        className: "text-primary" },
  warn:  { Icon: AlertTriangle, className: "text-amber-600" },
  trend: { Icon: TrendingUp,   className: "text-primary" },
  info:  { Icon: Sparkles,     className: "text-muted-foreground" },
};

const WhatWeLearnedCard = ({ householdId }: WhatWeLearnedCardProps) => {
  const [insights, setInsights] = useState<UserInsight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ totalFeedback: number; totalCheckins: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-learning-insights", {
          body: { household_id: householdId },
        });
        if (cancelled) return;
        if (error) throw error;
        setInsights((data?.insights as UserInsight[]) || []);
        setMeta(data?.meta || null);
      } catch (e) {
        console.warn("[WhatWeLearnedCard] failed to load insights", e);
        if (!cancelled) setInsights([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [householdId]);

  if (loading) return null;
  if (!insights || insights.length === 0) {
    // Quiet state — only show if there's almost no data, to set expectations
    if (meta && meta.totalFeedback < 3 && meta.totalCheckins < 3) {
      return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-border/40 bg-muted/20">
            <CardContent className="py-4 flex items-start gap-3">
              <Brain className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-foreground">Still learning your family</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Add a few meal feedbacks or evening check-ins and your future plans will start adapting.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="mb-6 border-primary/15 bg-background/95 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <p className="font-semibold text-sm text-foreground">What we learned this week</p>
          </div>
          <ul className="space-y-2">
            {insights.map((ins, i) => {
              const { Icon, className } = ICON_MAP[ins.icon];
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${className}`} />
                  <span className="text-xs text-foreground leading-snug">{ins.text}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WhatWeLearnedCard;
