import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";
import { apiOrigin, isNativeApp } from "@/lib/native";

/** Routes a grown-up must still reach without internet (if cached). */
const ALWAYS_ALLOWED = ["/terms", "/privacy", "/refund", "/parent"];

/**
 * Is the backend actually reachable? A device can be joined to Wi-Fi with no
 * internet behind it, and both `navigator.onLine` and the native network
 * plugin happily call that "connected". A short, cheap ping settles it.
 */
async function backendReachable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${apiOrigin()}/api/public/diag`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

function useOnlineStatus(active: boolean) {
  const [online, setOnline] = useState(true);
  const checking = useRef(false);

  const evaluate = useCallback(async () => {
    if (!active || checking.current) return;
    checking.current = true;
    try {
      if (isNativeApp()) {
        let connected = true;
        try {
          const { Network } = await import("@capacitor/network");
          connected = (await Network.getStatus()).connected;
        } catch {
          connected = navigator.onLine !== false;
        }
        // Connected to a network is not the same as having internet.
        setOnline(connected ? await backendReachable() : false);
        return;
      }
      setOnline(navigator.onLine !== false);
    } finally {
      checking.current = false;
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let remove: (() => void) | undefined;

    const run = () => {
      if (!cancelled) void evaluate();
    };

    run();
    window.addEventListener("online", run);
    window.addEventListener("offline", run);

    if (isNativeApp()) {
      void (async () => {
        try {
          const { Network } = await import("@capacitor/network");
          const handle = await Network.addListener("networkStatusChange", run);
          if (cancelled) void handle.remove();
          else remove = () => void handle.remove();
        } catch {
          /* fall back to the window events above */
        }
      })();
    }

    return () => {
      cancelled = true;
      window.removeEventListener("online", run);
      window.removeEventListener("offline", run);
      remove?.();
    };
  }, [active, evaluate]);

  return online;
}

/**
 * Offline play is part of Totland Premium. Free families get a warm
 * "needs internet" screen instead of a broken page.
 */
export function OfflineGate({ children }: { children: ReactNode }) {
  const { profile, hydrated } = useProfile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Premium families never need this check at all, so never run it for them.
  const exempt =
    !hydrated ||
    profile.premium ||
    ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const online = useOnlineStatus(!exempt);

  if (exempt || online) return <>{children}</>;

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
