import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * IconTile — gradient-filled rounded square that wraps lucide icons in
 * landing sections. Replaces the dozens of bespoke
 *   `inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ...`
 * blocks scattered across landing components.
 *
 * `gradient` accepts the raw Tailwind gradient string (e.g.
 * `"from-primary to-sage-dark"`) so existing per-card color schemes are preserved.
 */
const tileVariants = cva(
  "inline-flex items-center justify-center bg-gradient-to-br shrink-0",
  {
    variants: {
      size: {
        xs: "w-5 h-5 rounded-md",
        sm: "w-6 h-6 rounded-md",
        md: "w-8 h-8 rounded-lg",
        lg: "w-11 h-11 rounded-xl",
        xl: "w-12 h-12 rounded-2xl",
        "2xl": "w-14 h-14 rounded-3xl",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
      },
    },
    defaultVariants: { size: "md", shadow: "none" },
  },
);

export interface IconTileProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tileVariants> {
  /** Tailwind gradient classes, e.g. "from-primary to-sage-dark". */
  gradient: string;
  children: ReactNode;
}

export const IconTile = forwardRef<HTMLDivElement, IconTileProps>(
  ({ gradient, size, shadow, className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tileVariants({ size, shadow }), gradient, className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
IconTile.displayName = "IconTile";
