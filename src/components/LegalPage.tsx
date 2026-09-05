import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          &larr; Back to Totland
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {updated}
        </p>
        <div className="mt-8 space-y-8 text-foreground/90 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mt-2 [&_p]:leading-relaxed [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
        <footer className="mt-12 flex gap-6 border-t border-border pt-6 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-primary hover:underline">
            Terms &amp; Conditions
          </Link>
          <Link to="/refund" className="hover:text-primary hover:underline">
            Refund Policy
          </Link>
          <Link to="/privacy" className="hover:text-primary hover:underline">
            Privacy Notice
          </Link>
        </footer>
      </div>
    </div>
  );
}
