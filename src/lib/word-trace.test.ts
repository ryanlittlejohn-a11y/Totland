import { describe, expect, it } from "vitest";
import {
  CELLS_PER_SLOT, MIN_SLOT, MAX_SLOT, WORD_TRACE_THRESHOLD, cellsInBrush, nearLetterInk, paintCells, startTrace, unlockLetter, wordBrushRadius, wordFrameLayout, wordLetters,
} from "./word-trace";

const store = new Map<string, string>();
(globalThis as Record<string, unknown>)["window"] = Object.assign(new EventTarget(), {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
});
const { defaultProfile, recordTracedLetter, tracingProgressOf, wordTracingUnlocked } = await import("./profile");

// Three letters, each with four ink cells of its own.
const ink = [new Set([0, 1, 2, 3]), new Set([10, 11, 12, 13]), new Set([20, 21, 22, 23])];

describe("one-frame word tracing", () => {
  it("advances letter by letter, in order, without a Done tap", () => {
    let s = startTrace();
    const order: number[] = [];
    for (const cells of [[0, 1, 2], [10, 11, 12], [20, 21, 22]]) {
      const r = paintCells(s, cells, ink);
      s = r.state;
      if (r.completedLetter !== null) order.push(r.completedLetter);
    }
    expect(order).toEqual([0, 1, 2]);
    expect(s.finished).toBe(true);
  });

  it("only counts paint inside the active letter", () => {
    let s = startTrace();
    // Painting the neighbours and empty space does nothing.
    s = paintCells(s, [10, 11, 12, 13, 20, 21, 99], ink).state;
    expect(s.active).toBe(0);
    expect(s.painted.size).toBe(0);
    // Painting ahead on letter 2 must not pre-fill it.
    const r = paintCells(s, [0, 1, 2, 12, 13], ink);
    expect(r.completedLetter).toBe(0);
    expect(r.state.painted.size).toBe(0);
    expect(paintCells(r.state, [12], ink).completedLetter).toBeNull();
  });

  it("completes exactly once", () => {
    let s = startTrace();
    let completions = 0;
    for (let i = 0; i < 6; i++) {
      const r = paintCells(s, [0, 1, 2, 10, 11, 12, 20, 21, 22], ink);
      s = r.state;
      if (r.completedLetter === 2) completions++;
    }
    expect(completions).toBe(1);
    expect(paintCells(s, [20, 21, 22, 23], ink).completedLetter).toBeNull();
  });

  it("letters traced in words count toward unlocks; repeats don't", () => {
    let p = defaultProfile();
    for (const g of wordLetters("abcdefghi")) p = recordTracedLetter(p, unlockLetter(g));
    p = recordTracedLetter(p, "a");
    expect(tracingProgressOf(p).lowercase).toHaveLength(9);
    for (const g of "ABCDEFGHIJ") p = recordTracedLetter(p, g);
    expect(wordTracingUnlocked(p, 2)).toBe(false);
    p = recordTracedLetter(p, unlockLetter("j"));
    expect(wordTracingUnlocked(p, 2)).toBe(true);
    expect(wordTracingUnlocked(p, 3)).toBe(false);
  });

  it("keeps Spanish accented letters whole and saves them as the base letter", () => {
    expect(wordLetters("búho")).toEqual(["b", "ú", "h", "o"]);
    expect(wordLetters("avio\u0301n")).toEqual(["a", "v", "i", "ó", "n"]);
    expect(wordLetters("árbol")).toHaveLength(5);
    expect(unlockLetter("ú")).toBe("u");
    expect(unlockLetter("ñ")).toBe("ñ");
  });

  it("sizes letters for phones and iPads, scrolling instead of shrinking", () => {
    const phone5 = wordFrameLayout(5, 328);
    expect(phone5.slot).toBe(MIN_SLOT);
    expect(phone5.scrolls).toBe(true);
    expect(wordFrameLayout(2, 328)).toMatchObject({ slot: 164, scrolls: false });
    expect(wordFrameLayout(2, 1000).slot).toBe(MAX_SLOT);
    expect(wordFrameLayout(5, 1000).scrolls).toBe(false);
    expect(wordFrameLayout(4, 328)).toMatchObject({ slot: 90, width: 360, scrolls: true });
    expect(wordFrameLayout(5, 328)).toMatchObject({ slot: 90, width: 450, scrolls: true });
    expect(wordFrameLayout(5, 490)).toMatchObject({ slot: 98, scrolls: false });
  });

  it("requires 70% fine-grid ink coverage with a 4.5px brush at the phone minimum", () => {
    expect(WORD_TRACE_THRESHOLD).toBe(0.7);
    expect(CELLS_PER_SLOT).toBe(36);
    expect(wordBrushRadius(90)).toBe(4.5);
    const ten = [new Set(Array.from({ length: 10 }, (_, i) => i))];
    expect(paintCells(startTrace(), [0, 1, 2, 3, 4, 5], ten).state.finished).toBe(false);
    expect(paintCells(startTrace(), [0, 1, 2, 3, 4, 5, 6], ten).state.finished).toBe(true);
  });

  it.each(["d", "o"])("a vertical swipe cannot complete %s but following its curved ink does", (glyph) => {
    const slot = 90, cell = slot / CELLS_PER_SLOT, cols = CELLS_PER_SLOT;
    const outline: { x: number; y: number }[] = [];
    for (let i = 0; i <= 180; i++) {
      const angle = i / 180 * Math.PI * 2;
      outline.push({ x: 45 + 19 * Math.cos(angle), y: 65 + 23 * Math.sin(angle) });
    }
    if (glyph === "d") for (let y = 20; y <= 88; y++) outline.push({ x: 64, y });
    const letter = new Set(outline.flatMap(({ x, y }) => cellsInBrush(x, y, 3, cell, cols)));
    const brush = (points: { x: number; y: number }[]) => points.flatMap(({ x, y }) =>
      nearLetterInk(x, y, letter, cell, cols, slot * 0.025) ? cellsInBrush(x, y, wordBrushRadius(slot), cell, cols) : []);
    const vertical = Array.from({ length: 110 }, (_, y) => ({ x: 45, y }));
    expect(paintCells(startTrace(), brush(vertical), [letter]).state.finished).toBe(false);
    expect(paintCells(startTrace(), brush(outline), [letter]).state.finished).toBe(true);
    expect(nearLetterInk(5, 5, letter, cell, cols, slot * 0.025)).toBe(false);
  });
});
