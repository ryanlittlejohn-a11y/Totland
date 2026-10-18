/**
 * Content generators for the place-pieces, pop and count-build scenes.
 * Pure data (no React) so the rules can be tested.
 */
import { CATEGORIES, COLORS, SHAPES, alphabet, bankWords, pick, shuffle, soundWords } from "./content";
import { L, noun, sentence } from "./i18n";

/** Something drawable: a letter/number, a picture, a colour or a shape. */
export interface Visual {
  label?: string;
  emoji?: string;
  swatch?: string;
  clip?: string;
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
  tile?: Tile;
}

export type PlaceScene = "baskets" | "assemble" | "house" | "pattern" | "train";

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
      pieces.push({ id: `p${ci}-${i}`, value: c.name, visual: { emoji: c.emoji, swatch: i ? c.swatch : undefined }, name: colorName(c.name) });
    }
  });
  return {
    scene: "baskets",
    prompt: L("Put each thing in the basket of its colour.", "Pon cada cosa en la cesta de su color."),
    slots: cols.map((c) => ({ id: c.name, accepts: c.name, capacity: per, name: colorName(c.name), ghost: { swatch: c.swatch } })),
    pieces: shuffle(pieces).map((p) => (p.visual?.swatch ? { ...p, visual: { emoji: p.visual.emoji } } : p)),
  };
}

function sortShapes(level: number): PlaceSet {
  const shapes = shuffle(SHAPES).slice(0, level <= 2 ? 2 : 3);
  const per = level <= 1 ? 1 : 2;
  const pieces: Piece[] = [];
  shapes.forEach((s, si) => {
    for (let i = 0; i < per; i++) pieces.push({ id: `p${si}-${i}`, value: s.name, visual: { clip: s.clip }, name: shapeName(s.name) });
  });
  return {
    scene: "baskets",
    prompt: L("Put each shape in its matching box.", "Pon cada forma en su caja."),
    slots: shapes.map((s) => ({ id: s.name, accepts: s.name, capacity: per, name: shapeName(s.name), ghost: { clip: s.clip } })),
    pieces: shuffle(pieces),
  };
}

function sortCategories(level: number): PlaceSet {
  const cats = shuffle(CATEGORIES).slice(0, 2);
  const per = level <= 2 ? 2 : 3;
  const pieces: Piece[] = [];
  cats.forEach((c) => {
    shuffle(c.items).slice(0, per).forEach((it, i) => {
      pieces.push({ id: `${c.id}-${i}`, value: c.id, visual: { emoji: it.emoji }, name: sentence(it.label) });
    });
  });
  return {
    scene: "baskets",
    prompt: L("Sort the toys: put each one in the right group.", "Ordena: pon cada cosa en su grupo."),
    slots: cats.map((c) => ({ id: c.id, accepts: c.id, capacity: per, name: sentence(c.title), ghost: { emoji: c.items[0]!.emoji } })),
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
      slots.push({ id: `s${v}`, accepts: v, capacity: 1, name: L(`space ${slots.length + 1}`, `hueco ${slots.length + 1}`), tile });
      pieces.push({ id: `p${v}`, value: v, tile, name: L(`piece of ${name}`, `pieza de ${name}`) });
    }
  }
  return {
    scene: "assemble",
    prompt: L(`Put the pieces together to make ${name}.`, `Junta las piezas para formar ${name}.`),
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
  const decoys = shuffle(SHAPES.filter((s) => !b.parts.includes(s.name))).slice(0, level <= 2 ? 1 : 2);
  return {
    scene: "house",
    prompt: L(`Build ${b.name}: put each shape where it fits.`, `Construye ${b.name}: pon cada forma donde encaja.`),
    slots: parts.map((s, i) => ({ id: `s${i}`, accepts: s.name, capacity: 1, name: shapeName(s.name), ghost: { clip: s.clip } })),
    pieces: shuffle([
      ...parts.map((s, i) => ({ id: `p${i}`, value: s.name, visual: { clip: s.clip }, name: shapeName(s.name) })),
      ...decoys.map((s, i) => ({ id: `d${i}`, value: `x-${s.name}`, visual: { clip: s.clip }, name: shapeName(s.name) })),
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
    prompt: L("Finish the pattern: drag the shapes into the empty spaces.", "Termina el patrón: arrastra las formas a los huecos."),
    given: given.map((s) => ({ clip: s.clip, label: shapeName(s.name) })),
    slots: gaps.map((s, i) => ({ id: `s${i}`, accepts: `${i}:${s.name}`, capacity: 1, name: L(`space ${i + 1}`, `hueco ${i + 1}`) })),
    // Each gap only takes the shape the pattern needs there.
    pieces: shuffle([
      ...gaps.map((s, i) => ({ id: `p${i}`, value: `${i}:${s.name}`, visual: { clip: s.clip }, name: shapeName(s.name) })),
      { id: "d0", value: `x-${decoy.name}`, visual: { clip: decoy.clip }, name: shapeName(decoy.name) },
    ]),
  };
}

/* ----------------------------------------------------------------- trains */

function soundTrain(level: number): PlaceSet {
  const target = pick(soundWords());
  const matches = shuffle(bankWords().filter((w) => w.letter === target.letter && w.word !== target.word));
  const cars = Math.min(level <= 2 ? 1 : 2, matches.length) + 1;
  const loads = [target, ...matches].slice(0, cars);
  const others = shuffle(bankWords().filter((w) => w.letter !== target.letter)).slice(0, level <= 2 ? 2 : 3);
  return {
    scene: "train",
    prompt: L(`Load the train with pictures that start with ${target.letter}.`, `Carga el tren con dibujos que empiezan por ${target.letter}.`),
    header: { label: target.letter },
    slots: loads.map((_, i) => ({ id: `c${i}`, accepts: target.letter, capacity: 1, name: L(`carriage ${i + 1}`, `vagón ${i + 1}`) })),
    pieces: shuffle([
      ...loads.map((w, i) => ({ id: `m${i}`, value: w.letter, visual: { emoji: w.emoji }, name: w.word })),
      ...others.map((w, i) => ({ id: `o${i}`, value: w.letter, visual: { emoji: w.emoji }, name: w.word })),
    ]),
  };
}

export function placeSet(kind: string, level: number): PlaceSet {
  switch (kind) {
    case "sortColor": return sortColors(level, 2);
    case "sortColor3": return sortColors(level, 3);
    case "sortShape": return sortShapes(level);
    case "sortRule": return sortCategories(level);
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
      return tiles({ clip: s.clip }, level, L(`a ${s.name}`, `un ${shapeName(s.name)}`));
    }
    case "assemblePicture": {
      const w = pick(bankWords());
      return tiles({ emoji: w.emoji }, level, w.word);
    }
    case "shapeBuild": return shapeHouse(level);
    case "patternBuild": return patternRow(level);
    default: return soundTrain(level);
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
