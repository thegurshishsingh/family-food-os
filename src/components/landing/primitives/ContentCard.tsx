import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * ContentCard — the larger "section" cards used by TheStruggle, ProductProof,
 * and similar landing sections. Always `rounded-2xl` + `glass-strong`, with
 * an optional gradient halo border.
 *
 * Halo radii are intentionally tied to the card radius (`rounded-2xl` outer
 * → `rounded-[18px]` 1px halo) to keep the liquid-glass look identical
 * everywhere it appears.
 */
const innerVariants = cva(
  "relative rounded-2xl glass-strong overflow-hidden",
  {
    variants: {
      shadow: {
        none: "",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
      },
    },
    defaultVariants: { shadow: "xl" },
  },
);

const haloVariants = cva("absolute -inset-[1px] rounded-[18px] blur-[0.5px]", {
  variants: {
    halo: {
      none: "hidden",
      primary: "bg-gradient-to-br from-primary/25 via-sky/15 to-accent/20",
      coral: "bg-gradient-to-b from-coral/20 via-accent/10 to-transparent",
      sky: "bg-gradient-to-br from-sky/20 via-primary/10 to-transparent",
    },
  },
  defaultVariants: { halo: "none" },
});

export interface ContentCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof innerVariants>,
    VariantProps<typeof haloVariants> {
  outerClassName?: string;
  children: ReactNode;
}

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(
  (
    { children, className, outerClassName, shadow, halo, ...rest },
    ref,
  ) => {
    const hasHalo = halo && halo !== "none";
    return (
      <div ref={ref} className={cn("relative", outerClassName)} {...rest}>
        {hasHalo && (
          <div className={haloVariants({ halo })} aria-hidden="true" />
        )}
        <div className={cn(innerVariants({ shadow }), className)}>{children}</div>
      </div>
    );
  },
);
ContentCard.displayName = "ContentCard";
