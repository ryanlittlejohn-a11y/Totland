import { useDragToTarget } from "@/hooks/useDragToTarget";
import { L } from "@/lib/i18n";
import { DragTarget } from "./DragTarget";

export interface PondLetter {
  id: string;
  label: string;
}

/** Fishing visuals on top of the generic drag primitive. */
export function FishingPond({
  letters,
  caughtId,
  bouncedId,
  disabled,
  onCatch,
}: {
  letters: PondLetter[];
  caughtId: string | null;
  bouncedId: string | null;
  disabled: boolean;
  onCatch: (id: string) => void;
}) {
  const drag = useDragToTarget({
    disabled,
    hitSlop: 20,
    // the hook's point is at the bottom of the handle
    getTipPoint: (r) => ({ x: r.left + r.width / 2, y: r.bottom - 8 }),
    onDrop: (id) => {
      if (id) onCatch(id);
    },
  });

  const lineLen = 56 + Math.max(0, drag.offset.y);

  return (
    <div className="fishing-pond relative mt-5 select-none overflow-hidden rounded-3xl" data-testid="fishing-pond">
      <span className="sr-only">{L("Tap a letter to catch it.", "Toca una letra para pescarla.")}</span>
      {/* rod + hook */}
      <div className="relative z-10 flex h-40 justify-center" aria-hidden>
        <div
          className="fishing-hook-wrap absolute top-0 flex flex-col items-center"
          style={{
            transform: `translate(${drag.offset.x}px, ${Math.max(0, drag.offset.y)}px)`,
            transition: drag.dragging ? "none" : "transform var(--fish-snap, 350ms) ease-out",
          }}
        >
          <div className="fishing-line" style={{ height: 56 }} />
          <div
            {...drag.handleProps}
            data-testid="fishing-hook"
            className={`fishing-hook grid size-20 cursor-grab place-items-center rounded-full ${drag.dragging ? "is-dragging" : ""}`}
          >
            <span className="text-5xl">🪝</span>
          </div>
        </div>
      </div>
      <span className="sr-only">{lineLen}</span>
      {/* water */}
      <div className="fishing-water relative -mt-8 flex flex-wrap items-end justify-center gap-4 px-4 pb-8 pt-10">
        {letters.map((l, i) => {
          const caught = caughtId === l.id;
          const bounced = bouncedId === l.id;
          return (
            <DragTarget
              key={l.id}
              register={drag.registerTarget(l.id)}
              onClick={() => !disabled && onCatch(l.id)}
              aria-label={L(`Letter ${l.label}`, `Letra ${l.label}`)}
              data-letter={l.id}
              className={`fishing-letter grid size-20 place-items-center rounded-full font-ui text-5xl font-bold text-ink ${
                caught ? "is-caught" : ""
              } ${bounced ? "anim-wiggle is-bounced" : ""} ${drag.hoverId === l.id ? "is-hover" : ""}`}
              style={{ animationDelay: `${i * 300}ms` }}
            >
              {l.label}
            </DragTarget>
          );
        })}
      </div>
    </div>
  );
}
