import { Link, useRouterState } from "@tanstack/react-router";
import { alternatePath, isEsPath } from "@/lib/lang-route";

/**
 * "Español" / "English" link between the two versions of a public page. Renders
 * nothing on pages that have no twin. It only navigates; it never changes the
 * language saved on a child's profile.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const alt = alternatePath(pathname);
  if (!alt) return null;
  const toEs = !isEsPath(pathname);
  return (
    <Link
      // The paths are the literal route paths from ES_ALTERNATES.
      to={alt as "/"}
      hrefLang={toEs ? "es" : "en"}
      lang={toEs ? "es" : "en"}
      className={className ?? "underline"}
    >
      {toEs ? "Español" : "English"}
    </Link>
  );
}
