import type { ReactNode } from "react";
import { LAST_CHECKED, SUPPORT_EMAIL } from "@/lib/comparison-facts";

/** Disclosure plus the single "last checked" line shown near the top of both pages. */
export function ComparisonIntro() {
  return (
    <section>
      <p className="rounded-xl border border-border bg-card p-4 text-sm">
        We make Totland. We&apos;ve tried to be fair; corrections welcome at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
      <p className="text-sm text-muted-foreground">Last checked: {LAST_CHECKED}</p>
    </section>
  );
}

export function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener nofollow" target="_blank">
      {children}
    </a>
  );
}
