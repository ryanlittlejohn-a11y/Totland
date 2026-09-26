import { usePathTrace, type TracePoint } from "@/hooks/usePathTrace";
import { L } from "@/lib/i18n";

/**
 * Number Maze board: numbered stones on a winding dotted path. Drag through
 * them in order, or tap each number in order (buttons, keyboard, VoiceOver).
 */
export function NumberMazeScene({
  points,
  connected,
  wrongIndex,
  hintNext,
  done,
  revealEmoji,
  onStart,
  onEnter,
  onTap,
}: {
  points: TracePoint[];
  connected: number;
  wrongIndex: number | null;
  hintNext: boolean;
  done: boolean;
  revealEmoji: string;
  onStart: (index: number | null) => boolean;
  onEnter: (index: number) => boolean;
  onTap: (index: number) => void;
}) {
  const { boardRef, livePos, boardProps } = usePathTrace({
    points,
    radius: 12,
    enabled: !done,
    onStart,
    onEnter,
  });
  const line = (pts: TracePoint[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");
  const anchor = connected > 0 ? points[connected - 1] : null;

  return (
    <div
      ref={boardRef}
      {...boardProps}
      className={`maze-board relative mt-4 aspect-square w-full select-none overflow-hidden rounded-3xl wood-block ${done ? "is-done" : ""}`}
      style={{ touchAction: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
      data-maze-board
    >
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <polyline points={line(points)} className="maze-guide" fill="none" />
        {done && <polygon points={line(points)} className="maze-fill" />}
        {connected > 1 && <polyline points={line(points.slice(0, connected))} className="maze-trail" fill="none" />}
        {anchor && livePos && !done && (
          <line x1={anchor.x} y1={anchor.y} x2={livePos.x} y2={livePos.y} className="maze-live" />
        )}
      </svg>

      {done && (
        <span className="maze-reveal pointer-events-none absolute inset-0 grid place-items-center text-[9rem]" aria-hidden>
          {revealEmoji}
        </span>
      )}

      {points.map((p, i) => {
        const isConnected = i < connected;
        const isNext = i === connected && !done;
        const n = i + 1;
        const label = isConnected
          ? L(`Number ${n}, connected`, `Número ${n}, conectado`)
          : isNext
            ? L(`Number ${n}, next`, `Número ${n}, siguiente`)
            : L(`Number ${n}`, `Número ${n}`);
        return (
          <button
            key={i}
            type="button"
            data-maze-point={n}
            aria-label={label}
            disabled={done}
            onClick={() => onTap(i)}
            className={`maze-stone absolute grid place-items-center rounded-full font-ui text-3xl font-bold ${
              isConnected ? "is-connected" : ""
            } ${isNext ? "is-next" : ""} ${isNext && hintNext ? "is-hint" : ""} ${wrongIndex === i ? "is-wrong" : ""} ${done ? "is-done" : ""}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
