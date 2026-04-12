import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarDays, ShoppingCart, Heart, Settings, LogOut, User, History, MessageCircle } from "lucide-react";
import Logo from "@/components/Logo";

const NAV = [
  { to: "/planner", label: "Weekly Plan", icon: CalendarDays },
  { to: "/checkin", label: "Check-in", icon: MessageCircle },
  { to: "/history", label: "History", icon: History },
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
      {/* Top nav — hidden on mobile, replaced by TopBar + BottomNav */}
      <nav className="hidden md:block sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/planner" className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-serif text-lg font-semibold text-foreground hidden sm:inline">Family Food OS</span>
          </Link>
          <div className="flex items-center gap-1">
            {/* Show only key nav items on mobile, all on md+ */}
            {NAV.map((n) => (
              <Button
                key={n.to}
                variant={location.pathname === n.to ? "secondary" : "ghost"}
                size="sm"
                className={`gap-1.5 px-2 sm:px-3 ${
                  ["/planner", "/groceries", "/checkin"].includes(n.to) ? "" : "hidden md:inline-flex"
                }`}
                asChild
              >
                <Link to={n.to}>
                  <n.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{n.label}</span>
                </Link>
              </Button>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
                  <Avatar className="h-7 w-7">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? "Avatar"} />}
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {/* Show hidden nav items on mobile */}
                {NAV.filter((n) => !["/planner", "/groceries", "/checkin"].includes(n.to)).map((n) => (
                  <DropdownMenuItem key={n.to} onClick={() => navigate(n.to)} className="cursor-pointer gap-2 md:hidden">
                    <n.icon className="w-4 h-4" /> {n.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-2 hidden md:flex">
                  <User className="w-4 h-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer gap-2 hidden md:flex">
                  <Settings className="w-4 h-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="hidden md:block" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      <main className="container px-4 py-6 max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
};

export default AppLayout;
