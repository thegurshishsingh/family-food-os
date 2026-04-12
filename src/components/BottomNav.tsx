import { Link, useLocation } from "react-router-dom";
import { CalendarDays, ShoppingCart, Film, Clock, User } from "lucide-react";

const TABS = [
  { to: "/planner", label: "Plan", icon: CalendarDays },
  { to: "/groceries", label: "Shop", icon: ShoppingCart },
  { to: "/family-profile", label: "Community", icon: Film },
  { to: "/history", label: "History", icon: Clock },
  { to: "/profile", label: "Profile", icon: User },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors duration-200 min-h-[44px] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
