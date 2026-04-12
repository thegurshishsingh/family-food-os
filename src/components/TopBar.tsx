import { Link } from "react-router-dom";
import { Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImg from "@/assets/cb3b18e2-2443-4f09-9a29-12bfcf41aa76.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TopBarProps {
  title: string;
}

const TopBar = ({ title }: TopBarProps) => {
  const { user } = useAuth();
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

  return (
    <header className="block md:hidden sticky top-0 z-50 bg-background border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: logo */}
        <Link to="/planner">
          <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
        </Link>

        {/* Center: title */}
        <h1 className="font-serif text-lg font-semibold text-foreground absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>

        {/* Right: bell + avatar */}
        <div className="flex items-center gap-3">
          <button className="relative p-1" aria-label="Notifications">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {/* Red dot badge */}
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <Link to="/profile">
            <Avatar className="h-8 w-8">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? "Avatar"} />}
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
