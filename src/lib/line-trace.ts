/**
 * Line Tracing (pre-writing strokes): pure rules, no DOM.
 * Board is 100 × 70 units. A path is a dense list of evenly spaced samples;
 * progress only moves forward along those samples, a little at a time.
 */
export type Pt = { x: number; y: number };
export type LineTheme = "dot" | "car" | "bee" | "fish" | "snail";

export interface LinePattern {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  theme: LineTheme;
  /** Spoken/visible pattern family (straight, curve, wave, zigzag, loop, spiral). */
  family: "straight" | "curve" | "wave" | "zigzag" | "loop" | "spiral";
  points: Pt[];
}

export const BOARD_W = 100;
export const BOARD_H = 70;
/** Spacing between samples, in board units. */
export const SAMPLE_STEP = 1.5;
/** How far ahead (in samples) the finger may reach in one move — stops jumping across loops. */
export const LOOKAHEAD = 6;

const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const range = (n: number, f: (t: number) => Pt) => Array.from({ length: n + 1 }, (_, i) => f(i / n));

const line = (a: Pt, b: Pt) => [a, b];
const poly = (...pts: [number, number][]) => pts.map(([x, y]) => ({ x, y }));
const arc = (cx: number, cy: number, r: number, from: number, to: number, ry = r) =>
  range(48, (t) => {
    const a = from + (to - from) * t;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * ry };
  });
const wave = (x0: number, x1: number, y: number, amp: number, cycles: number) =>
  range(80 * cycles, (t) => ({ x: x0 + (x1 - x0) * t, y: y - Math.sin(t * cycles * Math.PI * 2) * amp }));
const zigzag = (x0: number, x1: number, top: number, bottom: number, peaks: number) =>
  Array.from({ length: peaks * 2 + 1 }, (_, i) => ({ x: x0 + ((x1 - x0) * i) / (peaks * 2), y: i % 2 ? top : bottom }));
/** Cursive "eee" loops moving right (prolate cycloid). */
const loops = (x0: number, x1: number, y: number, r: number, count: number) =>
  range(70 * count, (t) => {
    const a = t * count * Math.PI * 2;
    const base = x0 + (x1 - x0 - 2 * r) * t;
    return { x: base + r - Math.cos(a) * r * -1 + 0, y: y - Math.sin(a) * r };
  }).map((p, i, all) => (i === 0 ? p : p)).map((p) => p) as Pt[];
const spiral = (cx: number, cy: number, r0: number, r1: number, turns: number) =>
  range(90 * turns, (t) => {
    const a = t * turns * Math.PI * 2;
    const r = r0 + (r1 - r0) * t;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.9 };
  });

/** 30 original stroke patterns, easiest first. */
export const LINE_PATTERNS: LinePattern[] = [
  // Level 1 — straight strokes
  { id: "across", level: 1, theme: "dot", family: "straight", points: line({ x: 12, y: 35 }, { x: 88, y: 35 }) },
  { id: "down", level: 1, theme: "dot", family: "straight", points: line({ x: 50, y: 8 }, { x: 50, y: 62 }) },
  { id: "slide-down", level: 1, theme: "dot", family: "straight", points: line({ x: 18, y: 12 }, { x: 82, y: 58 }) },
  { id: "slide-up", level: 1, theme: "dot", family: "straight", points: line({ x: 18, y: 58 }, { x: 82, y: 12 }) },
  { id: "car-straight", level: 1, theme: "car", family: "straight", points: line({ x: 10, y: 45 }, { x: 90, y: 45 }) },
  { id: "fish-straight", level: 1, theme: "fish", family: "straight", points: line({ x: 10, y: 30 }, { x: 90, y: 30 }) },
  // Level 2 — gentle curves
  { id: "rainbow", level: 2, theme: "dot", family: "curve", points: arc(50, 55, 36, Math.PI, Math.PI * 2, 40) },
  { id: "smile", level: 2, theme: "dot", family: "curve", points: arc(50, 18, 36, Math.PI, 0, 38) },
  { id: "c-curve", level: 2, theme: "dot", family: "curve", points: arc(55, 35, 24, -Math.PI / 4, -Math.PI * 1.75 + Math.PI * 2 - Math.PI * 2, 26) },
  { id: "hill-road", level: 2, theme: "car", family: "curve", points: arc(50, 62, 40, Math.PI, Math.PI * 2, 34) },
  { id: "gentle-wave", level: 2, theme: "fish", family: "wave", points: wave(10, 90, 35, 9, 1) },
  { id: "bee-swoop", level: 2, theme: "bee", family: "curve", points: arc(50, 10, 38, Math.PI * 0.95, Math.PI * 0.05, 44) },
  // Level 3 — waves and zigzags
  { id: "wave-2", level: 3, theme: "dot", family: "wave", points: wave(10, 90, 35, 13, 2) },
  { id: "zigzag-3", level: 3, theme: "dot", family: "zigzag", points: zigzag(12, 88, 15, 55, 3) },
  { id: "mountains", level: 3, theme: "car", family: "zigzag", points: zigzag(10, 90, 18, 52, 2) },
  { id: "stairs", level: 3, theme: "dot", family: "zigzag", points: poly([12, 58], [12, 45], [30, 45], [30, 32], [48, 32], [48, 19], [66, 19], [66, 8], [86, 8]) },
  { id: "wavy-road", level: 3, theme: "car", family: "wave", points: wave(10, 90, 38, 14, 2) },
  { id: "fish-wave", level: 3, theme: "fish", family: "wave", points: wave(10, 90, 35, 16, 2) },
  // Level 4 — tighter zigzags, circles and loops
  { id: "zigzag-5", level: 4, theme: "dot", family: "zigzag", points: zigzag(10, 90, 18, 52, 5) },
  { id: "circle", level: 4, theme: "dot", family: "loop", points: arc(50, 35, 24, -Math.PI / 2, Math.PI * 1.5 - 0.15, 26) },
  { id: "loops-2", level: 4, theme: "dot", family: "loop", points: loops(14, 86, 35, 13, 2) },
  { id: "loops-3", level: 4, theme: "dot", family: "loop", points: loops(10, 90, 35, 11, 3) },
  { id: "bee-loops", level: 4, theme: "bee", family: "loop", points: loops(10, 90, 32, 12, 3) },
  { id: "wave-3", level: 4, theme: "fish", family: "wave", points: wave(8, 92, 35, 13, 3) },
  // Level 5 — spirals and long mixed paths
  { id: "spiral-in", level: 5, theme: "dot", family: "spiral", points: spiral(50, 35, 28, 4, 2) },
  { id: "snail-shell", level: 5, theme: "snail", family: "spiral", points: spiral(50, 35, 3, 28, 2) },
  { id: "bee-spiral", level: 5, theme: "bee", family: "spiral", points: spiral(50, 35, 30, 6, 2.5) },
  { id: "loops-4", level: 5, theme: "dot", family: "loop", points: loops(8, 92, 35, 9, 4) },
  { id: "rollercoaster", level: 5, theme: "car", family: "wave", points: wave(8, 92, 38, 20, 3) },
  { id: "snail-zigzag", level: 5, theme: "snail", family: "zigzag", points: zigzag(8, 92, 14, 56, 6) },
];

/** Even samples along a polyline. */
export function samplePath(points: Pt[], step = SAMPLE_STEP): Pt[] {
  const out: Pt[] = [];
  if (!points.length) return out;
  out.push(points[0]!);
  let carry = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!, b = points[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    let d = step - carry;
    while (d <= len) {
      out.push(lerp(a, b, d / len));
      d += step;
    }
    carry = len - (d - step);
  }
  const last = points[points.length - 1]!;
  const tail = out[out.length - 1]!;
  if (Math.hypot(tail.x - last.x, tail.y - last.y) > 0.01) out.push(last);
  return out;
}

export const pathLength = (pts: Pt[]) =>
  pts.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - pts[i]!.x, p.y - pts[i]!.y), 0);

/** Generous finger tolerance (board units): widest for the youngest levels. */
export const toleranceFor = (level: number) => [11, 11, 10, 9, 8, 7][Math.max(0, Math.min(5, level))]!;

export interface LineTraceState {
  /** Index of the furthest sample reached along the path. */
  head: number;
  done: boolean;
}
export const startLine = (): LineTraceState => ({ head: 0, done: false });

/**
 * Move progress for a finger at `p`. Only samples a short way ahead of the
 * current head count, so drifting, scribbling or jumping to another part of
 * the path simply pauses progress. `completed` is true exactly once.
 */
export function traceStep(
  state: LineTraceState,
  samples: Pt[],
  p: Pt,
  tolerance: number,
): { state: LineTraceState; completed: boolean } {
  if (state.done || samples.length < 2) return { state, completed: false };
  let best = -1;
  const end = Math.min(samples.length - 1, state.head + LOOKAHEAD);
  for (let i = state.head; i <= end; i++) {
    const s = samples[i]!;
    if (Math.hypot(s.x - p.x, s.y - p.y) <= tolerance) best = i;
  }
  if (best <= state.head) return { state, completed: false };
  const done = best >= samples.length - 1;
  return { state: { head: best, done }, completed: done };
}

/** Small direction arrows along the path. */
export function arrowsAlong(samples: Pt[], every = 14): { x: number; y: number; angle: number }[] {
  const out: { x: number; y: number; angle: number }[] = [];
  for (let i = Math.floor(every * 0.7); i < samples.length - 4; i += every) {
    const a = samples[i]!, b = samples[Math.min(samples.length - 1, i + 2)]!;
    out.push({ x: a.x, y: a.y, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
  }
  return out;
}

/** Three patterns for a session at this level (current level, with an easier warm-up). */
export function dealLines(level: number, rand: () => number = Math.random): LinePattern[] {
  const lv = Math.max(1, Math.min(5, level));
  const pick = (pool: LinePattern[]) => {
    const copy = [...pool];
    return copy.splice(Math.floor(rand() * copy.length), 1)[0]!;
  };
  const warm = LINE_PATTERNS.filter((p) => p.level === Math.max(1, lv - 1));
  const main = LINE_PATTERNS.filter((p) => p.level === lv);
  const first = pick(warm);
  const rest = main.filter((p) => p.id !== first.id);
  const second = pick(rest);
  const third = pick(rest.filter((p) => p.id !== second.id));
  return [first, second, third];
}
