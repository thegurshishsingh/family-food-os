import { useEffect } from "react";

interface DocumentHeadOptions {
  title: string;
  description?: string;
  canonical?: string; // absolute or path
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
}

const SITE_ORIGIN = "https://www.familyfoodos.com";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets per-route document head tags (title, description, canonical, og:*)
 * for the classic Vite SPA. Note: social crawlers that don't execute JS
 * (LinkedIn, Slack) still see the static head from index.html.
 */
export function useDocumentHead({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogUrl,
}: DocumentHeadOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (description) setMeta("name", "description", description);

    const canonicalHref = canonical
      ? canonical.startsWith("http")
        ? canonical
        : `${SITE_ORIGIN}${canonical}`
      : `${SITE_ORIGIN}${window.location.pathname}`;
    setLink("canonical", canonicalHref);

    setMeta("property", "og:title", ogTitle ?? title);
    if (ogDescription ?? description) {
      setMeta("property", "og:description", ogDescription ?? description!);
    }
    setMeta("property", "og:url", ogUrl ?? canonicalHref);
    setMeta("name", "twitter:title", ogTitle ?? title);
    if (ogDescription ?? description) {
      setMeta("name", "twitter:description", ogDescription ?? description!);
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogUrl]);
}
