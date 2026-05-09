import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shows a persistent top banner whenever a new service-worker build is
 * waiting. Also fires a one-shot browser notification (when permission has
 * already been granted) so users notice the update even if the tab is in
 * the background.
 */
const UpdatePrompt = () => {
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Re-check for a new build every 60 minutes.
        setInterval(() => {
          registration.update().catch(() => undefined);
        }, 60 * 60 * 1000);
      }
    },
  });

  // Fire a browser notification once when an update appears (silent if no permission).
  useEffect(() => {
    if (!needRefresh) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      const n = new Notification("Family Food OS — Update available", {
        body: "Tap to refresh and get the latest improvements.",
        icon: "/icon-192.png",
        tag: "ffos-update",
      });
      n.onclick = () => {
        window.focus();
        setDismissed(false);
      };
    } catch {
      // ignore — some browsers block constructed Notifications outside SW
    }
  }, [needRefresh]);

  // Reset dismissed flag whenever a *new* update arrives.
  useEffect(() => {
    if (needRefresh) setDismissed(false);
  }, [needRefresh]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateServiceWorker(true);
    } catch {
      window.location.reload();
    }
  };

  const visible = needRefresh && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="update-banner"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 inset-x-0 z-[100] px-3 pt-[env(safe-area-inset-top)]"
        >
          <div className="mx-auto max-w-screen-md mt-2 rounded-2xl border border-primary/20 bg-background/95 backdrop-blur-sm shadow-lg shadow-primary/10">
            <div className="flex items-center gap-3 p-3 sm:p-4">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <RefreshCw className={`w-4 h-4 text-primary ${updating ? "animate-spin" : ""}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  A new version is available
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  Refresh to get the latest improvements.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={updating}
                className="h-9 rounded-full px-4 shrink-0"
              >
                {updating ? "Updating…" : "Update"}
              </Button>
              <button
                type="button"
                aria-label="Dismiss update banner"
                onClick={() => {
                  setDismissed(true);
                  setNeedRefresh(false);
                }}
                disabled={updating}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdatePrompt;
