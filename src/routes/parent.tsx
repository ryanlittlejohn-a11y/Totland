import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { L } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent Area — Totland" },
      { name: "description", content: "Grown-ups only: progress, settings and Premium for your child's Totland learning games, behind a parental gate." },
      { property: "og:title", content: "Parent Area — Totland" },
      { property: "og:description", content: "A gated space for parents to track progress and manage settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParentLayout,
});

/**
 * Apple Kids (1.3): the check is held only in memory for this visit to the
 * parent area. Leaving to the child side unmounts this layout, so every new
 * entry asks again. Never persist it to storage.
 */
function ParentLayout() {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  // Re-render (and remount the open screen) the moment the language changes.
  const lang = useProfile().profile.language;

  useEffect(() => {
    try {
      sessionStorage.removeItem("totland.gate");
    } catch {
      // storage unavailable — nothing to clear
    }
    setA(3 + Math.floor(Math.random() * 6));
    setB(2 + Math.floor(Math.random() * 6));
  }, []);

  if (!open) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-4 py-10">
        <div className="rounded-[2rem] bg-night p-6 text-cream wood-block">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-cream/10">🔒</span>
            <h1 className="text-lg font-semibold text-cream">{L("Parental Area", "Zona para adultos")}</h1>
          </div>
          <p className="mt-3 text-sm leading-snug text-cream/70">
            {L(
              "For grown-ups. Answer the question below to open the dashboard, settings and subscription.",
              "Solo para adultos. Responde la pregunta para abrir el panel, los ajustes y la suscripción.",
            )}
          </p>
          <label htmlFor="gate" className="mt-5 block text-sm font-semibold text-cream">
            {L(`What is ${a} × ${b}?`, `¿Cuánto es ${a} × ${b}?`)}
          </label>
          <input
            id="gate"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2 w-full rounded-xl bg-cream/10 px-4 py-3 text-cream outline-none ring-1 ring-cream/15 focus:ring-cream/40"
            placeholder={L("Type the answer", "Escribe la respuesta")}
          />
          {error && <p className="mt-2 text-sm text-amber">{L("Not quite — please try again.", "No es correcto. Inténtalo de nuevo.")}</p>}
          <button
            type="button"
            onClick={() => {
              if (Number(value) === a * b) {
                setOpen(true);
              } else setError(true);
            }}
            className="mt-4 w-full rounded-xl bg-cream py-3 font-ui font-bold text-night"
          >
            {L("Open dashboard", "Abrir el panel")}
          </button>
          <Link to="/" className="mt-3 block text-center text-sm text-cream/60">
            {L("Back to play", "Volver a jugar")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] px-4 pb-12 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="font-ui text-2xl font-bold text-ink">{L("Parents", "Adultos")}</h1>
        <Link to="/" className="rounded-xl bg-card px-4 py-2 font-ui font-semibold wood-block">
          {L("Back to play", "Volver a jugar")}
        </Link>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {[
          { to: "/parent", label: L("Dashboard", "Panel"), exact: true },
          { to: "/parent/children", label: L("Children", "Peques") },
          { to: "/parent/subscription", label: L("Subscription", "Suscripción") },
          { to: "/contact", label: L("Contact", "Contacto") },

        ].map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.exact ?? false }}
            activeProps={{ className: "bg-night text-cream" }}
            inactiveProps={{ className: "bg-card text-ink" }}
            className="shrink-0 rounded-xl px-4 py-2 font-ui text-sm font-semibold"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-5">
        <Outlet key={lang} />
      </div>
      <footer className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 font-ui text-xs text-inksoft">
        <Link to="/guides/toddler-learning-games" className="underline">{L("Guide", "Guía")}</Link>
        <Link to="/terms" className="underline">{L("Terms of Use", "Condiciones de uso")}</Link>
        <Link to="/privacy" className="underline">{L("Privacy", "Privacidad")}</Link>
        <Link to="/refund" className="underline">{L("Refunds", "Reembolsos")}</Link>
        <Link to="/contact" className="underline">{L("Contact", "Contacto")}</Link>
      </footer>
    </main>
  );
}
