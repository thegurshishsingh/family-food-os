/**
 * Header i18n label registry.
 *
 * Each locale defines BOTH the strings and the explicit character-truncation
 * limits the header should respect. CSS width tokens (see `--header-cta-*` in
 * index.css) cap the *visual* width; `maxChars` here caps the *string length*
 * so a locale with naturally long words (e.g. de-DE "Kostenlos starten") gets
 * shortened to its locale-approved abbreviation rather than ellipsised.
 *
 * To add a locale:
 *   1. Add an entry below.
 *   2. Provide both `full` and `short` strings already pre-shortened to fit.
 *   3. Set `maxChars` to your design-approved limits.
 *
 * The resolver falls back to `en` for any unknown locale.
 */
export type HeaderLabelKey = "login" | "ctaFull" | "ctaShort";

export interface HeaderLocaleLabels {
  login: string;
  ctaFull: string;   // shown ≥390px (xs breakpoint)
  ctaShort: string;  // shown <390px
  /** Hard character caps per label (post-locale, pre-render). */
  maxChars: {
    login: number;
    ctaFull: number;
    ctaShort: number;
  };
}

export const HEADER_LOCALES: Record<string, HeaderLocaleLabels> = {
  en: {
    login: "Log in",
    ctaFull: "Start free",
    ctaShort: "Start",
    maxChars: { login: 8, ctaFull: 12, ctaShort: 6 },
  },
  "en-US": {
    login: "Log in",
    ctaFull: "Start free",
    ctaShort: "Start",
    maxChars: { login: 8, ctaFull: 12, ctaShort: 6 },
  },
  "es": {
    login: "Entrar",
    ctaFull: "Empezar gratis",
    ctaShort: "Empezar",
    maxChars: { login: 8, ctaFull: 14, ctaShort: 8 },
  },
  "fr": {
    login: "Connexion",
    ctaFull: "Commencer",
    ctaShort: "Démarrer",
    maxChars: { login: 10, ctaFull: 12, ctaShort: 9 },
  },
  "de": {
    login: "Anmelden",
    ctaFull: "Gratis starten",
    ctaShort: "Start",
    maxChars: { login: 10, ctaFull: 14, ctaShort: 6 },
  },
  "pt": {
    login: "Entrar",
    ctaFull: "Começar grátis",
    ctaShort: "Começar",
    maxChars: { login: 8, ctaFull: 14, ctaShort: 8 },
  },
  "it": {
    login: "Accedi",
    ctaFull: "Inizia gratis",
    ctaShort: "Inizia",
    maxChars: { login: 8, ctaFull: 13, ctaShort: 7 },
  },
  "nl": {
    login: "Inloggen",
    ctaFull: "Gratis starten",
    ctaShort: "Start",
    maxChars: { login: 9, ctaFull: 14, ctaShort: 6 },
  },
};

/**
 * Resolve a locale (e.g. "de-AT") to its labels, falling back to language root
 * ("de") and finally English. Hard-truncates each label to its locale-approved
 * `maxChars` so visual width can never silently overflow.
 */
export function resolveHeaderLabels(locale?: string): HeaderLocaleLabels {
  const raw = (locale || (typeof navigator !== "undefined" ? navigator.language : "en") || "en").trim();
  const candidates = [raw, raw.split("-")[0], "en"];
  const match =
    candidates.map((c) => HEADER_LOCALES[c]).find(Boolean) ?? HEADER_LOCALES.en;

  // Defensive truncation — never trust a label longer than its declared cap.
  const clip = (s: string, n: number) => (s.length > n ? s.slice(0, Math.max(0, n - 1)).trimEnd() + "…" : s);

  return {
    login: clip(match.login, match.maxChars.login),
    ctaFull: clip(match.ctaFull, match.maxChars.ctaFull),
    ctaShort: clip(match.ctaShort, match.maxChars.ctaShort),
    maxChars: match.maxChars,
  };
}
