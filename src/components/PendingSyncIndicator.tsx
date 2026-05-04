import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import {
  installBackgroundSync,
  subscribePendingCount,
  flushQueue,
} from "@/lib/offlineSync";

const PendingSyncIndicator = () => {
  const [count, setCount] = useState(0);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    installBackgroundSync();
    const unsub = subscribePendingCount(setCount);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      unsub();
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (count === 0 && online) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="glass rounded-full px-4 py-2 flex items-center gap-2 text-xs font-medium shadow-lg border border-border/50">
        <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />
        {!online && <span>Offline</span>}
        {count > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <span>
              {count} pending change{count === 1 ? "" : "s"}
            </span>
            {online && (
              <button
                onClick={() => flushQueue()}
                className="ml-1 inline-flex items-center gap-1 text-primary hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Sync now
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PendingSyncIndicator;
