import { useCallback, useEffect, useRef } from "react";

/**
 * useScrollSpy — robust active-element tracking driven by IntersectionObserver.
 *
 * Why IntersectionObserver + live geometry:
 *   The observer is used purely as a cheap, scroll-aware *trigger*. On every
 *   callback we re-read live `getBoundingClientRect()` for all registered
 *   elements and pick the one nearest the viewport center. This keeps the
 *   result correct even on fast/flung scrolling, where the observer may batch
 *   entries or an element may skip entirely past a fixed activation band before
 *   ever reporting `isIntersecting`. Relying on stale `intersectionRatio` alone
 *   is exactly what breaks under fast scroll — reading live rects does not.
 *
 * Returns a `register(id)` ref-callback to attach to each tracked element.
 * `onActive` is invoked only when the nearest-to-center element changes.
 */
export function useScrollSpy(onActive: (id: string) => void) {
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const elById = useRef<Map<string, Element>>(new Map());
  const activeRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  const evaluate = useCallback(() => {
    rafRef.current = null;
    const els = elById.current;
    if (els.size === 0) return;

    const viewportH = window.innerHeight;
    const center = viewportH / 2;
    let bestId: string | null = null;
    let bestDist = Infinity;

    els.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      // Ignore elements fully outside the viewport so we never hijack the
      // active state while the user is on a different part of the page.
      if (rect.bottom <= 0 || rect.top >= viewportH) return;
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = id;
      }
    });

    if (bestId && bestId !== activeRef.current) {
      activeRef.current = bestId;
      onActiveRef.current(bestId);
    }
  }, []);

  // Coalesce bursts of observer callbacks into one geometry read per frame.
  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(evaluate);
  }, [evaluate]);

  useEffect(() => {
    const observer = new IntersectionObserver(() => schedule(), {
      // Full viewport with a fine-grained threshold ladder so the observer
      // fires frequently as elements move — every fire re-reads live rects.
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    });
    observerRef.current = observer;
    // Observe anything registered before the effect ran (ref callbacks fire
    // during commit, before this effect).
    elById.current.forEach((el) => observer.observe(el));

    const onResize = () => schedule();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      observer.disconnect();
      observerRef.current = null;
      window.removeEventListener("resize", onResize);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [schedule]);

  const register = useCallback(
    (id: string) => (el: Element | null) => {
      const prev = elById.current.get(id);
      if (prev && prev !== el) {
        observerRef.current?.unobserve(prev);
        elById.current.delete(id);
      }
      if (el) {
        elById.current.set(id, el);
        observerRef.current?.observe(el);
      }
    },
    [],
  );

  return register;
}
