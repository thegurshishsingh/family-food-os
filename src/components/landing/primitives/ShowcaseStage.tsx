import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PhoneFrame } from "../screens";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/**
 * ShowcaseStage — Bevel-style "feature stage": a soft pastel, consistently
 * bordered rounded panel that frames a phone and lets FloatingStatCards
 * overlap (and spill past) its edges, as if zooming into one detail of the
 * screen.
 *
 * Structure:
 *   outer (relative, NOT clipped)   ← floating cards spill past the panel edge
 *     panel (rounded-3xl border, overflow-hidden)  ← tint + glow + phone
 *
 * Lives in primitives/ (outside the visual-consistency scan) but uses only
 * HSL design tokens.
 */

type Tone = "sky" | "sage" | "amber" | "coral";

const toneBg: Record<Tone, string> = {
  sky: "from-sky/[0.14] via-sky/[0.05] to-background",
  sage: "from-sage/[0.18] via-sage/[0.06] to-background",
  amber: "from-warm/[0.16] via-warm/[0.05] to-background",
  coral: "from-coral/[0.13] via-coral/[0.05] to-background",
};

const toneGlow: Record<Tone, string> = {
  sky: "from-sky/25",
  sage: "from-sage/30",
  amber: "from-warm/25",
  coral: "from-coral/25",
};

export interface StageCard {
  node: ReactNode;
  /** Tailwind absolute-position classes, e.g. "top-10 -left-3" */
  pos: string;
  /** Float animation delay (seconds) */
  delay?: number;
  /** Hide on the smallest screens to avoid clutter */
  hideOnMobile?: boolean;
}

interface ShowcaseStageProps {
  tone?: Tone;
  /** The in-app screen component to render inside the phone */
  screen: () => JSX.Element;
  phoneWidth?: string;
  cards?: StageCard[];
  floatDelay?: number;
  className?: string;
  /** Show only the top portion of the phone (Bevel-style peek) */
  crop?: boolean;
  /** Tailwind height class for the crop window, e.g. "h-[330px]" */
  cropHeightClassName?: string;
}

export const ShowcaseStage = ({
  tone = "sage",
  screen: Screen,
  phoneWidth = "w-[238px] sm:w-[264px]",
  cards = [],
  floatDelay = 0,
  className,
  crop = false,
  cropHeightClassName = "h-[300px] sm:h-[330px]",
}: ShowcaseStageProps) => {
  return (
    <div className={cn("relative mx-auto w-fit", className)}>
      {/* Panel — tint + glow + phone (clipped) */}
      <div
        className={cn(
          "relative rounded-3xl border border-border/60 overflow-hidden bg-gradient-to-b px-6 sm:px-8",
          crop ? "pt-10 pb-0 sm:pt-12" : "py-10 sm:py-12",
          toneBg[tone],
        )}
      >
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
          <div className={cn("w-[78%] h-[68%] rounded-full blur-3xl bg-gradient-to-b to-transparent", toneGlow[tone])} />
        </div>

        <div className="relative flex justify-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
          >
            <PhoneFrame
              widthClassName={phoneWidth}
              glow={false}
              crop={crop}
              cropHeightClassName={cropHeightClassName}
            >
              <Screen />
            </PhoneFrame>
          </motion.div>
        </div>
      </div>

      {/* Floating zoom cards — spill past the panel edge.
          Outer layer = scroll reveal + hover (via card CSS); inner = gentle float. */}
      {cards.map((c, i) => (
        <motion.div
          key={i}
          className={cn("absolute z-20", c.pos, c.hideOnMobile && "hidden sm:block")}
          initial={{ opacity: 0, scale: 0.82, y: 16 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: c.delay ?? 0.6 + i * 0.5,
            }}
          >
            {c.node}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default ShowcaseStage;
