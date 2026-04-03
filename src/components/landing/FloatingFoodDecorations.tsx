import { motion } from "framer-motion";

/**
 * Playful floating food SVG decorations scattered across sections.
 * Each item is a simple, colorful SVG icon that floats gently.
 */

const Tomato = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className}>
    <circle cx="32" cy="36" r="24" fill="hsl(var(--coral))" />
    <circle cx="32" cy="36" r="24" fill="url(#tomato-shine)" />
    <ellipse cx="32" cy="16" rx="6" ry="4" fill="hsl(var(--primary))" />
    <path d="M32 12 Q28 4 24 10 Q26 6 30 8 Z" fill="hsl(var(--primary))" />
    <path d="M32 12 Q36 4 40 10 Q38 6 34 8 Z" fill="hsl(var(--sage-dark))" />
    <defs>
      <radialGradient id="tomato-shine" cx="0.35" cy="0.3" r="0.65">
        <stop offset="0%" stopColor="white" stopOpacity="0.25" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

const Carrot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 80" fill="none" className={className}>
    <path d="M24 20 L18 72 Q24 78 30 72 Z" fill="hsl(var(--accent))" />
    <path d="M24 20 L21 72 Q24 76 24 72 Z" fill="hsl(var(--coral))" opacity="0.3" />
    <path d="M20 18 Q16 4 22 12" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M24 16 Q24 2 28 10" stroke="hsl(var(--sage-dark))" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M28 18 Q32 6 30 14" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

const Lemon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className}>
    <ellipse cx="32" cy="24" rx="28" ry="20" fill="hsl(var(--lemon))" />
    <ellipse cx="32" cy="24" rx="28" ry="20" fill="url(#lemon-shine)" />
    <ellipse cx="28" cy="20" rx="8" ry="5" fill="white" opacity="0.2" />
    <defs>
      <radialGradient id="lemon-shine" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="white" stopOpacity="0.3" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

const Leaf = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 64" fill="none" className={className}>
    <path d="M24 8 Q40 16 36 40 Q32 56 24 60 Q16 56 12 40 Q8 16 24 8Z" fill="hsl(var(--primary))" opacity="0.8" />
    <path d="M24 8 Q24 36 24 60" stroke="hsl(var(--sage-dark))" strokeWidth="1.5" opacity="0.5" />
    <path d="M24 20 Q30 24 32 32" stroke="hsl(var(--sage-dark))" strokeWidth="1" opacity="0.3" fill="none" />
    <path d="M24 28 Q18 32 16 38" stroke="hsl(var(--sage-dark))" strokeWidth="1" opacity="0.3" fill="none" />
  </svg>
);

const Pepper = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 72" fill="none" className={className}>
    <path d="M20 16 Q32 24 30 48 Q28 64 20 68 Q12 64 10 48 Q8 24 20 16Z" fill="hsl(var(--sky))" />
    <path d="M20 16 Q26 24 25 48 Q24 60 20 68" fill="hsl(var(--sky))" opacity="0.5" />
    <rect x="17" y="8" width="6" height="10" rx="2" fill="hsl(var(--primary))" />
    <ellipse cx="18" cy="30" rx="4" ry="6" fill="white" opacity="0.15" />
  </svg>
);

interface FloatingItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

const FloatingItem = ({ children, className = "", delay = 0, duration = 6 }: FloatingItemProps) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    animate={{
      y: [0, -12, 0],
      rotate: [0, 3, -2, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  >
    {children}
  </motion.div>
);

/**
 * Hero section food decorations
 */
export const HeroFoodDecorations = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    <FloatingItem className="top-[15%] right-[4%] md:right-[8%] opacity-50 md:opacity-70" delay={0} duration={7}>
      <Tomato className="w-12 h-12 md:w-16 md:h-16" />
    </FloatingItem>
    <FloatingItem className="bottom-[10%] left-[3%] md:left-[6%] opacity-40 md:opacity-60" delay={1.5} duration={8}>
      <Carrot className="w-8 h-14 md:w-10 md:h-16" />
    </FloatingItem>
    <FloatingItem className="top-[55%] left-[2%] md:left-[12%] opacity-30 md:opacity-50" delay={2.5} duration={6}>
      <Leaf className="w-8 h-10 md:w-10 md:h-14" />
    </FloatingItem>
    <FloatingItem className="hidden md:block top-[70%] right-[5%] opacity-40" delay={3} duration={9}>
      <Lemon className="w-14 h-10" />
    </FloatingItem>
  </div>
);

/**
 * Mid-page scattered decorations (between sections)
 */
export const MidPageDecorations = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    <FloatingItem className="top-[5%] right-[5%] opacity-35 md:opacity-50" delay={1} duration={7}>
      <Lemon className="w-10 h-8 md:w-14 md:h-10" />
    </FloatingItem>
    <FloatingItem className="bottom-[15%] left-[4%] opacity-30 md:opacity-45" delay={2} duration={8}>
      <Pepper className="w-7 h-12 md:w-9 md:h-16" />
    </FloatingItem>
  </div>
);

/**
 * Bottom-page food decorations
 */
export const BottomPageDecorations = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
    <FloatingItem className="top-[10%] left-[4%] opacity-30 md:opacity-50" delay={0.5} duration={7}>
      <Tomato className="w-10 h-10 md:w-12 md:h-12" />
    </FloatingItem>
    <FloatingItem className="bottom-[20%] right-[3%] md:right-[8%] opacity-35 md:opacity-55" delay={2} duration={8}>
      <Carrot className="w-8 h-14 md:w-10 md:h-16" />
    </FloatingItem>
    <FloatingItem className="hidden md:block top-[50%] right-[15%] opacity-30" delay={3} duration={6}>
      <Leaf className="w-8 h-10" />
    </FloatingItem>
  </div>
);
