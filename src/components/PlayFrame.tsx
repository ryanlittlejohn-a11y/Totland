import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { L } from "@/lib/i18n";
import { clearPendingAdvance, runPendingAdvance, usePendingAdvance } from "@/lib/calm";

/** Matches the default viewport meta set in __root.tsx's head config. */
const DEFAULT_VIEWPORT = "width=device-width, initial-scale=1, viewport-fit=cover";
/** Tightened only while a game is on screen, so toddlers can't pinch/double-tap zoom mid-play. */
const GAME_VIEWPORT = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

/**
 * Shared wrapper for every playable screen (games, word finds, stories,
 * adventure) and a couple of browse/list screens that reuse the same shell.
 * Scopes "no accidental scroll/zoom/text-select" to actual gameplay only —
 * pass `scrollable` for a list/browse screen (e.g. the Word Finds picker)
 * so it keeps normal scrolling.
 */
export function PlayFrame({
  title,
  progress,
  scrollable = false,
  children,
}: {
  title: string;
  progress?: { done: number; total: number };
  /** Set true for browse/list screens (not actual gameplay) that reuse this shell. */
  scrollable?: boolean;
  children: ReactNode;
}) {
  // iOS/Android page-level pinch & double-tap zoom is governed by the
  // viewport meta tag, not CSS — tighten it only for the lifetime of this
  // screen, and always restore the default on unmount/navigation away.
  useEffect(() => {
    if (scrollable) return;
    const meta = document.querySelector('meta[name="viewport"]');
    const previous = meta?.getAttribute("content") ?? DEFAULT_VIEWPORT;
    meta?.setAttribute("content", GAME_VIEWPORT);
    return () => {
      meta?.setAttribute("content", previous);
    };
  }, [scrollable]);

  // A parked Calm-mode step never outlives its screen.
  useEffect(() => () => clearPendingAdvance(), []);

  return (
    <div
      className={`mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-4 pb-8 pt-4 ${
        scrollable ? "" : "touch-pan-y select-none overscroll-contain [-webkit-touch-callout:none]"
      }`}
    >
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label={L("Back to the map", "Volver al mapa")}
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-card text-2xl wood-block"
        >
          <span aria-hidden="true">🏠</span>
        </Link>
        <div className="flex-1">
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">{L("Playing now", "Jugando ahora")}</p>
          <h1 className="font-ui text-xl font-bold leading-tight text-ink">{title}</h1>
        </div>
        {progress && (
          <div className="flex gap-1.5" aria-label={L(`${progress.done} of ${progress.total} done`, `${progress.done} de ${progress.total} listos`)}>
            {Array.from({ length: progress.total }, (_, i) => (
              <span
                key={i}
                className={`size-3 rounded-full ${i < progress.done ? "bg-amber" : "bg-felt"}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-5 flex-1">
        {children}
        <CalmNextButton />
      </div>
    </div>
  );
}

/** Calm mode: games wait here instead of moving on by themselves. */
export function CalmNextButton() {
  const waiting = usePendingAdvance();
  if (!waiting) return null;
  return (
    <div className="pointer-events-none sticky bottom-0 z-40 mt-4 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={() => runPendingAdvance()}
        className="pointer-events-auto w-full max-w-[480px] rounded-2xl bg-moss py-5 font-ui text-2xl font-bold text-primary-foreground wood-block"
      >
        {L("Next", "Siguiente")} <span aria-hidden>▶</span>
      </button>
    </div>
  );
}
