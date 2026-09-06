import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";

/** Routes a grown-up must still reach without internet (if cached). */
const ALWAYS_ALLOWED = ["/terms", "/privacy", "/refund", "/parent"];

function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}

/**
 * Offline play is part of Totland Premium. Free families get a warm
 * "needs internet" screen instead of a broken page.
 */
export function OfflineGate({ children }: { children: ReactNode }) {
  const online = useOnlineStatus();
  const { profile, hydrated } = useProfile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const allowed =
    online ||
    !hydrated ||
    profile.premium ||
    ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (allowed) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm rounded-[2rem] bg-card p-6 text-center wood-block">
        <p className="text-6xl" aria-hidden="true">
          🦊
        </p>
        <h1 className="mt-3 font-ui text-xl font-bold text-ink">
          {L("Totland needs internet to play right now", "Totland necesita internet para jugar ahora")}
        </h1>
        <p className="mt-2 font-ui text-sm text-inksoft">
          {L(
            "Connect to Wi‑Fi and tap Try again — all your stars and stickers are safe.",
            "Conéctate al Wi‑Fi y toca Intentar de nuevo — tus estrellas y calcomanías están a salvo.",
          )}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 w-full rounded-2xl bg-clay py-3 font-ui font-bold text-primary-foreground wood-block"
        >
          {L("Try again", "Intentar de nuevo")}
        </button>
        <p className="mt-4 font-ui text-xs text-inksoft">
          {L(
            "Grown-ups: Totland Premium adds playing with no internet, anywhere.",
            "Adultos: Totland Premium permite jugar sin internet, en cualquier lugar.",
          )}{" "}
          <Link to="/parent/subscription" search={{ checkout: undefined }} className="underline">
            {L("See Premium", "Ver Premium")}
          </Link>
        </p>
      </div>
    </main>
  );
}
