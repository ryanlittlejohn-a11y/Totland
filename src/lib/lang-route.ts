import { useRouterState } from "@tanstack/react-router";

/**
 * Spanish website pages live under /es/... and mirror the English paths
 * (/es, /es/pricing, /es/free-printables). Website only: inside the packaged
 * iOS/Android app these routes redirect home like every other adult-facing page.
 */

/**
 * Master switch for search engines. While false, the /es pages are reachable but
 * marked noindex, the English pages emit no hreflang, and the sitemap has no /es
 * entries. Flip to true (and uncomment the /es block in public/sitemap.xml) once
 * the Spanish copy has been read through.
 */
export const ES_INDEXABLE = false;

export const SITE = "https://totland.app";

/** English path -> Spanish path, for every page that has a Spanish version. */
export const ES_ALTERNATES: Record<string, string> = {
  "/": "/es",
  "/pricing": "/es/pricing",
  "/free-printables": "/es/free-printables",
};

const EN_FROM_ES: Record<string, string> = Object.fromEntries(
  Object.entries(ES_ALTERNATES).map(([en, es]) => [es, en]),
);

function clean(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

export function isEsPath(pathname: string): boolean {
  const p = clean(pathname);
  return p === "/es" || p.startsWith("/es/");
}

/** The same page in the other language, or null when there is no such page. */
export function alternatePath(pathname: string): string | null {
  const p = clean(pathname);
  return ES_ALTERNATES[p] ?? EN_FROM_ES[p] ?? null;
}

export function useIsEsRoute(): boolean {
  return useRouterState({ select: (s) => isEsPath(s.location.pathname) });
}

export function absolute(path: string): string {
  return path === "/" ? `${SITE}/` : `${SITE}${path}`;
}

/** <link rel="alternate" hreflang> set for a page; empty until ES_INDEXABLE is on. */
export function hreflangLinks(enPath: string) {
  const es = ES_ALTERNATES[enPath];
  if (!ES_INDEXABLE || !es) return [];
  return [
    { rel: "alternate", hreflang: "en", href: absolute(enPath) },
    { rel: "alternate", hreflang: "es", href: absolute(es) },
    { rel: "alternate", hreflang: "x-default", href: absolute(enPath) },
  ];
}

/** Extra <meta> for /es pages: noindex until ES_INDEXABLE is on. */
export function esRobotsMeta() {
  return ES_INDEXABLE ? [] : [{ name: "robots", content: "noindex, follow" }];
}
