import { useEffect, useState } from "react";
import { useIsMobile } from "./use-mobile";

/**
 * Returns framer-motion props for scroll-triggered animations
 * that work reliably on mobile:
 * - Lower intersection threshold (amount: 0.05)
 * - No vertical offset on mobile (avoids invisible stuck sections)
 * - Fallback: forces visible after 500ms if IntersectionObserver hasn't fired
 */
export function useScrollReveal() {
  const isMobile = useIsMobile();
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFallback(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const yOffset = isMobile ? 0 : 20;

  const fadeUp = {
    hidden: { opacity: 0, y: yOffset },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
    }),
  };

  const viewport = { once: true, amount: 0.05 as const };

  // On mobile or after fallback timeout, force visible immediately
  const initialState = (isMobile || fallback) ? "visible" : "hidden";

  return { fadeUp, viewport, initialState, isMobile };
}
