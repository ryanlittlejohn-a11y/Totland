/** Pure rules for tracing a whole word in one frame (no DOM). */

/** Share of a letter's ink cells that must be painted before it finishes. */
export const WORD_TRACE_THRESHOLD = 0.7;
/** Smallest usable letter slot (CSS px) for ages 2–4; below this the frame scrolls. */
export const MIN_SLOT = 90;
/** Largest letter slot (CSS px) so iPad letters don't become huge. */
export const MAX_SLOT = 170;
/** Grid cells per letter slot width used for coverage. */
export const CELLS_PER_SLOT = 36;

/** A narrow brush, with only a small allowance outside the glyph for little fingers. */
export const wordBrushRadius = (slot: number): number => slot * 0.05;

export function nearLetterInk(x: number, y: number, ink: ReadonlySet<number>, cell: number, cols: number, margin: number): boolean {
  const reach = margin + cell * Math.SQRT1_2;
  for (const key of cellsInBrush(x, y, margin, cell, cols)) {
    if (!ink.has(key)) continue;
    const cx = (key % cols + 0.5) * cell;
    const cy = (Math.floor(key / cols) + 0.5) * cell;
    if (Math.hypot(cx - x, cy - y) <= reach) return true;
  }
  return false;
}

export interface WordFrameLayout {
  slot: number;
  width: number;
  height: number;
  scrolls: boolean;
}

/** Size the frame from the available width and the number of letters. */
export function wordFrameLayout(letterCount: number, frameWidth: number): WordFrameLayout {
  const count = Math.max(1, letterCount);
  const fit = Math.floor(frameWidth / count);
  const slot = Math.max(MIN_SLOT, Math.min(MAX_SLOT, fit));
  const width = Math.max(frameWidth, slot * count);
  // Extra headroom above the cap line for accents and the ñ tilde.
  return { slot, width, height: Math.round(slot * 1.7), scrolls: slot * count > frameWidth };
}

/** Split a word into displayed letters, keeping accented letters whole. */
export function wordLetters(word: string): string[] {
  return Array.from(word.normalize("NFC"));
}

/** Letter key saved toward unlock totals: accents dropped, Ñ kept as its own letter. */
export function unlockLetter(glyph: string): string {
  if (glyph === "ñ" || glyph === "Ñ") return glyph;
  return glyph.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Grid cells (by key) touched by a brush circle. */
export function cellsInBrush(x: number, y: number, radius: number, cell: number, cols: number): number[] {
  const out: number[] = [];
  const c0 = Math.floor((x - radius) / cell), c1 = Math.floor((x + radius) / cell);
  const r0 = Math.floor((y - radius) / cell), r1 = Math.floor((y + radius) / cell);
  for (let r = Math.max(0, r0); r <= r1; r++)
    for (let c = Math.max(0, c0); c <= Math.min(cols - 1, c1); c++) {
      const cx = (c + 0.5) * cell, cy = (r + 0.5) * cell;
      if ((cx - x) ** 2 + (cy - y) ** 2 <= (radius + cell * 0.5) ** 2) out.push(r * cols + c);
    }
  return out;
}

export interface TraceState {
  active: number;
  painted: ReadonlySet<number>;
  finished: boolean;
}

export const startTrace = (): TraceState => ({ active: 0, painted: new Set(), finished: false });

export const letterCoverage = (state: TraceState, ink: ReadonlySet<number>): number => {
  if (!ink.size) return 1;
  let hit = 0;
  for (const k of state.painted) if (ink.has(k)) hit++;
  return hit / ink.size;
};

/**
 * Add painted cells. Only cells inside the active letter's ink count; when it
 * reaches the threshold the next letter becomes active automatically.
 */
export function paintCells(
  state: TraceState,
  cells: number[],
  inkByLetter: ReadonlySet<number>[],
  threshold = WORD_TRACE_THRESHOLD,
): { state: TraceState; completedLetter: number | null } {
  if (state.finished) return { state, completedLetter: null };
  const ink = inkByLetter[state.active];
  if (!ink) return { state, completedLetter: null };
  const painted = new Set(state.painted);
  for (const k of cells) if (ink.has(k)) painted.add(k);
  const next = { ...state, painted };
  if (letterCoverage(next, ink) < threshold) return { state: next, completedLetter: null };
  const done = state.active;
  const last = done + 1 >= inkByLetter.length;
  return {
    state: { active: last ? done : done + 1, painted: new Set(), finished: last },
    completedLetter: done,
  };
}
