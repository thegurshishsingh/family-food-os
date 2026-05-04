// Offline write queue for household/profile updates.
// Pending mutations are persisted to localStorage and replayed when the
// browser regains connectivity (or when the app starts online).

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PendingTable =
  | "profiles"
  | "households"
  | "household_preferences";

export type PendingMutation = {
  id: string;
  table: PendingTable;
  values: Record<string, unknown>;
  match: Record<string, unknown>; // .eq filters
  createdAt: number;
  attempts: number;
  label?: string; // human-readable, used in toasts
};

const STORAGE_KEY = "ffos:pending-mutations:v1";
const MAX_ATTEMPTS = 8;

const readQueue = (): PendingMutation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingMutation[]) : [];
  } catch {
    return [];
  }
};

const writeQueue = (q: PendingMutation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
  } catch {}
  notifyListeners(q.length);
};

type Listener = (count: number) => void;
const listeners = new Set<Listener>();
const notifyListeners = (count: number) => {
  listeners.forEach((l) => {
    try { l(count); } catch {}
  });
};

export const subscribePendingCount = (l: Listener) => {
  listeners.add(l);
  l(readQueue().length);
  return () => { listeners.delete(l); };
};

export const getPendingCount = () => readQueue().length;

export const enqueueMutation = (
  m: Omit<PendingMutation, "id" | "createdAt" | "attempts">,
) => {
  const queue = readQueue();
  // Coalesce: if the same table + match exists, merge values (last write wins).
  const existingIdx = queue.findIndex(
    (q) =>
      q.table === m.table &&
      JSON.stringify(q.match) === JSON.stringify(m.match),
  );
  if (existingIdx >= 0) {
    queue[existingIdx] = {
      ...queue[existingIdx],
      values: { ...queue[existingIdx].values, ...m.values },
      label: m.label ?? queue[existingIdx].label,
    };
  } else {
    queue.push({
      ...m,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      attempts: 0,
    });
  }
  writeQueue(queue);
};

let flushing = false;

export const flushQueue = async (): Promise<{ ok: number; failed: number }> => {
  if (flushing) return { ok: 0, failed: 0 };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: 0, failed: 0 };
  }
  flushing = true;
  let ok = 0;
  let failed = 0;
  try {
    let queue = readQueue();
    if (queue.length === 0) return { ok: 0, failed: 0 };

    const remaining: PendingMutation[] = [];
    for (const item of queue) {
      try {
        let q = supabase.from(item.table).update(item.values as never);
        for (const [k, v] of Object.entries(item.match)) {
          q = q.eq(k as never, v as never);
        }
        const { error } = await q;
        if (error) throw error;
        ok += 1;
      } catch (err) {
        const next = { ...item, attempts: item.attempts + 1 };
        if (next.attempts < MAX_ATTEMPTS) remaining.push(next);
        failed += 1;
        console.warn("[offlineSync] mutation failed", err);
      }
    }
    writeQueue(remaining);
  } finally {
    flushing = false;
  }
  return { ok, failed };
};

/**
 * Write to Supabase if online; otherwise enqueue for background sync.
 * Returns { queued: true } when the request was deferred.
 */
export const updateWithSync = async (
  table: PendingTable,
  values: Record<string, unknown>,
  match: Record<string, unknown>,
  label?: string,
): Promise<{ queued: boolean; error?: Error }> => {
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  if (!offline) {
    try {
      let q = supabase.from(table).update(values as never);
      for (const [k, v] of Object.entries(match)) {
        q = q.eq(k as never, v as never);
      }
      const { error } = await q;
      if (error) throw error;
      return { queued: false };
    } catch (err) {
      // Network failure — fall through to enqueue
      enqueueMutation({ table, values, match, label });
      return { queued: true, error: err as Error };
    }
  }
  enqueueMutation({ table, values, match, label });
  return { queued: true };
};

let installed = false;
export const installBackgroundSync = () => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const onOnline = async () => {
    const before = getPendingCount();
    if (before === 0) return;
    const { ok, failed } = await flushQueue();
    if (ok > 0) {
      toast.success(
        ok === 1
          ? "Synced 1 pending change"
          : `Synced ${ok} pending changes`,
      );
    }
    if (failed > 0 && ok === 0) {
      toast.error("Couldn't sync changes yet — will retry");
    }
  };

  window.addEventListener("online", onOnline);
  // Periodic retry while app is open (every 60s) in case `online` event missed.
  setInterval(() => {
    if (navigator.onLine && getPendingCount() > 0) flushQueue();
  }, 60_000);

  // Try once on load.
  if (navigator.onLine && getPendingCount() > 0) {
    void flushQueue();
  }
};
