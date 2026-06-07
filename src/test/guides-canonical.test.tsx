import { describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { cleanup, render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Guides from "@/pages/Guides";
import GuideArticle from "@/pages/GuideArticle";
import DinnerPatternReport from "@/pages/DinnerPatternReport";
import { GUIDES, SITE_URL } from "@/content/guides";

/**
 * Canonical-tag guardrails for the Guides library.
 *
 * Each guide article and the Dinner Pattern Report must emit EXACTLY ONE
 * <link rel="canonical"> that points at its own URL. A second canonical
 * (e.g. a stale static one from index.html, or one left behind by a prior
 * route) is invalid SEO, so we verify:
 *
 *   1. Every guide route renders exactly one self-referencing canonical.
 *   2. Navigating between routes never leaves a stale canonical behind.
 *   3. index.html ships no static canonical that would duplicate Helmet's.
 */

// --- jsdom polyfills for the page components -----------------------------
beforeAll(() => {
  // framer-motion's whileInView needs IntersectionObserver
  if (!("IntersectionObserver" in window)) {
    class IO {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    // @ts-expect-error - test polyfill
    window.IntersectionObserver = IO;
    // @ts-expect-error - test polyfill
    global.IntersectionObserver = IO;
  }
  // GuideArticle calls window.scrollTo on mount
  window.scrollTo = () => {};
});

function renderRoute(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/guides" element={<Guides />} />
          <Route
            path="/guides/the-dinner-pattern-report"
            element={<DinnerPatternReport />}
          />
          <Route path="/guides/:slug" element={<GuideArticle />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

function canonicalLinks(): HTMLLinkElement[] {
  return Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'),
  );
}

async function waitForCanonical(expectedHref: string) {
  await waitFor(() => {
    const links = canonicalLinks();
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe(expectedHref);
  });
}

// Routes under test: each article + the report, with the URL each should self-reference.
const ROUTES: { label: string; path: string; canonical: string }[] = [
  ...GUIDES.map((g) => ({
    label: g.slug,
    path: `/guides/${g.slug}`,
    canonical: `${SITE_URL}/guides/${g.slug}`,
  })),
  {
    label: "the-dinner-pattern-report",
    path: "/guides/the-dinner-pattern-report",
    canonical: `${SITE_URL}/guides/the-dinner-pattern-report`,
  },
];

describe("Guides canonical tags", () => {
  beforeEach(() => {
    // Start every test with a clean head so leftovers can't mask a bug.
    canonicalLinks().forEach((l) => l.remove());
  });

  afterEach(() => {
    cleanup();
  });

  describe("exactly one self-referencing canonical per route", () => {
    for (const route of ROUTES) {
      it(`${route.label} sets a single canonical -> ${route.canonical}`, async () => {
        renderRoute(route.path);
        await waitForCanonical(route.canonical);
      });
    }
  });

  it("never accumulates duplicate canonicals when navigating across routes", async () => {
    for (const route of ROUTES) {
      const { unmount } = renderRoute(route.path);
      await waitForCanonical(route.canonical);
      unmount();
      // After unmount, Helmet must clean up — no stale canonical may remain.
      await waitFor(() => {
        expect(canonicalLinks()).toHaveLength(0);
      });
    }
  });

  it("index.html ships no static canonical that would duplicate Helmet's", () => {
    const html = readFileSync(join(process.cwd(), "index.html"), "utf-8");
    const matches = html.match(/rel=["']canonical["']/g) ?? [];
    expect(
      matches,
      "index.html must not contain a static <link rel=\"canonical\">; each route owns its canonical via react-helmet-async.",
    ).toEqual([]);
  });
});
