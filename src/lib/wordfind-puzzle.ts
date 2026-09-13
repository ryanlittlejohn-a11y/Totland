/** Grid builder for the Word Finds section: across and down only, never backwards. */
import { LETTERS } from "./content";
import type { WordFindTheme } from "./wordfinds";

export interface PlacedWord {
  word: string;
  cells: number[];
}

export interface WordFindPuzzle {
  size: number;
  cells: string[];
  placed: PlacedWord[];
}

/** Small deterministic RNG so a puzzle replays the same until the child finishes it. */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Explorer → Reader: bigger grids and more words as the child grows. */
export function puzzleShape(level: number) {
  if (level <= 1) return { size: 6, count: 3 };
  if (level <= 3) return { size: 8, count: 5 };
  return { size: 10, count: 7 };
}

export function buildWordFind(theme: WordFindTheme, level: number, seed: number): WordFindPuzzle {
  const rand = rng(seed || 1);
  const { size, count } = puzzleShape(level);
  const pool = theme.words
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((w) => w.length >= 3 && w.length <= size)
    .sort(() => rand() - 0.5);

  const cells: (string | null)[] = Array.from({ length: size * size }, () => null);
  const placed: PlacedWord[] = [];

  const tryPlace = (word: string): boolean => {
    for (let attempt = 0; attempt < 60; attempt++) {
      const down = rand() < 0.5;
      const start = Math.floor(rand() * (size - word.length + 1));
      const line = Math.floor(rand() * size);
      const idx: number[] = [];
      for (let i = 0; i < word.length; i++) {
        idx.push(down ? (start + i) * size + line : line * size + start + i);
      }
      const ok = idx.every((c, i) => cells[c] === null || cells[c] === word[i]);
      if (!ok) continue;
      idx.forEach((c, i) => (cells[c] = word[i]!));
      placed.push({ word, cells: idx });
      return true;
    }
    return false;
  };

  for (const w of pool) {
    if (placed.length >= count) break;
    if (placed.some((p) => p.word === w)) continue;
    tryPlace(w);
  }

  const filled = cells.map((c) => c ?? LETTERS[Math.floor(rand() * LETTERS.length)]!);
  return { size, cells: filled, placed };
}
