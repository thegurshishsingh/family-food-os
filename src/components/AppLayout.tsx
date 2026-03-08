import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChefHat, CalendarDays, ShoppingCart, Heart, Settings, LogOut, User } from "lucide-react";

const NAV = [
  { to: "/planner", label: "Weekly Plan", icon: CalendarDays },
  { to: "/groceries", label: "Groceries", icon: ShoppingCart },
  { to: "/memory", label: "Meal Memory", icon: Heart },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: User },
];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setDisplayName(data.display_name);
        }
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/planner" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground hidden sm:inline">Family Food OS</span>
          </Link>
          <div className="flex items-center gap-1">
            {NAV.map((n) => (
              <Button
                key={n.to}
                variant={location.pathname === n.to ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                asChild
              >
                <Link to={n.to}>
                  <n.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{n.label}</span>
                </Link>
              </Button>
            ))}
            <Link to="/profile" className="ml-2">
              <Avatar className="h-7 w-7">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? "Avatar"} />}
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                  {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>
      <main className="container px-4 py-6">{children}</main>
    </div>
  );
};

export default AppLayout;
