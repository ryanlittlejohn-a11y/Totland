import { describe, expect, it } from "vitest";
import {
  MIN_SLOT, MAX_SLOT, paintCells, startTrace, unlockLetter, wordFrameLayout, wordLetters,
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
    for (const cells of [[0, 1], [10, 11], [20, 21]]) {
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
    const r = paintCells(s, [0, 1, 12, 13], ink);
    expect(r.completedLetter).toBe(0);
    expect(r.state.painted.size).toBe(0);
    expect(paintCells(r.state, [12], ink).completedLetter).toBeNull();
  });

  it("completes exactly once", () => {
    let s = startTrace();
    let completions = 0;
    for (let i = 0; i < 6; i++) {
      const r = paintCells(s, [0, 1, 10, 11, 20, 21], ink);
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
  });
});
