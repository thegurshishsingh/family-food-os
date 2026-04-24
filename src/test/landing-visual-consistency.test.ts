import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Lightweight visual-regression-style guardrails for the landing page.
 *
 * Instead of pixel-diffing screenshots (flaky, slow), we statically scan
 * every landing component for the patterns that have caused palette and
 * rounded-card drift in the past:
 *
 *   1. No raw hex / rgb / rgba colors — must use design tokens
 *   2. No hardcoded Tailwind color utilities (bg-white, text-black, …)
 *   3. Rounded-card scale stays within an approved set
 *   4. Floating glass cards use the canonical bg-background/95 + backdrop-blur recipe
 *   5. Responsive blocks (md:hidden / hidden md:flex) keep the same card radii,
 *      so desktop and mobile layouts can't drift apart visually
 */

const LANDING_DIR = join(process.cwd(), "src/components/landing");
const FOOTER_FILE = "Landing.tsx"; // Landing.tsx legitimately uses footer brand hex codes

// --- Allow-lists ---------------------------------------------------------

// Brand-illustration footer colors live in src/pages/Landing.tsx and are
// intentional (matching the illustrated footer scene). We only audit the
// landing/* component folder, so this is informational.
const ALLOWED_ROUNDED = new Set([
  "rounded-none",
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-full",
  "rounded-t-2xl",
  "rounded-b-2xl",
  // arbitrary values used for the phone mockup specifically
  "rounded-[24px]",
  "rounded-[22px]",
  "rounded-[40px]",
  "rounded-[2px]",
  "rounded-[1px]",
  "rounded-[3px]",
  // 1-px halo around a rounded-2xl (16px) card — used for liquid-glass borders
  "rounded-[18px]",
]);

const FORBIDDEN_COLOR_CLASSES = [
  /\bbg-white\b/,
  /\bbg-black\b/,
  /\btext-white\b/,
  /\btext-black\b/,
  /\bborder-white\b/,
  /\bborder-black\b/,
];

// rgb()/rgba() and #abc / #abcdef literals — but allow them inside
// hsl(var(--token)/0.x) patterns by stripping those first.
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_RE = /\brgba?\s*\(/g;

function getLandingFiles(): string[] {
  return readdirSync(LANDING_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(LANDING_DIR, f));
}

function readAll(): { file: string; content: string }[] {
  return getLandingFiles().map((file) => ({
    file,
    content: readFileSync(file, "utf-8"),
  }));
}

describe("Landing visual consistency", () => {
  const files = readAll();

  it("has landing components to audit", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  describe("Palette: no raw colors", () => {
    for (const { file, content } of files) {
      const name = file.split("/").pop()!;
      it(`${name} uses no hex color literals`, () => {
        const hexMatches = content.match(HEX_RE) ?? [];
        expect(
          hexMatches,
          `Found hex colors in ${name}: ${hexMatches.join(", ")}. Use HSL design tokens from index.css instead.`,
        ).toEqual([]);
      });

      it(`${name} uses no rgb()/rgba() literals`, () => {
        const rgbMatches = content.match(RGB_RE) ?? [];
        expect(
          rgbMatches.length,
          `Found rgb()/rgba() in ${name}. Use hsl(var(--token)/0.x) instead.`,
        ).toBe(0);
      });

      it(`${name} uses no hardcoded Tailwind color utilities`, () => {
        const hits: string[] = [];
        for (const re of FORBIDDEN_COLOR_CLASSES) {
          const m = content.match(re);
          if (m) hits.push(m[0]);
        }
        expect(
          hits,
          `Found forbidden classes in ${name}: ${hits.join(", ")}. Use semantic tokens (bg-background, text-foreground, …).`,
        ).toEqual([]);
      });
    }
  });

  describe("Rounded-card scale", () => {
    for (const { file, content } of files) {
      const name = file.split("/").pop()!;
      it(`${name} only uses approved rounded-* utilities`, () => {
        const matches = content.match(/\brounded-[a-z0-9[\]\-_/.]+/g) ?? [];
        const offenders = matches.filter((m) => !ALLOWED_ROUNDED.has(m));
        expect(
          offenders,
          `Unexpected rounded-* utilities in ${name}: ${[...new Set(offenders)].join(", ")}. Stick to the approved scale or add to allow-list intentionally.`,
        ).toEqual([]);
      });
    }
  });

  describe("Glassmorphism recipe", () => {
    // Any landing card that uses bg-background/95 should also include
    // backdrop-blur so the glass effect is consistent.
    for (const { file, content } of files) {
      const name = file.split("/").pop()!;
      const lines = content.split("\n");
      const offenders: number[] = [];
      lines.forEach((line, i) => {
        if (line.includes("bg-background/95") && !line.includes("backdrop-blur")) {
          offenders.push(i + 1);
        }
      });
      it(`${name} pairs bg-background/95 with backdrop-blur`, () => {
        expect(
          offenders,
          `Lines missing backdrop-blur next to bg-background/95 in ${name}: ${offenders.join(", ")}`,
        ).toEqual([]);
      });
    }
  });

  describe("Desktop vs mobile parity", () => {
    // For files that ship explicit desktop and mobile layouts (md:hidden +
    // hidden md:flex), make sure the rounded-* scale used in each branch
    // is identical — otherwise cards visibly differ across breakpoints.
    for (const { file, content } of files) {
      const name = file.split("/").pop()!;
      const hasMobileBranch = /\bmd:hidden\b/.test(content);
      const hasDesktopBranch = /\bhidden\s+md:(flex|block|grid)\b/.test(content);
      if (!hasMobileBranch || !hasDesktopBranch) continue;

      it(`${name} uses the same rounded-* set on desktop and mobile`, () => {
        // Crude but effective: split on md:hidden / hidden md:* markers
        // and compare the rounded utilities on each side.
        const desktopChunk = content
          .split(/className="[^"]*\bmd:hidden\b[^"]*"/)
          .filter((_, i) => i % 2 === 0)
          .join("\n");
        const mobileChunk = content
          .split(/className="[^"]*\bhidden\s+md:(flex|block|grid)\b[^"]*"/)
          .filter((_, i) => i % 2 === 0)
          .join("\n");

        const desktopRounded = new Set(
          (desktopChunk.match(/\brounded-[a-z0-9[\]\-_/.]+/g) ?? []).filter((r) =>
            ALLOWED_ROUNDED.has(r),
          ),
        );
        const mobileRounded = new Set(
          (mobileChunk.match(/\brounded-[a-z0-9[\]\-_/.]+/g) ?? []).filter((r) =>
            ALLOWED_ROUNDED.has(r),
          ),
        );

        const onlyDesktop = [...desktopRounded].filter((r) => !mobileRounded.has(r));
        const onlyMobile = [...mobileRounded].filter((r) => !desktopRounded.has(r));

        // Allow either branch to be a strict superset of shared utilities;
        // only fail if both branches actively use rounded utilities AND they
        // diverge — that's the real drift signal.
        if (desktopRounded.size > 0 && mobileRounded.size > 0) {
          expect(
            { onlyDesktop, onlyMobile },
            `Desktop/mobile rounded-* drift in ${name}.`,
          ).toEqual({ onlyDesktop: [], onlyMobile: [] });
        }
      });
    }
  });
});
