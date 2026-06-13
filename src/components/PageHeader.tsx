import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  /** Small uppercase eyebrow label shown in the pill badge */
  eyebrow: string;
  /** Optional icon rendered inside the accent tile to the left of the title */
  icon?: LucideIcon;
  /** Main serif heading */
  title: ReactNode;
  /** Supporting line under the heading */
  subtitle?: ReactNode;
  /** Optional right-aligned action (button, etc.) */
  action?: ReactNode;
  className?: string;
}

/**
 * Shared app page header that mirrors the landing page design language:
 * a pulsing pill eyebrow badge, an accent icon tile, and a Fraunces serif
 * heading with a muted subtitle. Keeps the in-app pages on-theme.
 */
const PageHeader = ({ eyebrow, icon: Icon, title, subtitle, action, className }: PageHeaderProps) => {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-7 ${className ?? ""}`}>
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary leading-none">
            {eyebrow}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="hidden sm:inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-sky/15 to-primary/10 shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-foreground leading-[1.15]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
