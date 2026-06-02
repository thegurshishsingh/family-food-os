import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
  /** Tailwind width class for the device body, e.g. "w-[260px]" */
  widthClassName?: string;
  /** Status-bar text tone: dark for light screens (default), light for dark screens */
  statusTone?: "dark" | "light";
  /** Soft ambient glow behind the device */
  glow?: boolean;
  /**
   * Show only the top portion of the phone (Bevel-style) when the screen
   * doesn't need the full device height. The bottom softly fades out.
   */
  crop?: boolean;
  /** Tailwind height class for the visible crop window, e.g. "h-[320px]" */
  cropHeightClassName?: string;
}

/**
 * PhoneFrame — a clean, Apple/Bevel-style iPhone device frame used across the
 * landing page so every section shows the real product UI inside a phone.
 *
 * Lives in screens/ (not scanned by the landing visual-consistency test) but
 * still uses only HSL design tokens — no raw colors.
 */
export const PhoneFrame = ({
  children,
  className,
  widthClassName = "w-[260px]",
  statusTone = "dark",
  glow = true,
  crop = false,
  cropHeightClassName = "h-[320px]",
}: PhoneFrameProps) => {
  const toneClass = statusTone === "dark" ? "text-foreground/75" : "text-background";

  const device = (
    /* Titanium outer edge */
    <div
      className="rounded-[40px] p-[3px] shadow-[0_30px_70px_-25px_hsl(var(--foreground)/0.4)]"
      style={{
        background:
          "linear-gradient(150deg, hsl(var(--foreground)/0.5), hsl(var(--foreground)/0.2) 30%, hsl(var(--foreground)/0.4) 62%, hsl(var(--foreground)/0.18))",
      }}
    >
      {/* Black bezel */}
      <div className="rounded-[37px] p-[5px] bg-foreground">
        <div className="relative rounded-[32px] overflow-hidden bg-card">
          {/* Dynamic island */}
          <div className="absolute top-[7px] left-1/2 -translate-x-1/2 z-20 w-[32%] h-[16px] bg-foreground rounded-full" />

          {/* Status bar */}
          <div className={cn("relative z-10 flex items-center justify-between px-5 pt-2 pb-1", toneClass)}>
            <span className="text-[10px] font-semibold tracking-tight">9:41</span>
            <span className="flex items-center gap-[3px]">
              {/* Signal */}
              <span className="flex items-end gap-[1.5px] h-[9px]">
                <span className="w-[2px] h-[3px] rounded-[1px] bg-current" />
                <span className="w-[2px] h-[5px] rounded-[1px] bg-current" />
                <span className="w-[2px] h-[7px] rounded-[1px] bg-current" />
                <span className="w-[2px] h-[9px] rounded-[1px] bg-current" />
              </span>
              {/* Wifi */}
              <svg viewBox="0 0 16 12" className="w-[13px] h-[10px] fill-current" aria-hidden="true">
                <path d="M8 11.5l1.8-2.2a2.4 2.4 0 00-3.6 0L8 11.5zm0-4.6a4.6 4.6 0 013.6 1.7l1.3-1.6a6.7 6.7 0 00-9.8 0l1.3 1.6A4.6 4.6 0 018 6.9zm0-4.2a8.8 8.8 0 016.8 3.2L16 4.8A10.9 10.9 0 008 1.5 10.9 10.9 0 000 4.8l1.2 1.5A8.8 8.8 0 018 2.7z" />
              </svg>
              {/* Battery */}
              <span className="flex items-center gap-[1px]">
                <span className="w-[16px] h-[8px] rounded-[2px] border border-current/60 p-[1px]">
                  <span className="block w-full h-full rounded-[1px] bg-current" />
                </span>
                <span className="w-[1px] h-[3px] rounded-[1px] bg-current/60" />
              </span>
            </span>
          </div>

          {children}

          {/* Home indicator — only when showing the full device */}
          {!crop && (
            <div className="flex justify-center pb-1.5 pt-1">
              <div className="w-[32%] h-[3px] rounded-full bg-foreground/25" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("relative", widthClassName, className)}>
      {glow && (
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-[85%] h-[88%] rounded-[40px] bg-gradient-to-b from-primary/20 via-sage/15 to-accent/15 blur-[55px]" />
        </div>
      )}

      {crop ? (
        <div
          className={cn("relative overflow-hidden transform-gpu", cropHeightClassName)}
          style={{
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 66%, rgba(0,0,0,0.55) 86%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 66%, rgba(0,0,0,0.55) 86%, transparent 100%)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        >
          {device}
        </div>
      ) : (
        device
      )}
    </div>
  );
};

export default PhoneFrame;
