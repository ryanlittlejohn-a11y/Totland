import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { L } from "@/lib/i18n";

export function LegalPage({
  title,
  updated,
  spanishNote,
  children,
}: {
  title: string;
  updated: string;
  /** Show the Spanish "English version applies" note (Terms, Privacy, Refund). */
  spanishNote?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          &larr; {L("Back to Totland", "Volver a Totland")}
        </Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {updated}
        </p>
        {spanishNote && (
          <p lang="es" className="mt-4 rounded-xl bg-muted/50 p-4 text-sm text-foreground/80">
            <strong>En español:</strong> esta página solo está disponible en inglés. La versión en inglés es la que
            rige y se aplica. Si tienes dudas, escríbenos a Support@totland.app.
          </p>
        )}
        <div className="mt-8 space-y-8 text-foreground/90 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mt-2 [&_p]:leading-relaxed [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
        <footer className="mt-12 flex flex-wrap gap-6 border-t border-border pt-6 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-primary hover:underline">
            {L("Terms & Conditions", "Términos y condiciones")}
          </Link>
          <Link to="/refund" className="hover:text-primary hover:underline">
            {L("Refund Policy", "Política de reembolsos")}
          </Link>
          <Link to="/privacy" className="hover:text-primary hover:underline">
            {L("Privacy Notice", "Aviso de privacidad")}
          </Link>
          <Link to="/contact" className="hover:text-primary hover:underline">
            {L("Contact Us", "Contacto")}
          </Link>
        </footer>
      </div>
    </div>
  );
}
