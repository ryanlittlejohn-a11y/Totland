import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/parent")({
  component: ParentLayout,
});

const GATE_KEY = "totland.gate";

function ParentLayout() {
  const [open, setOpen] = useState(false);
  const [a, setA] = useState(4);
  const [b, setB] = useState(3);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setA(3 + Math.floor(Math.random() * 6));
    setB(2 + Math.floor(Math.random() * 6));
    setOpen(sessionStorage.getItem(GATE_KEY) === "1");
  }, []);

  if (!open) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-4 py-10">
        <div className="rounded-[2rem] bg-night p-6 text-cream wood-block">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-cream/10">🔒</span>
            <h1 className="text-lg font-semibold text-cream">Parental Area</h1>
          </div>
          <p className="mt-3 text-sm leading-snug text-cream/70">
            For grown-ups. Answer the question below to open the dashboard, settings and subscription.
          </p>
          <label htmlFor="gate" className="mt-5 block text-sm font-semibold text-cream">
            What is {a} × {b}?
          </label>
          <input
            id="gate"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2 w-full rounded-xl bg-cream/10 px-4 py-3 text-cream outline-none ring-1 ring-cream/15 focus:ring-cream/40"
            placeholder="Type the answer"
          />
          {error && <p className="mt-2 text-sm text-amber">Not quite — please try again.</p>}
          <button
            type="button"
            onClick={() => {
              if (Number(value) === a * b) {
                sessionStorage.setItem(GATE_KEY, "1");
                setOpen(true);
              } else setError(true);
            }}
            className="mt-4 w-full rounded-xl bg-cream py-3 font-ui font-bold text-night"
          >
            Open dashboard
          </button>
          <Link to="/" className="mt-3 block text-center text-sm text-cream/60">
            Back to play
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[560px] px-4 pb-12 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="font-ui text-2xl font-bold text-ink">Parents</h1>
        <Link to="/" className="rounded-xl bg-card px-4 py-2 font-ui font-semibold wood-block">
          Back to play
        </Link>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {[
          { to: "/parent", label: "Dashboard", exact: true },
          { to: "/parent/subscription", label: "Subscription" },
          { to: "/parent/rights", label: "Content rights" },
          { to: "/parent/cms", label: "Content studio" },
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
        <Outlet />
      </div>
    </main>
  );
}
