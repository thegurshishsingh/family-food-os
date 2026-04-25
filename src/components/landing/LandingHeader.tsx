import { Link } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

/**
 * Breakpoint-aware landing header.
 *
 * Spacing contract (must stay in sync with hero top padding):
 * - Nav height: h-16 (64px) on all viewports
 * - Hero sections should use pt-24 (96px) minimum to clear the fixed nav
 *
 * Responsive behavior:
 * - <390px: "Log in" collapses to icon, "Start free" → "Start"
 * - ≥390px (xs): full labels visible
 * - ≥768px (md): wider padding + full-size buttons
 *
 * Explicit leading-none on text prevents iOS Safari line-height jitter.
 */
const LandingHeader = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30 overflow-hidden">
      <div
        className="container mx-auto flex items-center justify-between gap-2 px-3 md:px-8 max-w-screen-xl flex-nowrap whitespace-nowrap min-w-0"
        style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(4rem + env(safe-area-inset-top))" }}
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

        {/* Actions: fixed widths, never wrap, never shrink */}
        <div className="flex items-center gap-1 xs:gap-1.5 md:gap-3 flex-shrink-0 flex-nowrap whitespace-nowrap">
          {/* Log in: full label ≥390px, icon below */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden xs:inline-flex h-9 max-w-[88px] md:max-w-[120px] px-2.5 md:px-4 font-sans text-sm font-medium leading-[1] [font-feature-settings:'tnum'] antialiased whitespace-nowrap overflow-hidden"
            asChild
          >
            <Link to="/login" className="inline-flex h-full items-center justify-center leading-[1] min-w-0 max-w-full truncate">
              Log in
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="xs:hidden h-9 w-9 flex-shrink-0 leading-[1]"
            asChild
            aria-label="Log in"
          >
            <Link to="/login" className="inline-flex items-center justify-center leading-[1]">
              <LogIn className="w-4 h-4" />
            </Link>
          </Button>

          {/* Primary CTA: stable widths per breakpoint, label truncates */}
          <Button
            size="sm"
            className="h-9 w-[96px] xs:w-[132px] md:w-[148px] px-3 md:px-4 bg-gradient-to-r from-primary to-sage-dark hover:from-primary/90 hover:to-sage-dark/90 shadow-md whitespace-nowrap overflow-hidden font-sans text-sm font-medium leading-[1] [font-feature-settings:'tnum'] antialiased flex-shrink-0"
            asChild
          >
            <Link to="/signup" className="inline-flex h-full w-full items-center justify-center gap-1 leading-[1] min-w-0">
              <span className="hidden xs:inline min-w-0 truncate leading-[1]">Start free</span>
              <span className="xs:hidden truncate leading-[1]">Start</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingHeader;
