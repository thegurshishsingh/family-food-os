import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";
import AppLayout from "@/components/AppLayout";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Download, ArrowLeftRight } from "lucide-react";

type GroceryItem = {
  id: string;
  category: string;
  item_name: string;
  quantity: string | null;
  is_checked: boolean;
  is_staple: boolean;
  source: string;
};

const CATEGORY_ORDER = ["produce", "protein", "dairy", "pantry", "frozen", "snacks", "household"];
const CATEGORY_EMOJI: Record<string, string> = {
  produce: "🥬", protein: "🥩", dairy: "🧀", pantry: "🫙",
  frozen: "🧊", snacks: "🍿", household: "🧹",
};

const Groceries = () => {
  const { household } = useHousehold();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!household) return;
    loadGroceries();
  }, [household]);

  const loadGroceries = async () => {
    if (!household) return;
    const { data: plans } = await supabase
      .from("weekly_plans")
      .select("id")
      .eq("household_id", household.id)
      .order("week_start", { ascending: false })
      .limit(1);

    if (plans && plans.length > 0) {
      setPlanId(plans[0].id);
      const { data: groceries } = await supabase
        .from("grocery_items")
        .select("*")
        .eq("plan_id", plans[0].id)
        .order("category")
        .order("item_name");
      if (groceries) setItems(groceries as GroceryItem[]);
    }
    setLoading(false);
  };

  const toggleCheck = async (item: GroceryItem) => {
    const { error } = await supabase
      .from("grocery_items")
      .update({ is_checked: !item.is_checked })
      .eq("id", item.id);
    if (!error) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_checked: !i.is_checked } : i)));
    }
  };

  const groupedByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  const checkedCount = items.filter((i) => i.is_checked).length;

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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">Grocery List</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length > 0 ? `${checkedCount}/${items.length} items checked` : "No groceries yet"}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>

        {items.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-serif font-semibold mb-2">No groceries yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Generate a weekly plan first — your grocery list will appear here automatically.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedByCategory.map((group) => (
              <Card key={group.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-serif capitalize">
                    <span>{CATEGORY_EMOJI[group.category] || "📦"}</span>
                    {group.category}
                    <Badge variant="secondary" className="text-xs ml-auto">{group.items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {group.items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        item.is_checked ? "opacity-50" : ""
                      }`}
                    >
                      <Checkbox
                        checked={item.is_checked}
                        onCheckedChange={() => toggleCheck(item)}
                      />
                      <span className={`flex-1 text-sm ${item.is_checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.item_name}
                      </span>
                      {item.quantity && (
                        <span className="text-xs text-muted-foreground">{item.quantity}</span>
                      )}
                      {item.source === "swap" && (
                        <Badge variant="outline" className="text-[10px] border-primary/40 text-primary gap-0.5">
                          <ArrowLeftRight className="w-2.5 h-2.5" /> swapped
                        </Badge>
                      )}
                      {item.is_staple && (
                        <Badge variant="outline" className="text-xs">staple</Badge>
                      )}
                    </label>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Groceries;
