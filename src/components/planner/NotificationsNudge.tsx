import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "ffos.notifications-nudge.dismissed";

const NotificationsNudge = () => {
  const { status, busy, subscribe } = usePushNotifications();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (dismissed) return null;
  if (status !== "default") return null; // hide if subscribed/denied/unsupported/loading

  const handleEnable = async () => {
    const ok = await subscribe();
    if (ok) {
      toast({ title: "Notifications on", description: "We'll nudge you at 1 PM with tonight's dinner." });
      localStorage.setItem(STORAGE_KEY, "1");
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 flex items-start gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bell className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Want a 1 PM dinner ping?</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          We'll quietly remind you what's for dinner — plus an evening check-in.
        </p>
        <div className="flex gap-2 mt-2.5">
          <Button size="sm" onClick={handleEnable} disabled={busy}>
            Enable notifications
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            Not now
          </Button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="text-muted-foreground hover:text-foreground p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationsNudge;
