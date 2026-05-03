import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

/**
 * Listens for new service worker versions and shows a toast prompting the
 * user to refresh. Tapping "Update" activates the new SW and reloads the
 * page so the latest build takes effect immediately — no reinstall needed.
 */
const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Poll for updates every 60 minutes while the app is open.
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => undefined);
        }, 60 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (!needRefresh) return;
    toast("A new version is available", {
      description: "Refresh to get the latest improvements.",
      duration: Infinity,
      icon: <RefreshCw className="w-4 h-4" />,
      action: {
        label: "Update",
        onClick: () => {
          updateServiceWorker(true);
        },
      },
      onDismiss: () => setNeedRefresh(false),
    });
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
};

export default UpdatePrompt;
