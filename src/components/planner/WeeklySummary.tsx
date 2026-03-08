import { Card, CardContent } from "@/components/ui/card";
import { Flame, TrendingUp, ChefHat, Truck } from "lucide-react";
import type { PlanDay } from "./types";

interface WeeklySummaryProps {
  days: PlanDay[];
}

const WeeklySummary = ({ days }: WeeklySummaryProps) => {
  if (days.length === 0) return null;

  const totalCals = days.reduce((s, d) => s + (d.calories || 0), 0);
  const totalProtein = days.reduce((s, d) => s + Number(d.protein_g || 0), 0);
  const cookDays = days.filter((d) => d.meal_mode === "cook").length;
  const takeoutDays = days.filter((d) => d.meal_mode === "takeout" || d.meal_mode === "dine_out").length;

  const stats = [
    { icon: Flame, iconClass: "text-accent", label: "Weekly Calories", value: totalCals.toLocaleString() },
    { icon: TrendingUp, iconClass: "text-primary", label: "Protein", value: `${Math.round(totalProtein)}g` },
    { icon: ChefHat, iconClass: "text-primary", label: "Cook Nights", value: String(cookDays) },
    { icon: Truck, iconClass: "text-accent", label: "Takeout/Out", value: String(takeoutDays) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.iconClass}`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-semibold text-foreground">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WeeklySummary;
