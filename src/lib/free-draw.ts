/**
 * Free Draw — pure drawing rules + on-device-only persistence.
 *
 * Privacy rules (kids' artwork):
 * - Drawings NEVER go into the child profile or the family sync.
 * - The last drawing per child is stored on this device only, under one
 *   storage key ("totland.freedraw.v1") holding a map of childId -> strokes.
 *   On the web that is localStorage; in the packaged app it is native
 *   storage (Capacitor Preferences) via storage.ts.
 * - A child's drawing is removed when the child is deleted (removeChild in
 *   profile.ts) and all drawings are removed when the account is deleted
 *   (parent.subscription.tsx).
 */
import { storageGet, storageRemove, storageSet } from "./storage";

export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawStroke {
  color: string;
  size: number;
  erase: boolean;
  points: DrawPoint[];
}

export interface DrawState {
  strokes: DrawStroke[];
  /** stroke being drawn right now (not yet committed) */
  current: DrawStroke | null;
  /** the one pointer allowed to draw; extra fingers/palms are ignored */
  pointerId: number | null;
}

/** Minimum distance (px) between recorded points — keeps fast fingers smooth without flooding. */
export const MIN_STEP = 1.5;
/** Caps so a long session can never grow storage without bound. */
export const MAX_STROKES = 400;
export const MAX_POINTS_PER_STROKE = 2000;
/** Clear needs a second deliberate tap within this window. */
export const CLEAR_CONFIRM_MS = 3000;

export const emptyDraw = (strokes: DrawStroke[] = []): DrawState => ({
  strokes,
  current: null,
  pointerId: null,
});

/** Start a stroke. A second pointer while one is drawing is ignored (single-pointer rule). */
export function beginStroke(
  state: DrawState,
  pointerId: number,
  point: DrawPoint,
  style: { color: string; size: number; erase: boolean },
): DrawState {
  if (state.pointerId !== null) return state;
  return { ...state, pointerId, current: { ...style, points: [point] } };
}

/** Extend the active stroke. Wrong pointer or a sub-MIN_STEP wiggle changes nothing. */
export function moveStroke(state: DrawState, pointerId: number, point: DrawPoint): DrawState {
  if (state.pointerId !== pointerId || !state.current) return state;
  const pts = state.current.points;
  const last = pts[pts.length - 1]!;
  if (Math.hypot(point.x - last.x, point.y - last.y) < MIN_STEP) return state;
  if (pts.length >= MAX_POINTS_PER_STROKE) return state;
  return { ...state, current: { ...state.current, points: [...pts, point] } };
}

/** Commit the active stroke. Any other pointer lifting changes nothing. */
export function endStroke(state: DrawState, pointerId: number): DrawState {
  if (state.pointerId !== pointerId || !state.current) return state;
  return {
    strokes: [...state.strokes, state.current].slice(-MAX_STROKES),
    current: null,
    pointerId: null,
  };
}

/** Multi-step undo: one committed stroke per call. */
export function undoStroke(state: DrawState): DrawState {
  if (state.current || state.strokes.length === 0) return state;
  return { ...state, strokes: state.strokes.slice(0, -1) };
}

/**
 * Clear confirm state machine: first tap arms, a second tap within
 * CLEAR_CONFIRM_MS clears; anything later re-arms instead of clearing.
 */
export function clearStep(
  armedSince: number | null,
  now: number,
): { armedSince: number | null; cleared: boolean } {
  if (armedSince !== null && now - armedSince <= CLEAR_CONFIRM_MS) {
    return { armedSince: null, cleared: true };
  }
  return { armedSince: now, cleared: false };
}

/** True when an armed clear has waited too long and must disarm. */
export function clearExpired(armedSince: number | null, now: number): boolean {
  return armedSince !== null && now - armedSince > CLEAR_CONFIRM_MS;
}

/** "I'm finished" fires exactly once; later calls are no-ops. */
export function tryFinish(alreadyFinished: boolean): { finished: true; fired: boolean } {
  return { finished: true, fired: !alreadyFinished };
}

/* -------------------------------------------------- on-device persistence */

export const FREE_DRAW_STORAGE_KEY = "totland.freedraw.v1";

type DrawingMap = Record<string, DrawStroke[]>;

function readMap(): DrawingMap {
  try {
    const raw = storageGet(FREE_DRAW_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as DrawingMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: DrawingMap) {
  if (Object.keys(map).length) storageSet(FREE_DRAW_STORAGE_KEY, JSON.stringify(map));
  else storageRemove(FREE_DRAW_STORAGE_KEY);
}

const round = (n: number) => Math.round(n * 10) / 10;

/** The child's saved drawing, or [] — device only, never synced. */
export function loadDrawing(childId: string): DrawStroke[] {
  const value = readMap()[childId];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (s): s is DrawStroke =>
      !!s && typeof s.color === "string" && typeof s.size === "number" && Array.isArray(s.points),
  );
}

/** Save the child's drawing on this device only (points rounded to keep it small). */
export function saveDrawing(childId: string, strokes: DrawStroke[]) {
  const map = readMap();
  map[childId] = strokes.slice(-MAX_STROKES).map((s) => ({
    ...s,
    points: s.points.slice(0, MAX_POINTS_PER_STROKE).map((p) => ({ x: round(p.x), y: round(p.y) })),
  }));
  writeMap(map);
}

/** Remove one child's drawing (child deleted). */
export function deleteDrawing(childId: string) {
  const map = readMap();
  if (!(childId in map)) return;
  delete map[childId];
  writeMap(map);
}

/** Remove every child's drawing (account deleted). */
export function clearAllDrawings() {
  storageRemove(FREE_DRAW_STORAGE_KEY);
}
