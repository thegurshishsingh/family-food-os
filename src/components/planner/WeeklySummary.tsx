import { Card, CardContent } from "@/components/ui/card";
import { Flame, Beef, ChefHat, Truck } from "lucide-react";
import type { PlanDay } from "./types";

interface WeeklySummaryProps {
  days: PlanDay[];
}

const WeeklySummary = ({ days }: WeeklySummaryProps) => {
  if (days.length === 0) return null;

  const totalCals = days.reduce((s, d) => s + (d.calories || 0), 0);
  const avgCals = days.length > 0 ? Math.round(totalCals / days.length) : 0;
  const cookDays = days.filter((d) => d.meal_mode === "cook").length;
  const takeoutDays = days.filter((d) => d.meal_mode === "takeout" || d.meal_mode === "dine_out").length;

  const stats = [
    { icon: Flame, iconClass: "text-accent", label: "Avg calories", value: avgCals.toLocaleString() },
    { icon: Truck, iconClass: "text-accent", label: "Convenience nights", value: String(takeoutDays) },
    { icon: ChefHat, iconClass: "text-primary", label: "Cook nights", value: String(cookDays) },
    { icon: Beef, iconClass: "text-primary", label: "Protein focus", value: "High" },
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
