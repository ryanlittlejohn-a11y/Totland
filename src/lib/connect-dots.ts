import type { TracePoint } from "@/hooks/usePathTrace";

/**
 * Connect the Dots — pure rules + puzzle data (all original, hand-authored).
 * Board units are 0–100 on a square board. Dots are numbered 1..n in array
 * order; `closed` draws the last dot back to dot 1. The same data feeds the
 * in-app game and (later) printable sheets via `puzzleSvg`.
 */

export type DotsFill = "amber" | "moss" | "clay" | "sky" | "plum";
export type DotsPuzzle = {
  id: string;
  en: string;
  es: string;
  level: 1 | 2 | 3 | 4 | 5;
  closed: boolean;
  fill: DotsFill;
  points: TracePoint[];
};

/** Finger hit radius in board units — matches Line Tracing's level-1 tolerance (11). Nearest dot wins when zones touch. */
export const HIT_RADIUS = 11;
/** Minimum distance between any two dots (board units). */
export const MIN_SPACING = 11;
export const BOUNDS = { min: 4, max: 96 };
export const PUZZLES_PER_SESSION = 3;

const P = (...xy: number[]): TracePoint[] => {
  const out: TracePoint[] = [];
  for (let i = 0; i < xy.length; i += 2) out.push({ x: xy[i]!, y: xy[i + 1]! });
  return out;
};

export const PUZZLES: DotsPuzzle[] = [
  // Level 1 — 3 to 5 dots
  { id: "triangle", en: "a triangle", es: "un triángulo", level: 1, closed: true, fill: "amber", points: P(50, 18, 84, 78, 16, 78) },
  { id: "square", en: "a square", es: "un cuadrado", level: 1, closed: true, fill: "sky", points: P(22, 22, 78, 22, 78, 78, 22, 78) },
  { id: "house", en: "a house", es: "una casa", level: 1, closed: true, fill: "clay", points: P(50, 14, 82, 42, 82, 84, 18, 84, 18, 42) },
  { id: "diamond", en: "a diamond", es: "un rombo", level: 1, closed: true, fill: "plum", points: P(50, 12, 84, 50, 50, 88, 16, 50) },
  { id: "flag", en: "a flag", es: "una bandera", level: 1, closed: false, fill: "moss", points: P(24, 86, 24, 14, 78, 30, 24, 46) },
  { id: "mountains", en: "mountains", es: "montañas", level: 1, closed: true, fill: "moss", points: P(10, 80, 36, 30, 54, 58, 70, 36, 92, 80) },
  // Level 2 — 6 to 7 dots
  { id: "tent", en: "a tent", es: "una tienda", level: 2, closed: true, fill: "amber", points: P(50, 14, 88, 80, 62, 80, 50, 56, 38, 80, 12, 80) },
  { id: "arrow", en: "an arrow", es: "una flecha", level: 2, closed: true, fill: "sky", points: P(14, 40, 56, 40, 56, 20, 90, 50, 56, 80, 56, 60, 14, 60) },
  { id: "sailboat", en: "a sailboat", es: "un velero", level: 2, closed: true, fill: "clay", points: P(50, 12, 78, 50, 92, 58, 76, 84, 24, 84, 8, 58, 50, 58) },
  { id: "fish", en: "a fish", es: "un pez", level: 2, closed: true, fill: "sky", points: P(12, 28, 52, 26, 88, 50, 52, 74, 12, 72, 34, 50) },
  { id: "crown", en: "a crown", es: "una corona", level: 2, closed: true, fill: "amber", points: P(12, 80, 12, 30, 32, 52, 50, 22, 68, 52, 88, 30, 88, 80) },
  { id: "lightning", en: "a lightning bolt", es: "un rayo", level: 2, closed: true, fill: "amber", points: P(58, 8, 24, 54, 48, 54, 36, 92, 78, 40, 54, 40, 70, 8) },
  // Level 3 — 8 to 11 dots
  { id: "tree", en: "a tree", es: "un árbol", level: 3, closed: true, fill: "moss", points: P(50, 10, 78, 46, 62, 46, 84, 74, 56, 74, 56, 90, 44, 90, 44, 74, 16, 74, 38, 46, 22, 46) },
  { id: "star", en: "a star", es: "una estrella", level: 3, closed: true, fill: "amber", points: P(50, 12, 60, 38, 88, 40, 66, 57, 74, 84, 50, 69, 26, 84, 34, 57, 12, 40, 40, 38) },
  { id: "heart", en: "a heart", es: "un corazón", level: 3, closed: true, fill: "clay", points: P(50, 30, 62, 16, 80, 16, 90, 32, 84, 52, 50, 86, 16, 52, 10, 32, 20, 16, 38, 16) },
  { id: "rocket", en: "a rocket", es: "un cohete", level: 3, closed: true, fill: "sky", points: P(50, 8, 64, 26, 64, 64, 80, 84, 60, 78, 50, 90, 40, 78, 20, 84, 36, 64, 36, 26) },
  { id: "cat", en: "a cat", es: "un gato", level: 3, closed: true, fill: "plum", points: P(20, 14, 36, 32, 64, 32, 80, 14, 84, 48, 74, 76, 50, 86, 26, 76, 16, 48) },
  { id: "umbrella", en: "an umbrella", es: "un paraguas", level: 3, closed: true, fill: "plum", points: P(50, 12, 78, 22, 92, 46, 72, 42, 50, 48, 28, 42, 8, 46, 22, 22) },
  // Level 4 — 11 to 15 dots
  { id: "butterfly", en: "a butterfly", es: "una mariposa", level: 4, closed: true, fill: "plum", points: P(50, 30, 64, 14, 86, 12, 92, 30, 78, 48, 90, 68, 76, 86, 56, 72, 44, 72, 24, 86, 10, 68, 22, 48, 8, 30, 14, 12, 36, 14) },
  { id: "cottage", en: "a cottage", es: "una cabaña", level: 4, closed: true, fill: "clay", points: P(50, 10, 64, 22, 64, 8, 76, 8, 76, 32, 92, 46, 80, 44, 80, 88, 20, 88, 20, 44, 8, 46) },
  { id: "car", en: "a car", es: "un coche", level: 4, closed: true, fill: "sky", points: P(8, 72, 8, 54, 24, 50, 36, 30, 64, 30, 78, 50, 92, 54, 92, 72, 76, 72, 66, 82, 56, 72, 44, 72, 34, 82, 24, 72) },
  { id: "owl", en: "an owl", es: "un búho", level: 4, closed: true, fill: "amber", points: P(30, 10, 40, 24, 60, 24, 70, 10, 76, 36, 86, 56, 76, 82, 58, 92, 42, 92, 24, 82, 14, 56, 24, 36) },
  { id: "apple", en: "an apple", es: "una manzana", level: 4, closed: true, fill: "clay", points: P(50, 28, 52, 10, 64, 6, 64, 22, 80, 24, 92, 42, 88, 66, 72, 88, 50, 82, 28, 88, 12, 66, 8, 42, 20, 24, 36, 22) },
  { id: "spaceship", en: "a spaceship", es: "una nave espacial", level: 4, closed: true, fill: "moss", points: P(50, 4, 60, 14, 66, 30, 66, 58, 80, 70, 84, 90, 66, 82, 58, 92, 42, 92, 34, 82, 16, 90, 20, 70, 34, 58, 34, 30, 40, 14) },
  // Level 5 — 16 to 20 dots
  { id: "sun", en: "a sun", es: "un sol", level: 5, closed: true, fill: "amber", points: P(50, 8, 60, 26, 80, 20, 74, 40, 92, 50, 74, 60, 80, 80, 60, 74, 50, 92, 40, 74, 20, 80, 26, 60, 8, 50, 26, 40, 20, 20, 40, 26) },
  { id: "castle", en: "a castle", es: "un castillo", level: 5, closed: true, fill: "plum", points: P(8, 90, 8, 22, 20, 22, 20, 34, 32, 34, 32, 22, 44, 22, 44, 34, 56, 34, 56, 22, 68, 22, 68, 34, 80, 34, 80, 22, 92, 22, 92, 90, 62, 90, 62, 66, 38, 66, 38, 90) },
  { id: "dog", en: "a dog", es: "un perro", level: 5, closed: true, fill: "clay", points: P(18, 20, 32, 12, 44, 22, 56, 22, 68, 12, 82, 20, 88, 34, 88, 48, 78, 56, 76, 72, 64, 86, 50, 90, 36, 86, 24, 72, 22, 56, 12, 48, 12, 34) },
  { id: "flower", en: "a flower", es: "una flor", level: 5, closed: true, fill: "plum", points: P(50, 8, 58, 25, 75, 16, 71, 35, 90, 37, 76, 50, 90, 63, 71, 65, 75, 84, 58, 75, 50, 92, 42, 75, 25, 84, 29, 65, 10, 63, 24, 50, 10, 37, 29, 35, 25, 16, 42, 25) },
  { id: "cloud", en: "a cloud", es: "una nube", level: 5, closed: true, fill: "sky", points: P(6, 52, 15, 43, 18, 31, 32, 30, 42, 22, 56, 27, 72, 26, 78, 36, 91, 42, 85, 52, 91, 62, 78, 68, 72, 78, 56, 77, 42, 82, 32, 74, 18, 73, 15, 61) },
  { id: "bigfish", en: "a big fish", es: "un pez grande", level: 5, closed: true, fill: "moss", points: P(8, 26, 28, 44, 40, 26, 52, 10, 62, 22, 76, 26, 90, 40, 95, 52, 90, 64, 76, 76, 62, 82, 50, 94, 44, 78, 28, 58, 8, 76, 18, 52) },
];

export const puzzlesForLevel = (level: number) => PUZZLES.filter((p) => p.level === Math.min(5, Math.max(1, Math.round(level))));

/** Deal distinct puzzles for a session (frozen by the caller). */
export function dealPuzzles(level: number, rand = Math.random, count = PUZZLES_PER_SESSION): DotsPuzzle[] {
  const pool = [...puzzlesForLevel(level)];
  const out: DotsPuzzle[] = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]!);
  return out;
}

// ---- Rules ----------------------------------------------------------------

export type DotsState = { connected: number; finished: boolean };
export type DotsOutcome = "connect" | "complete" | "nudge" | "ignore";
export const startDots = (): DotsState => ({ connected: 0, finished: false });

/**
 * Touch dot `index` (0-based). Strictly numeric order, forward-only:
 * the next dot connects; a later dot is a gentle nudge (no progress lost);
 * already-connected dots are ignored. Completion is reported exactly once.
 */
export function touchDot(state: DotsState, index: number, total: number): { state: DotsState; outcome: DotsOutcome } {
  if (state.finished || index < 0 || index >= total) return { state, outcome: "ignore" };
  if (index === state.connected) {
    const connected = state.connected + 1;
    const finished = connected >= total;
    return { state: { connected, finished }, outcome: finished ? "complete" : "connect" };
  }
  if (index > state.connected) return { state, outcome: "nudge" };
  return { state, outcome: "ignore" };
}

/** Nearest dot within `radius` board units of `p`, or null. */
export function nearestDot(points: TracePoint[], p: TracePoint, radius = HIT_RADIUS): number | null {
  let best: number | null = null;
  let bestD = radius;
  points.forEach((q, i) => {
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d <= bestD) { bestD = d; best = i; }
  });
  return best;
}

// ---- Drawing helper (reused by printable sheets) ---------------------------

export type DotsSvg = {
  viewBox: string;
  /** full outline path through all dots in order (closes when puzzle.closed) */
  outline: string;
  /** path through only the first `connected` dots */
  partial: (connected: number) => string;
  dots: { n: number; x: number; y: number }[];
};

export function puzzleSvg(puzzle: DotsPuzzle): DotsSvg {
  const pts = puzzle.points;
  const d = (list: TracePoint[]) => list.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  return {
    viewBox: "0 0 100 100",
    outline: d(pts) + (puzzle.closed ? " Z" : ""),
    partial: (c) => {
      const n = Math.min(c, pts.length);
      if (n < 2) return "";
      return d(pts.slice(0, n)) + (puzzle.closed && n === pts.length ? " Z" : "");
    },
    dots: pts.map((p, i) => ({ n: i + 1, x: p.x, y: p.y })),
  };
}

/** Dot diameter (as % of board) — bigger for small puzzles, still no overlap at 20 dots. */
export const dotSizePct = (count: number) => (count <= 7 ? 15 : count <= 11 ? 12 : 10);
