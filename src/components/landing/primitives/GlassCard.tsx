import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * GlassCard — small floating cards used around the hero phone mockup
 * and other "floating" UI bits across the landing page.
 *
 * Recipe (frozen by design system):
 *   relative wrapper
 *   - 1px gradient halo (`-inset-[1px]`) for the liquid-glass border
 *   - inner panel: `bg-background/95 backdrop-blur-sm border border-border/50`
 *   - shadow + radius matched per size
 *
 * Sizes match the approved rounded-* scale enforced by
 * `src/test/landing-visual-consistency.test.ts`.
 */
const innerVariants = cva(
  "relative bg-background/95 backdrop-blur-sm border border-border/50",
  {
    variants: {
      size: {
        sm: "rounded-lg shadow-md",
        md: "rounded-xl shadow-lg",
        lg: "rounded-2xl shadow-xl",
      },
      padding: {
        none: "",
        xs: "px-3 py-1.5",
        sm: "p-3",
        md: "p-4",
        lg: "p-5",
      },
    },
    defaultVariants: { size: "md", padding: "sm" },
  },
);

const haloVariants = cva("absolute -inset-[1px] bg-gradient-to-br", {
  variants: {
    size: {
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-2xl",
    },
    halo: {
      primary: "from-primary/20 via-border/40 to-primary/15",
      sky: "from-sky/20 via-border/40 to-primary/15",
      coral: "from-coral/20 via-border/40 to-accent/15",
      pillSocial: "from-primary/20 via-border/40 to-sky/15",
    },
  },
  defaultVariants: { size: "md", halo: "primary" },
});

export interface GlassCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof innerVariants>,
    Pick<VariantProps<typeof haloVariants>, "halo"> {
  outerClassName?: string;
  children: ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { children, className, outerClassName, size, padding, halo, ...rest },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn("relative", outerClassName)} {...rest}>
        <div className={haloVariants({ size, halo })} aria-hidden="true" />
        <div className={cn(innerVariants({ size, padding }), className)}>
          {children}
        </div>
      </div>
    );
  },
);
GlassCard.displayName = "GlassCard";
