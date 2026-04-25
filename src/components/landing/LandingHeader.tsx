import { Link } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { resolveHeaderLabels } from "./headerI18n";

/**
 * Breakpoint-aware landing header.
 *
 * Spacing contract (must stay in sync with hero top padding):
 * - Nav height: var(--header-height) (64px) on all viewports
 * - Hero sections should use pt-24 (96px) minimum to clear the fixed nav
 *
 * Responsive behavior:
 * - <390px: "Log in" collapses to icon, CTA uses `ctaShort`
 * - ≥390px (xs): full labels visible
 * - ≥768px (md): wider padding + full-size buttons
 *
 * I18n: labels and per-label character caps live in `headerI18n.ts`.
 * Pass an explicit `locale` prop to override the navigator default.
 */
interface LandingHeaderProps {
  locale?: string;
}

const LandingHeader = ({ locale }: LandingHeaderProps) => {
  const labels = resolveHeaderLabels(locale);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30 overflow-hidden">
      <div
        className="container mx-auto flex items-center justify-between gap-2 px-3 md:px-8 max-w-screen-xl flex-nowrap whitespace-nowrap min-w-0 h-header"
        style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(var(--header-height) + env(safe-area-inset-top))" }}
      >
        {/* Brand: shrinks first, truncates wordmark, never wraps */}
        <Link
          to="/"
          className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden"
          aria-label="Family Food OS — Home"
        >
          <span className="sm:hidden flex-shrink-0"><Logo size="md" showText={false} /></span>
          <span className="hidden sm:inline-flex min-w-0 max-w-full overflow-hidden [&_*]:truncate"><Logo size="md" /></span>
        </Link>

        {/* Actions: tokenized widths, never wrap, never shrink */}
        <div className="flex items-center gap-1 xs:gap-1.5 md:gap-3 flex-shrink-0 flex-nowrap whitespace-nowrap">
          {/* Log in: full label ≥390px, icon below */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden xs:inline-flex h-header-btn max-w-header-login-xs md:max-w-header-login-md px-2.5 md:px-4 font-sans text-sm font-medium leading-[1] [font-feature-settings:'tnum'] antialiased whitespace-nowrap overflow-hidden"
            asChild
          >
            <Link
              to="/login"
              className="inline-flex h-full items-center justify-center leading-[1] min-w-0 max-w-full truncate"
              title={labels.login}
            >
              <span className="truncate" style={{ maxWidth: `${labels.maxChars.login}ch` }}>
                {labels.login}
              </span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="xs:hidden h-header-icon w-header-icon flex-shrink-0 leading-[1]"
            asChild
            aria-label={labels.login}
          >
            <Link to="/login" className="inline-flex items-center justify-center leading-[1]">
              <LogIn className="w-4 h-4" />
            </Link>
          </Button>

          {/* Primary CTA: tokenized widths per breakpoint, label truncates */}
          <Button
            size="sm"
            className="h-header-btn w-header-cta-xxs xs:w-header-cta-xs md:w-header-cta-md px-3 md:px-4 bg-gradient-to-r from-primary to-sage-dark hover:from-primary/90 hover:to-sage-dark/90 shadow-md whitespace-nowrap overflow-hidden font-sans text-sm font-medium leading-[1] [font-feature-settings:'tnum'] antialiased flex-shrink-0"
            asChild
          >
            <Link
              to="/signup"
              className="inline-flex h-full w-full items-center justify-center gap-1 leading-[1] min-w-0"
              title={labels.ctaFull}
            >
              <span
                className="hidden xs:inline min-w-0 truncate leading-[1]"
                style={{ maxWidth: `${labels.maxChars.ctaFull}ch` }}
              >
                {labels.ctaFull}
              </span>
              <span
                className="xs:hidden truncate leading-[1]"
                style={{ maxWidth: `${labels.maxChars.ctaShort}ch` }}
              >
                {labels.ctaShort}
              </span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingHeader;

