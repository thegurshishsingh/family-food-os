import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const NotificationsCard = () => {
  const { user } = useAuth();
  const { status, busy, subscribe, unsubscribe, sendTest, updatePreferences } =
    usePushNotifications();
  const { toast } = useToast();

  const [prefs, setPrefs] = useState({
    enabled_dinner_reveal: true,
    enabled_evening_checkin: true,
    enabled_weekly_plan_ready: true,
  });

  useEffect(() => {
    if (!user || status !== "subscribed") return;
    supabase
      .from("push_subscriptions")
      .select("enabled_dinner_reveal, enabled_evening_checkin, enabled_weekly_plan_ready")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setPrefs(data);
      });
  }, [user, status]);

  const handleToggle = async (
    key: keyof typeof prefs,
    value: boolean
  ) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    const ok = await updatePreferences({ [key]: value });
    if (!ok) toast({ title: "Couldn't update preference", variant: "destructive" });
  };

  const handleEnable = async () => {
    const ok = await subscribe();
    if (ok) toast({ title: "Notifications enabled", description: "We'll ping you at the right moments." });
    else if (Notification.permission === "denied") {
      toast({
        title: "Notifications blocked",
        description: "Allow notifications for this site in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleDisable = async () => {
    const ok = await unsubscribe();
    if (ok) toast({ title: "Notifications turned off" });
  };

  const handleTest = async () => {
    const ok = await sendTest();
    toast({
      title: ok ? "Test sent" : "Test failed",
      description: ok ? "Check your notifications in a few seconds." : "Try again shortly.",
      variant: ok ? "default" : "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-primary" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "unsupported" && (
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support push notifications. On iPhone, install Family Food OS to your
            Home Screen first (Share → Add to Home Screen) — notifications work from there on iOS 16.4+.
          </p>
        )}

        {status === "denied" && (
          <div className="text-sm text-muted-foreground">
            Notifications are blocked for this site. Enable them in your browser/site settings, then
            refresh.
          </div>
        )}

        {(status === "default" || status === "loading") && status !== "loading" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Get a friendly nudge at <strong>1 PM</strong> with tonight's dinner, an evening check-in
              reminder, and a heads-up when next week's plan is ready.
            </p>
            <Button onClick={handleEnable} disabled={busy}>
              <Bell className="w-4 h-4 mr-2" />
              Enable notifications
            </Button>
          </div>
        )}

        {status === "subscribed" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="dinner-reveal" className="text-sm">
                  1 PM dinner reveal
                </Label>
                <Switch
                  id="dinner-reveal"
                  checked={prefs.enabled_dinner_reveal}
                  onCheckedChange={(v) => handleToggle("enabled_dinner_reveal", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="evening-checkin" className="text-sm">
                  Evening check-in (~7:30 PM)
                </Label>
                <Switch
                  id="evening-checkin"
                  checked={prefs.enabled_evening_checkin}
                  onCheckedChange={(v) => handleToggle("enabled_evening_checkin", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-plan" className="text-sm">
                  Weekly plan ready
                </Label>
                <Switch
                  id="weekly-plan"
                  checked={prefs.enabled_weekly_plan_ready}
                  onCheckedChange={(v) => handleToggle("enabled_weekly_plan_ready", v)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              <Button variant="outline" size="sm" onClick={handleTest} disabled={busy}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Send test
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDisable} disabled={busy}>
                <BellOff className="w-3.5 h-3.5 mr-1.5" />
                Turn off
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
