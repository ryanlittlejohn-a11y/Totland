import { useCallback, useRef, useState } from "react";

export type TracePoint = { x: number; y: number };

/**
 * Continuous single-finger path tracing over a board measured in 0-100 units.
 * Self-contained (does not share code with useDragToTarget): tracks one
 * pointer, ignores any additional pointers, and reports when the finger
 * enters a point's hit zone.
 *
 * - onStart(index | null): return true to begin a stroke from here.
 * - onEnter(index): called once each time the finger enters a zone; return
 *   false to end the stroke (the loose line snaps back).
 */
export function usePathTrace({
  points,
  radius,
  enabled = true,
  onStart,
  onEnter,
}: {
  points: TracePoint[];
  radius: number;
  enabled?: boolean;
  onStart: (index: number | null) => boolean;
  onEnter: (index: number) => boolean;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);
  const tracking = useRef(false);
  const zone = useRef<number | null>(null);
  const [livePos, setLivePos] = useState<TracePoint | null>(null);

  const toBoard = useCallback((clientX: number, clientY: number): TracePoint | null => {
    const el = boardRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  }, []);

  const hit = useCallback(
    (p: TracePoint) => {
      let best: number | null = null;
      let bestD = radius;
      points.forEach((pt, i) => {
        const d = Math.hypot(pt.x - p.x, pt.y - p.y);
        if (d <= bestD) { bestD = d; best = i; }
      });
      return best;
    },
    [points, radius],
  );

  const end = useCallback(() => {
    activeId.current = null;
    tracking.current = false;
    zone.current = null;
    setLivePos(null);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || activeId.current !== null) return; // multi-touch protection
    const p = toBoard(e.clientX, e.clientY);
    if (!p) return;
    activeId.current = e.pointerId;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    const i = hit(p);
    zone.current = i;
    tracking.current = onStart(i);
    setLivePos(tracking.current ? p : null);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activeId.current || !tracking.current) return;
    const p = toBoard(e.clientX, e.clientY);
    if (!p) return;
    const i = hit(p);
    if (i !== zone.current) {
      zone.current = i;
      if (i !== null && !onEnter(i)) {
        tracking.current = false;
        setLivePos(null);
        return;
      }
    }
    setLivePos(p);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== activeId.current) return;
    end();
  };

  return {
    boardRef,
    livePos,
    reset: end,
    boardProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onLostPointerCapture: onPointerUp,
    },
  };
}
