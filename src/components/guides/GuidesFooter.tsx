import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

/** Compact footer shared across the Guides resource library + articles. */
const GuidesFooter = () => (
  <footer className="mt-16 border-t border-border/50 bg-primary text-primary-foreground/90">
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div className="space-y-3">
          <div className="[&_*]:text-primary-foreground">
            <Logo size="sm" />
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-primary-foreground/70">
            The weekly dinner system for busy families — built by parents tired of the 5pm scramble.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              Guides
            </p>
            <Link to="/guides" className="block text-xs text-primary-foreground/70 transition-colors hover:text-accent">
              All guides
            </Link>
            <Link
              to="/guides/real-week-dinner-guide"
              className="block text-xs text-primary-foreground/70 transition-colors hover:text-accent"
            >
              The Real Week Dinner Guide
            </Link>
            <Link
              to="/guides/the-dinner-pattern-report"
              className="block text-xs text-primary-foreground/70 transition-colors hover:text-accent"
            >
              The Dinner Pattern Report
            </Link>
          </div>
          <div className="space-y-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              Product
            </p>
            <Link to="/" className="block text-xs text-primary-foreground/70 transition-colors hover:text-accent">
              How it works
            </Link>
            <Link to="/signup" className="block text-xs text-primary-foreground/70 transition-colors hover:text-accent">
              Get started
            </Link>
            <a
              href="mailto:hello@familyfoodOS.com"
              className="block text-xs text-primary-foreground/70 transition-colors hover:text-accent"
            >
              Contact us
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
            Family Food OS
          </p>
          <p className="text-[11px] leading-relaxed text-primary-foreground/60">
            Cook, leftovers, takeout, and dine-out in one plan that learns your real life.
          </p>
          <p className="pt-2 text-[11px] text-sage-light/80">Your family's data is never sold. Ever.</p>
        </div>
      </div>

      <div className="mt-10 border-t border-primary-foreground/15 pt-5">
        <p className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} Family Food OS · Made with care for busy families
        </p>
      </div>
    </div>
  </footer>
);

export default GuidesFooter;
