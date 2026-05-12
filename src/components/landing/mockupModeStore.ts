import { useSyncExternalStore } from "react";

export type MockupMode = "cook" | "leftovers" | "takeout" | "dine_out";

let currentMode: MockupMode = "cook";
const listeners = new Set<() => void>();

export const mockupModeStore = {
  get: () => currentMode,
  set: (next: MockupMode) => {
    if (next === currentMode) return;
    currentMode = next;
    listeners.forEach((l) => l());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useMockupMode(): [MockupMode, (m: MockupMode) => void] {
  const mode = useSyncExternalStore(
    mockupModeStore.subscribe,
    mockupModeStore.get,
    mockupModeStore.get,
  );
  return [mode, mockupModeStore.set];
}
