import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, ReferenceLine, Legend } from "recharts";
import { Flame, Beef, ChefHat, Truck, DollarSign } from "lucide-react";
import type { PlanDay, WeeklyPlan } from "@/components/planner/types";

type HistoryWeek = WeeklyPlan & { days: PlanDay[] };

interface TrendChartsProps {
  weeks: HistoryWeek[];
  weeklyBudget?: number | null;
}

const TrendCharts = ({ weeks, weeklyBudget }: TrendChartsProps) => {
  if (weeks.length < 2) return null;

  // Reverse so oldest is first (left side of chart)
  const chartData = [...weeks].reverse().map((week) => {
    const label = new Date(week.week_start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const totalCals = week.days.reduce((s, d) => s + (d.calories || 0), 0);
    const totalProtein = week.days.reduce((s, d) => s + (d.protein_g ? Number(d.protein_g) : 0), 0);
    const cookNights = week.days.filter((d) => d.meal_mode === "cook").length;
    const takeoutNights = week.days.filter((d) => d.meal_mode === "takeout" || d.meal_mode === "dine_out").length;
    const takeoutSpend = week.days.reduce((s, d) => s + (d.takeout_budget ? Number(d.takeout_budget) : 0), 0);
    return { label, calories: totalCals, protein: Math.round(totalProtein), cookNights, takeoutNights, takeoutSpend: Math.round(takeoutSpend) };
  });

  const chartConfig = {
    calories: { title: "Weekly Calories", color: "hsl(var(--primary))", icon: Flame, dataKey: "calories", unit: " cal" },
    protein: { title: "Weekly Protein", color: "hsl(var(--accent-foreground))", icon: Beef, dataKey: "protein", unit: "g" },
  };

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-lg font-serif font-semibold text-foreground">Trends</h2>

      {/* Line charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(chartConfig).map(([key, cfg]) => (
          <Card key={key}>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <cfg.icon className="w-3.5 h-3.5" /> {cfg.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} width={45} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))" }}
                    formatter={(value: number) => [`${value.toLocaleString()}${cfg.unit}`, cfg.title]}
                  />
                  <Line type="monotone" dataKey={cfg.dataKey} stroke={cfg.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart for cook vs takeout */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5" /> Cook Nights vs <Truck className="w-3.5 h-3.5" /> Takeout
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} width={30} className="fill-muted-foreground" allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))" }}
              />
              <Bar dataKey="cookNights" name="Cook" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="takeoutNights" name="Takeout" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget trend */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Weekly Takeout Spend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} width={45} className="fill-muted-foreground" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))" }}
                formatter={(value: number) => [`$${value}`, "Takeout Spend"]}
              />
              {weeklyBudget && (
                <ReferenceLine y={weeklyBudget} stroke="hsl(var(--destructive))" strokeDasharray="6 4" label={{ value: `Budget $${weeklyBudget}`, position: "right", fontSize: 10, fill: "hsl(var(--destructive))" }} />
              )}
              <Line type="monotone" dataKey="takeoutSpend" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendCharts;
