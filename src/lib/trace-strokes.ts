/**
 * Stroke data for Trace Shapes and Trace Numbers (Trace Letters plug in here
 * later, once teachers pick a handwriting style).
 *
 * Convention: US school print — strokes go top to bottom, left to right, and
 * each character is an ordered list of strokes. Each stroke is a point path
 * on the shared 100 × 70 board (see line-trace.ts); the engine samples the
 * points evenly, so dense curves and sparse straight lines both work.
 * Digit 8 starts at the middle crossing; digit 9 starts on the right side of
 * the loop — a teacher can correct any entry here without engine changes.
 */
import { BOARD_H, BOARD_W, samplePath, type Pt } from "./line-trace";

export interface StrokeCharacter {
  id: string;
  /** Name used in spoken prompts; Spanish carries its article ("el círculo"). */
  label: { en: string; es: string };
  /** 1 = easiest; sessions deal an easier warm-up first, like Line Tracing. */
  level: 1 | 2 | 3;
  /** Draw top / middle / baseline guide lines behind the character. */
  guides: boolean;
  strokes: Pt[][];
}

const range = (n: number, f: (t: number) => Pt) => Array.from({ length: n + 1 }, (_, i) => f(i / n));
const poly = (...pts: [number, number][]) => pts.map(([x, y]) => ({ x, y }));
const arc = (cx: number, cy: number, r: number, from: number, to: number, ry = r) =>
  range(48, (t) => {
    const a = from + (to - from) * t;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * ry };
  });
/** Parametric heart, start at the top cleft, left lobe first. */
const heart = (cx: number, cy: number, s: number) =>
  range(96, (t) => {
    const a = t * Math.PI * 2;
    return {
      x: cx + s * 1.35 * 16 * Math.pow(Math.sin(a), 3) * 0.1,
      y: cy - s * 1.5 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 0.1,
    };
  });
/** Classic 5-point star drawn without lifting, starting at the top point. */
const star = (cx: number, cy: number, r: number) => {
  const pts = [0, 1, 2, 3, 4].map((k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  return [pts[0]!, pts[2]!, pts[4]!, pts[1]!, pts[3]!, pts[0]!];
};

/* ------------------------------- shapes ------------------------------- */

export const SHAPE_CHARACTERS: StrokeCharacter[] = [
  { id: "shape-circle", label: { en: "circle", es: "el círculo" }, level: 1, guides: false, strokes: [arc(50, 35, 21, -Math.PI / 2, Math.PI * 1.5)] },
  { id: "shape-square", label: { en: "square", es: "el cuadrado" }, level: 1, guides: false, strokes: [poly([33, 16], [67, 16], [67, 54], [33, 54], [33, 16])] },
  { id: "shape-triangle", label: { en: "triangle", es: "el triángulo" }, level: 1, guides: false, strokes: [poly([50, 13], [72, 55], [28, 55], [50, 13])] },
  { id: "shape-rectangle", label: { en: "rectangle", es: "el rectángulo" }, level: 2, guides: false, strokes: [poly([27, 22], [73, 22], [73, 48], [27, 48], [27, 22])] },
  { id: "shape-oval", label: { en: "oval", es: "el óvalo" }, level: 2, guides: false, strokes: [arc(50, 35, 26, -Math.PI / 2, Math.PI * 1.5, 17)] },
  { id: "shape-diamond", label: { en: "diamond", es: "el rombo" }, level: 2, guides: false, strokes: [poly([50, 12], [70, 35], [50, 58], [30, 35], [50, 12])] },
  { id: "shape-heart", label: { en: "heart", es: "el corazón" }, level: 3, guides: false, strokes: [heart(50, 36, 1)] },
  { id: "shape-star", label: { en: "star", es: "la estrella" }, level: 3, guides: false, strokes: [star(50, 35, 24)] },
];

/* ------------------------------- digits ------------------------------- */

/** Guide line heights for digits: top, middle, baseline. */
export const DIGIT_GUIDES = [14, 35, 56];

export const DIGIT_CHARACTERS: StrokeCharacter[] = [
  { id: "digit-0", label: { en: "zero", es: "el cero" }, level: 2, guides: true, strokes: [arc(50, 35, 15, -Math.PI / 2, Math.PI * 1.5, 21)] },
  { id: "digit-1", label: { en: "one", es: "el uno" }, level: 1, guides: true, strokes: [poly([50, 14], [50, 56])] },
  {
    id: "digit-2", label: { en: "two", es: "el dos" }, level: 2, guides: true,
    strokes: [[...arc(50, 25, 13, Math.PI, 0, 11), ...poly([63, 25], [37, 56], [64, 56])]],
  },
  {
    id: "digit-3", label: { en: "three", es: "el tres" }, level: 2, guides: true,
    strokes: [[...arc(50, 24, 13, -Math.PI * 0.55, Math.PI * 0.45, 10), ...arc(50, 45, 13, -Math.PI * 0.45, Math.PI * 0.6, 11)]],
  },
  {
    id: "digit-4", label: { en: "four", es: "el cuatro" }, level: 3, guides: true,
    strokes: [poly([58, 14], [36, 40], [65, 40]), poly([58, 14], [58, 56])],
  },
  {
    id: "digit-5", label: { en: "five", es: "el cinco" }, level: 3, guides: true,
    strokes: [
      [...poly([39, 14], [37, 32]), ...arc(49, 42, 13, -Math.PI * 0.75, Math.PI * 0.6, 13)],
      poly([39, 14], [63, 14]),
    ],
  },
  {
    id: "digit-6", label: { en: "six", es: "el seis" }, level: 3, guides: true,
    strokes: [[...arc(47, 36, 21, -Math.PI * 0.35, Math.PI * 0.72, 22), ...arc(48, 44, 12, Math.PI * 1.02, Math.PI * 3.02, 12)]],
  },
  { id: "digit-7", label: { en: "seven", es: "el siete" }, level: 1, guides: true, strokes: [poly([36, 14], [64, 14], [46, 56])] },
  {
    id: "digit-8", label: { en: "eight", es: "el ocho" }, level: 3, guides: true,
    strokes: [[...arc(50, 24.5, 11, Math.PI / 2, Math.PI / 2 + Math.PI * 2, 10.5), ...arc(50, 45.5, 12.5, Math.PI * 1.5, Math.PI * 3.5, 10.5)]],
  },
  {
    id: "digit-9", label: { en: "nine", es: "el nueve" }, level: 3, guides: true,
    strokes: [[...arc(50, 26, 12, 0, Math.PI * 2, 12), ...poly([62, 26], [57, 56])]],
  },
];

/** Evenly sampled strokes for a character (engine-ready). */
export const characterSamples = (c: StrokeCharacter): Pt[][] => c.strokes.map((s) => samplePath(s));

/**
 * Three characters for a session at this level: an easier warm-up first,
 * then two at the current level, all different (same rhythm as dealLines).
 */
export function dealCharacters(pool: StrokeCharacter[], level: number, rand: () => number = Math.random): StrokeCharacter[] {
  const lv = Math.max(1, Math.min(3, Math.ceil(level / 2)));
  const pick = (from: StrokeCharacter[]) => {
    const copy = [...from];
    return copy.splice(Math.floor(rand() * copy.length), 1)[0]!;
  };
  const warm = pool.filter((c) => c.level === Math.max(1, lv - 1));
  const main = pool.filter((c) => c.level === lv);
  const first = pick(warm);
  const rest = main.filter((c) => c.id !== first.id);
  const second = pick(rest);
  const third = pick(rest.filter((c) => c.id !== second.id));
  return [first, second, third];
}

/** Every stroke stays on the board with a small margin (used by tests). */
export function characterInBounds(c: StrokeCharacter): boolean {
  return c.strokes.every((stroke) =>
    stroke.every((p) => p.x >= 2 && p.x <= BOARD_W - 2 && p.y >= 2 && p.y <= BOARD_H - 2),
  );
}
