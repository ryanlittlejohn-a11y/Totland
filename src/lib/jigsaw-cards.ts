import { alphabet, bankWords } from "./content";
import type { JigsawAnimal } from "./jigsaw-animals";

/**
 * Alphabet Jigsaw / Number Jigsaw picture cards. Each card is drawn on a
 * canvas at play time (big letter + matching picture, or numeral + that many
 * objects) — offline, no bundled art, and the letter–word pairing comes from
 * the active language's authored word bank (WORDS_ES for Spanish, never a
 * translation of the English word).
 */
export interface JigsawCard extends JigsawAnimal {
  promptEn: string;
  promptEs: string;
  doneEn: string;
  doneEs: string;
}

export interface LetterCardSpec { letter: string; word: string | null; emoji: string }
export interface NumberCardSpec { n: number; emoji: string }

const NUMBER_EMOJI = ["🦆", "🍎", "⭐", "🐞", "🎈", "🐟", "🍓", "🐤"];

/** One card per letter of the active alphabet (EN 26, ES 27 with Ñ). */
export function letterCardSpecs(): LetterCardSpec[] {
  const words = bankWords();
  return alphabet().map((letter) => {
    const w = words.find((x) => x.letter === letter);
    if (w) return { letter, word: w.word, emoji: w.emoji };
    // Ñ has no starting word in the authored bank: "Ñ, like in piña".
    return { letter, word: null, emoji: letter === "Ñ" ? "🍍" : "🔤" };
  });
}

/** Numbers 1–max (Number Valley teaches 1–20; zero has no objects to show). */
export function numberCardSpecs(max: number): NumberCardSpec[] {
  return Array.from({ length: Math.min(20, Math.max(1, max)) }, (_, i) => ({
    n: i + 1,
    emoji: NUMBER_EMOJI[i % NUMBER_EMOJI.length]!,
  }));
}

const SIZE = 816;

function canvas(draw: (ctx: CanvasRenderingContext2D) => void): string {
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const css = getComputedStyle(document.documentElement);
  const bg = css.getPropertyValue("--card").trim() || "#fff8ec";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  draw(ctx);
  return c.toDataURL("image/png");
}

function inkColor(): string {
  if (typeof document === "undefined") return "#3b2a20";
  return getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#3b2a20";
}

export function letterCard(spec: LetterCardSpec): JigsawCard {
  const image = canvas((ctx) => {
    ctx.fillStyle = inkColor();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 360px "Baloo 2", system-ui, sans-serif`;
    ctx.fillText(spec.letter, SIZE * 0.5, SIZE * 0.32);
    ctx.font = `300px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.fillText(spec.emoji, SIZE * 0.5, SIZE * 0.74);
  });
  const L = spec.letter;
  return {
    id: `letter-${L}`,
    emoji: spec.emoji,
    en: `letter ${L}`,
    es: `letra ${L}`,
    image,
    promptEn: `Put the letter ${L} back together!`,
    promptEs: `¡Arma la letra ${L}!`,
    doneEn: spec.word ? `${L} is for ${spec.word}!` : `${L}!`,
    doneEs: spec.word ? `¡${L} es de ${spec.word}!` : `¡${L}, como en piña!`,
  };
}

export function numberCard(spec: NumberCardSpec): JigsawCard {
  const image = canvas((ctx) => {
    ctx.fillStyle = inkColor();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 300px "Baloo 2", system-ui, sans-serif`;
    ctx.fillText(String(spec.n), SIZE * 0.5, SIZE * 0.24);
    // Objects in rows of up to 5, sized to fit the lower part of the card.
    const perRow = spec.n <= 3 ? spec.n : spec.n <= 10 ? 5 : 5;
    const rows = Math.ceil(spec.n / perRow);
    const cell = Math.min(150, (SIZE * 0.9) / perRow, (SIZE * 0.5) / rows);
    ctx.font = `${Math.floor(cell * 0.85)}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    const top = SIZE * 0.47 + (SIZE * 0.5 - rows * cell) / 2;
    for (let i = 0; i < spec.n; i++) {
      const r = Math.floor(i / perRow);
      const inRow = Math.min(perRow, spec.n - r * perRow);
      const left = (SIZE - inRow * cell) / 2;
      ctx.fillText(spec.emoji, left + (i % perRow) * cell + cell / 2, top + r * cell + cell / 2);
    }
  });
  const n = spec.n;
  return {
    id: `number-${n}`,
    emoji: spec.emoji,
    en: `number ${n}`,
    es: `número ${n}`,
    image,
    promptEn: `Put the number ${n} back together!`,
    promptEs: `¡Arma el número ${n}!`,
    doneEn: `You built the number ${n}!`,
    doneEs: `¡Armaste el número ${n}!`,
  };
}

/** Largest number shown on Number Jigsaw for a puzzles level (matches maxNumber). */
export const numberJigsawMax = (level: number) => (level <= 1 ? 5 : level <= 2 ? 10 : level <= 4 ? 15 : 20);
