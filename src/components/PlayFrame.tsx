import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function PlayFrame({
  title,
  progress,
  children,
}: {
  title: string;
  progress?: { done: number; total: number };
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-4 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back to the map"
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-card text-2xl wood-block"
        >
          🏠
        </Link>
        <div className="flex-1">
          <p className="font-ui text-[13px] font-semibold uppercase tracking-[0.14em] text-inksoft">Playing now</p>
          <h1 className="font-ui text-xl font-bold leading-tight text-ink">{title}</h1>
        </div>
        {progress && (
          <div className="flex gap-1.5" aria-label={`${progress.done} of ${progress.total} done`}>
            {Array.from({ length: progress.total }, (_, i) => (
              <span
                key={i}
                className={`size-3 rounded-full ${i < progress.done ? "bg-amber" : "bg-felt"}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}
