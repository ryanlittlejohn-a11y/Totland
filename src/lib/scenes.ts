/**
 * Content generators for the place-pieces, pop and count-build scenes.
 * Pure data (no React) so the rules can be tested.
 */
import {
  CATEGORIES,
  COLORS,
  SHAPES,
  alphabet,
  bankWords,
  pick,
  shuffle,
  soundWords,
} from "./content";
import { L, noun } from "./i18n";

/** Something drawable: a letter/number, a picture, a colour or a shape. */
export interface Visual {
  label?: string;
  emoji?: string;
  swatch?: string;
  clip?: string;
  /** draw the picture at this fraction of normal size (size games) */
  scale?: number;
  /** draw a ribbon this fraction of full length (length games) */
  bar?: number;
}

/** Window into a whole picture, used by assembled puzzles. */
export interface Tile {
  whole: Visual;
  cols: number;
  rows: number;
  col: number;
  row: number;
}

export interface Piece {
  id: string;
  value: string;
  visual?: Visual;
  tile?: Tile;
  name: string;
}

export interface Slot {
  id: string;
  accepts: string;
  capacity: number;
  name: string;
  /** faint guide drawn in the empty slot (shape ghost, basket swatch…) */
  ghost?: Visual;
  /** draw the ghost as a dark silhouette (shadow-matching scenes) */
  shadow?: boolean;
  tile?: Tile;
}

export type PlaceScene = "baskets" | "assemble" | "house" | "pattern" | "train" | "sorter" | "shadow" | "sizes" | "ruler";

export interface PlaceSet {
  scene: PlaceScene;
  prompt: string;
  /** big item shown above the board (engine letter, whole picture…) */
  header?: Visual;
  /** already-given items before the slots (pattern row) */
  given?: Visual[];
  slots: Slot[];
  pieces: Piece[];
}

const colorName = (n: string) => noun(n);
const shapeName = (n: string) => noun(n);

/** Pieces whose value fits no slot are decoys. */
export const isDecoy = (set: PlaceSet, p: Piece) => !set.slots.some((s) => s.accepts === p.value);
/** Done when every non-decoy piece has a home. */
export const neededCount = (set: PlaceSet) => set.pieces.filter((p) => !isDecoy(set, p)).length;

/* ------------------------------------------------------------- sorting */

function sortColors(level: number, baskets: number): PlaceSet {
  const cols = shuffle(COLORS).slice(0, baskets);
  const per = level <= 2 ? 1 : 2;
  const pieces: Piece[] = [];
  cols.forEach((c, ci) => {
    for (let i = 0; i < per; i++) {
      pieces.push({
        id: `p${ci}-${i}`,
        value: c.name,
        visual: { emoji: c.emoji },
        name: colorName(c.name),
      });
    }
  });
  return {
    scene: "baskets",
    prompt: L(
      "Put each thing in the basket of its colour.",
      "Pon cada cosa en la cesta de su color.",
    ),
    slots: cols.map((c) => ({
      id: c.name,
      accepts: c.name,
      capacity: per,
      name: colorName(c.name),
      ghost: { swatch: c.swatch },
    })),
    pieces: shuffle(pieces),
  };
}

function sortShapes(level: number): PlaceSet {
  const shapes = shuffle(SHAPES).slice(0, level <= 2 ? 2 : 3);
  const per = level <= 1 ? 1 : 2;
  const pieces: Piece[] = [];
  shapes.forEach((s, si) => {
    for (let i = 0; i < per; i++)
      pieces.push({
        id: `p${si}-${i}`,
        value: s.name,
        visual: { clip: s.clip },
        name: shapeName(s.name),
      });
  });
  return {
    scene: "baskets",
    prompt: L("Put each shape in its matching box.", "Pon cada forma en su caja."),
    slots: shapes.map((s) => ({
      id: s.name,
      accepts: s.name,
      capacity: per,
      name: shapeName(s.name),
      ghost: { clip: s.clip },
    })),
    pieces: shuffle(pieces),
  };
}

function sortCategories(level: number): PlaceSet {
  const cats = shuffle(CATEGORIES).slice(0, 2);
  const per = level <= 2 ? 2 : 3;
  const pieces: Piece[] = [];
  cats.forEach((c) => {
    shuffle(c.items)
      .slice(0, per)
      .forEach((it, i) => {
        pieces.push({
          id: `${c.id}-${i}`,
          value: c.id,
          visual: { emoji: it.emoji },
          name: noun(it.label),
        });
      });
  });
  return {
    scene: "baskets",
    prompt: L(
      "Sort the toys: put each one in the right group.",
      "Ordena: pon cada cosa en su grupo.",
    ),
    slots: cats.map((c) => ({
      id: c.id,
      accepts: c.id,
      capacity: per,
      name: noun(c.title),
      ghost: { emoji: c.items[0]!.emoji },
    })),
    pieces: shuffle(pieces),
  };
}

/* ------------------------------------------------------------ assembling */

function tiles(whole: Visual, level: number, name: string): PlaceSet {
  const [cols, rows] = level <= 2 ? [2, 1] : [2, 2];
  const slots: Slot[] = [];
  const pieces: Piece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const v = `${col}-${row}`;
      const tile = { whole, cols, rows, col, row };
      slots.push({
        id: `s${v}`,
        accepts: v,
        capacity: 1,
        name: L(`space ${slots.length + 1}`, `hueco ${slots.length + 1}`),
        tile,
      });
      pieces.push({ id: `p${v}`, value: v, tile, name: L(`piece of ${name}`, `pieza de ${name}`) });
    }
  }
  return {
    scene: "assemble",
    prompt: L(`Put the pieces together to make ${name}.`, `Junta las piezas: ${name}.`),
    header: whole,
    slots,
    pieces: shuffle(pieces),
  };
}

function shapeHouse(level: number): PlaceSet {
  const builds = [
    { name: L("a house", "una casa"), parts: ["triangle", "square"] },
    { name: L("a flower", "una flor"), parts: ["circle", "heart", "star"] },
    { name: L("a kite", "una cometa"), parts: ["diamond", "triangle"] },
  ];
  const b = pick(builds);
  const parts = b.parts.map((n) => SHAPES.find((s) => s.name === n)!);
  const decoys = shuffle(SHAPES.filter((s) => !b.parts.includes(s.name))).slice(
    0,
    level <= 2 ? 1 : 2,
  );
  return {
    scene: "house",
    prompt: L(
      `Build ${b.name}: put each shape where it fits.`,
      `Construye ${b.name}: pon cada forma donde encaja.`,
    ),
    slots: parts.map((s, i) => ({
      id: `s${i}`,
      accepts: s.name,
      capacity: 1,
      name: shapeName(s.name),
      ghost: { clip: s.clip },
    })),
    pieces: shuffle([
      ...parts.map((s, i) => ({
        id: `p${i}`,
        value: s.name,
        visual: { clip: s.clip },
        name: shapeName(s.name),
      })),
      ...decoys.map((s, i) => ({
        id: `d${i}`,
        value: `x-${s.name}`,
        visual: { clip: s.clip },
        name: shapeName(s.name),
      })),
    ]),
  };
}

function patternRow(level: number): PlaceSet {
  const unit = shuffle(SHAPES).slice(0, level >= 4 ? 3 : 2);
  const length = unit.length * 2 + (level >= 4 ? 0 : 2);
  const row = Array.from({ length }, (_, i) => unit[i % unit.length]!);
  const missing = level <= 2 ? 2 : 3;
  const given = row.slice(0, length - missing);
  const gaps = row.slice(length - missing);
  const decoy = pick(SHAPES.filter((s) => !unit.includes(s)));
  return {
    scene: "pattern",
    prompt: L(
      "Finish the pattern: drag the shapes into the empty spaces.",
      "Termina el patrón: arrastra las formas a los huecos.",
    ),
    given: given.map((s) => ({ clip: s.clip, label: shapeName(s.name) })),
    slots: gaps.map((s, i) => ({
      id: `s${i}`,
      accepts: `${i}:${s.name}`,
      capacity: 1,
      name: L(`space ${i + 1}`, `hueco ${i + 1}`),
    })),
    // Each gap only takes the shape the pattern needs there.
    pieces: shuffle([
      ...gaps.map((s, i) => ({
        id: `p${i}`,
        value: `${i}:${s.name}`,
        visual: { clip: s.clip },
        name: shapeName(s.name),
      })),
      {
        id: "d0",
        value: `x-${decoy.name}`,
        visual: { clip: decoy.clip },
        name: shapeName(decoy.name),
      },
    ]),
  };
}

/* ----------------------------------------------------------------- trains */

function soundTrain(level: number): PlaceSet {
  const target = pick(soundWords());
  const matches = shuffle(
    bankWords().filter((w) => w.letter === target.letter && w.word !== target.word),
  );
  const cars = Math.min(level <= 2 ? 1 : 2, matches.length) + 1;
  const loads = [target, ...matches].slice(0, cars);
  const others = shuffle(bankWords().filter((w) => w.letter !== target.letter)).slice(
    0,
    level <= 2 ? 2 : 3,
  );
  return {
    scene: "train",
    prompt: L(
      `Load the train with pictures that start with ${target.letter}.`,
      `Carga el tren con dibujos que empiezan por ${target.letter}.`,
    ),
    header: { label: target.letter },
    slots: loads.map((_, i) => ({
      id: `c${i}`,
      accepts: target.letter,
      capacity: 1,
      name: L(`carriage ${i + 1}`, `vagón ${i + 1}`),
    })),
    pieces: shuffle([
      ...loads.map((w, i) => ({
        id: `m${i}`,
        value: w.letter,
        visual: { emoji: w.emoji },
        name: w.word,
      })),
      ...others.map((w, i) => ({
        id: `o${i}`,
        value: w.letter,
        visual: { emoji: w.emoji },
        name: w.word,
      })),
    ]),
  };
}

/* ------------------------------------------------ sorter box and shadows */

/** Toy shape-sorter: each hole only takes its own shape. */
function shapeSorter(level: number): PlaceSet {
  const holes = shuffle(SHAPES).slice(0, level <= 1 ? 2 : level <= 3 ? 3 : 4);
  const decoys = level >= 3 ? shuffle(SHAPES.filter((s) => !holes.includes(s))).slice(0, 1) : [];
  return {
    scene: "sorter",
    prompt: L(
      "Drop each shape into its hole in the box.",
      "Mete cada forma en su agujero de la caja.",
    ),
    slots: holes.map((s) => ({
      id: s.name,
      accepts: s.name,
      capacity: 1,
      name: L(`${s.name} hole`, `agujero de ${shapeName(s.name)}`),
      ghost: { clip: s.clip },
      shadow: true,
    })),
    pieces: shuffle([
      ...holes.map((s) => ({ id: `p-${s.name}`, value: s.name, visual: { clip: s.clip }, name: shapeName(s.name) })),
      ...decoys.map((s) => ({ id: `d-${s.name}`, value: `x-${s.name}`, visual: { clip: s.clip }, name: shapeName(s.name) })),
    ]),
  };
}

function shadowMatch(items: { key: string; visual: Visual; name: string }[], level: number, prompt: string): PlaceSet {
  const chosen = shuffle(items).slice(0, level <= 1 ? 2 : level <= 3 ? 3 : 4);
  return {
    scene: "shadow",
    prompt,
    slots: shuffle(chosen).map((it) => ({
      id: it.key,
      accepts: it.key,
      capacity: 1,
      name: L(`shadow of ${it.name}`, `sombra de ${it.name}`),
      ghost: it.visual,
      shadow: true,
    })),
    pieces: shuffle(chosen.map((it) => ({ id: `p-${it.key}`, value: it.key, visual: it.visual, name: it.name }))),
  };
}

const shadowShapes = (level: number) =>
  shadowMatch(
    SHAPES.map((s) => ({ key: s.name, visual: { clip: s.clip }, name: shapeName(s.name) })),
    level,
    L("Drag each shape onto its shadow.", "Arrastra cada forma a su sombra."),
  );

const shadowObjects = (level: number) => {
  const seen = new Set<string>();
  const items = CATEGORIES.flatMap((c) => c.items)
    .filter((it) => !seen.has(it.label) && seen.add(it.label))
    .map((it) => ({ key: it.label, visual: { emoji: it.emoji }, name: noun(it.label) }));
  return shadowMatch(items, level, L("Drag each picture onto its shadow.", "Arrastra cada dibujo a su sombra."));
};

/* ------------------------------------------------- size boxes and ribbons */

const SIZE_THINGS = [
  { en: "apple", es: "manzana", f: true, emoji: "🍎" },
  { en: "bear", es: "oso", f: false, emoji: "🐻" },
  { en: "ball", es: "pelota", f: true, emoji: "⚽" },
  { en: "car", es: "coche", f: false, emoji: "🚗" },
  { en: "fish", es: "pez", f: false, emoji: "🐟" },
  { en: "star", es: "estrella", f: true, emoji: "⭐" },
  { en: "duck", es: "pato", f: false, emoji: "🦆" },
  { en: "flower", es: "flor", f: true, emoji: "🌸" },
];

/** Same thing drawn big and small: drop each into the box of its size. */
function sizeBoxes(level: number): PlaceSet {
  const things = shuffle(SIZE_THINGS).slice(0, level <= 1 ? 1 : level <= 3 ? 2 : 3);
  const pieces: Piece[] = things.flatMap((t) => [
    { id: `b-${t.en}`, value: "big", visual: { emoji: t.emoji, scale: 1 }, name: L(`big ${t.en}`, `${t.es} grande`) },
    {
      id: `s-${t.en}`,
      value: "small",
      visual: { emoji: t.emoji, scale: 0.45 },
      name: L(`small ${t.en}`, `${t.es} ${t.f ? "pequeña" : "pequeño"}`),
    },
  ]);
  return {
    scene: "sizes",
    prompt: L(
      "Put the big things in the big box and the small things in the small box.",
      "Pon las cosas grandes en la caja grande y las pequeñas en la caja pequeña.",
    ),
    slots: [
      { id: "big", accepts: "big", capacity: things.length, name: L("big box", "caja grande") },
      { id: "small", accepts: "small", capacity: things.length, name: L("small box", "caja pequeña") },
    ],
    pieces: shuffle(pieces),
  };
}

/** Ribbons of different lengths: line them up shortest to longest. */
function lengthOrder(level: number): PlaceSet {
  const n = level <= 1 ? 2 : level <= 3 ? 3 : 4;
  const cols = shuffle(COLORS).slice(0, n);
  const lens = Array.from({ length: n }, (_, i) => 0.3 + (0.7 * i) / Math.max(1, n - 1));
  return {
    scene: "ruler",
    prompt: L(
      "Line up the ribbons from shortest to longest.",
      "Ordena las cintas de la más corta a la más larga.",
    ),
    slots: lens.map((_, i) => ({
      id: `r${i}`,
      accepts: `r${i}`,
      capacity: 1,
      name:
        i === 0
          ? L("shortest place", "sitio más corto")
          : i === n - 1
            ? L("longest place", "sitio más largo")
            : L(`place ${i + 1}`, `sitio ${i + 1}`),
    })),
    pieces: shuffle(
      lens.map((len, i) => ({
        id: `p${i}`,
        value: `r${i}`,
        visual: { bar: len, swatch: cols[i]!.swatch },
        name: L(`${cols[i]!.name} ribbon`, `cinta ${colorName(cols[i]!.name)}`),
      })),
    ),
  };
}

export function placeSet(kind: string, level: number): PlaceSet {
  switch (kind) {
    case "sizeBoxes":
      return sizeBoxes(level);
    case "lengthOrder":
      return lengthOrder(level);
    case "shapeSorter":
      return shapeSorter(level);
    case "shadowShape":
      return shadowShapes(level);
    case "shadowObject":
      return shadowObjects(level);
    case "sortColor":
      return sortColors(level, 2);
    case "sortColor3":
      return sortColors(level, 3);
    case "sortShape":
      return sortShapes(level);
    case "sortRule":
      return sortCategories(level);
    case "assembleLetter": {
      const l = pick(alphabet());
      return tiles({ label: l }, level, L(`the letter ${l}`, `la letra ${l}`));
    }
    case "assembleNumber": {
      const n = String(1 + Math.floor(Math.random() * (level <= 2 ? 9 : 20)));
      return tiles({ label: n }, level, L(`the number ${n}`, `el número ${n}`));
    }
    case "assembleShape": {
      const s = pick(SHAPES);
      return tiles({ clip: s.clip }, level, L(`a ${s.name}`, shapeName(s.name)));
    }
    case "assemblePicture": {
      const w = pick(bankWords());
      return tiles({ emoji: w.emoji }, level, w.word);
    }
    case "shapeBuild":
      return shapeHouse(level);
    case "patternBuild":
      return patternRow(level);
    default:
      return soundTrain(level);
  }
}

/** Can this piece go into this slot (ignoring capacity)? */
export const fits = (slot: Slot, piece: Piece) => slot.accepts === piece.value;

/* -------------------------------------------------------- count-and-build */

export interface CountSet {
  target: number;
  max: number;
}

export function countSet(level: number): CountSet {
  const max = level <= 1 ? 5 : level <= 3 ? 8 : 10;
  return { target: 1 + Math.floor(Math.random() * max), max };
}

/* --------------------------------------------------------------- painting */

export interface PaintRegion {
  id: string;
  clip: string;
  color: string;
  swatch: string;
}

export interface PaintSet {
  regions: PaintRegion[];
  pots: { name: string; swatch: string }[];
}

/** Picture of shapes, each faintly tinted with the colour it should be. */
export function paintPicture(level: number): PaintSet {
  const n = level <= 1 ? 2 : level <= 3 ? 3 : 4;
  const shapes = shuffle(SHAPES).slice(0, n);
  const cols = shuffle(COLORS);
  const regions = shapes.map((sh, i) => ({ id: sh.name, clip: sh.clip, color: cols[i]!.name, swatch: cols[i]!.swatch }));
  const decoys = level >= 3 ? cols.slice(n, n + 1) : [];
  return {
    regions,
    pots: shuffle([...cols.slice(0, n), ...decoys]).map((c) => ({ name: c.name, swatch: c.swatch })),
  };
}

export interface BrushSet {
  target: string;
  swatch: string;
  pots: { name: string; swatch: string }[];
}

/** One stroke: dip the brush in the pot that matches the colour dab. */
export function dipBrush(level: number): BrushSet {
  const cols = shuffle(COLORS).slice(0, level <= 1 ? 2 : level <= 3 ? 3 : 4);
  const t = pick(cols);
  return { target: t.name, swatch: t.swatch, pots: cols.map((c) => ({ name: c.name, swatch: c.swatch })) };
}

/* --------------------------------------------------------- tap-to-count */

export interface TapCountSet {
  emoji: string;
  count: number;
  options: number[];
}

export function tapCountSet(level: number): TapCountSet {
  const max = level <= 1 ? 5 : level <= 3 ? 8 : 10;
  const count = 1 + Math.floor(Math.random() * max);
  const k = level <= 1 ? 2 : level <= 3 ? 3 : 4;
  const others = shuffle(
    Array.from({ length: Math.max(max, k + 1) }, (_, i) => i + 1).filter((n) => n !== count),
  ).slice(0, k - 1);
  return {
    emoji: pick(["🐑", "🐤", "🐸", "🐞", "🐰", "🐢"]),
    count,
    options: shuffle([count, ...others]),
  };
}
