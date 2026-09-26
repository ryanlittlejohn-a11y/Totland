import { useCallback, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent } from "react";

/**
 * Generic "drag an item onto a target" primitive. Knows nothing about the
 * game on top: fishing hooks, monster food, rocket parts, jigsaw pieces.
 * Pointer events only, first pointer only, pointer capture, forgiving hit slop.
 */
export interface DragToTargetOptions {
  onDrop: (targetId: string | null, handleId?: string) => void;
  onHover?: (targetId: string | null) => void;
  disabled?: boolean;
  /** extra px around each target that still counts as a hit */
  hitSlop?: number;
  /** point used for hit-testing, given the handle's current rect (default: center) */
  getTipPoint?: (rect: DOMRect) => { x: number; y: number };
  /** optional filter: return false to make a target non-droppable (e.g. a filled slot) */
  isTargetEnabled?: (targetId: string, handleId?: string) => boolean;
}

type Point = { x: number; y: number };

export function useDragToTarget({ onDrop, onHover, disabled, hitSlop = 24, getTipPoint, isTargetEnabled }: DragToTargetOptions) {
  const targets = useRef(new Map<string, HTMLElement>());
  const rects = useRef(new Map<string, DOMRect>());
  const pointerId = useRef<number | null>(null);
  const start = useRef<Point>({ x: 0, y: 0 });
  const handleEl = useRef<HTMLElement | null>(null);
  const handleId = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeHandleId, setActiveHandleId] = useState<string | null>(null);

  const registerTarget = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) targets.current.set(id, el);
      else targets.current.delete(id);
    },
    [],
  );

  const hitTest = (p: Point): string | null => {
    let best: string | null = null;
    let bestD = Infinity;
    rects.current.forEach((r, id) => {
      if (isTargetEnabled && !isTargetEnabled(id, handleId.current ?? undefined)) return;
      if (p.x >= r.left - hitSlop && p.x <= r.right + hitSlop && p.y >= r.top - hitSlop && p.y <= r.bottom + hitSlop) {
        const d = Math.hypot(p.x - (r.left + r.width / 2), p.y - (r.top + r.height / 2));
        if (d < bestD) { bestD = d; best = id; }
      }
    });
    return best;
  };

  const tip = (): Point | null => {
    const el = handleEl.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return getTipPoint ? getTipPoint(r) : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  const setHover = (id: string | null) => {
    if (hoverRef.current === id) return;
    hoverRef.current = id;
    setHoverId(id);
    onHover?.(id);
  };

  const reset = useCallback(() => {
    pointerId.current = null;
    handleId.current = null;
    handleEl.current = null;
    setDragging(false);
    setActiveHandleId(null);
    setOffset({ x: 0, y: 0 });
    hoverRef.current = null;
    setHoverId(null);
  }, []);

  const end = (e: RPointerEvent<HTMLElement>, cancelled: boolean) => {
    if (pointerId.current !== e.pointerId) return;
    const t = tip();
    const hit = !cancelled && t ? hitTest(t) : null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    const droppedHandleId = handleId.current;
    pointerId.current = null;
    handleId.current = null;
    handleEl.current = null;
    setDragging(false);
    setActiveHandleId(null);
    setOffset({ x: 0, y: 0 });
    hoverRef.current = null;
    setHoverId(null);
    onDrop(hit, droppedHandleId ?? undefined);
  };

  const getHandleProps = (id?: string) => ({
    onPointerDown: (e: RPointerEvent<HTMLElement>) => {
      if (disabled || pointerId.current !== null || !e.isPrimary) return;
      e.preventDefault();
      pointerId.current = e.pointerId;
      handleId.current = id ?? null;
      handleEl.current = e.currentTarget;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      start.current = { x: e.clientX, y: e.clientY };
      rects.current = new Map([...targets.current].map(([id, el]) => [id, el.getBoundingClientRect()]));
      setDragging(true);
      setActiveHandleId(id ?? null);
    },
    onPointerMove: (e: RPointerEvent<HTMLElement>) => {
      if (pointerId.current !== e.pointerId) return;
      e.preventDefault();
      setOffset({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
      // measure after this frame's transform lands
      requestAnimationFrame(() => {
        if (pointerId.current === null) return;
        const t = tip();
        setHover(t ? hitTest(t) : null);
      });
    },
    onPointerUp: (e: RPointerEvent<HTMLElement>) => end(e, false),
    onPointerCancel: (e: RPointerEvent<HTMLElement>) => end(e, true),
    onLostPointerCapture: (e: RPointerEvent<HTMLElement>) => {
      if (pointerId.current === e.pointerId) end(e, false);
    },
    style: { touchAction: "none" as const },
  });

  const handleProps = getHandleProps();

  return { handleProps, getHandleProps, registerTarget, offset, dragging, hoverId, activeHandleId, reset };
}
