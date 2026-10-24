import { describe, expect, it } from "vitest";
import {
  BOARD_H, BOARD_W, LINE_PATTERNS, LOOKAHEAD, SAMPLE_STEP, dealLines, pathLength, samplePath,
  startLine, toleranceFor, traceStep, type Pt,
} from "./line-trace";
import { GAMES } from "./catalog";

const run = (samples: Pt[], fingers: Pt[], tol = 8) => {
  let s = startLine();
  let completions = 0;
  for (const p of fingers) {
    const r = traceStep(s, samples, p, tol);
    s = r.state;
    if (r.completed) completions++;
  }
  return { s, completions };
};

describe("Line Tracing", () => {
  it("has 30 valid patterns across 5 levels", () => {
    expect(LINE_PATTERNS).toHaveLength(30);
    expect(new Set(LINE_PATTERNS.map((p) => p.id)).size).toBe(30);
    for (const lv of [1, 2, 3, 4, 5]) expect(LINE_PATTERNS.filter((p) => p.level === lv).length, `level ${lv}`).toBe(6);
    for (const p of LINE_PATTERNS) {
      const s = samplePath(p.points);
      const a = s[0]!, b = s[s.length - 1]!;
      expect(Math.hypot(a.x - b.x, a.y - b.y), p.id).toBeGreaterThan(3);
      expect(pathLength(s), p.id).toBeGreaterThan(30);
      for (const q of s) {
        expect(q.x, p.id).toBeGreaterThanOrEqual(2);
        expect(q.x, p.id).toBeLessThanOrEqual(BOARD_W - 2);
        expect(q.y, p.id).toBeGreaterThanOrEqual(2);
        expect(q.y, p.id).toBeLessThanOrEqual(BOARD_H - 2);
      }
    }
  });

  it("samples are evenly spaced", () => {
    const s = samplePath([{ x: 0, y: 0 }, { x: 30, y: 0 }]);
    expect(s).toHaveLength(21);
    for (let i = 1; i < s.length; i++) expect(s[i]!.x - s[i - 1]!.x).toBeCloseTo(SAMPLE_STEP, 5);
  });

  it("following the path from the start completes exactly once", () => {
    const s = samplePath(LINE_PATTERNS.find((p) => p.id === "wave-2")!.points);
    const { s: end, completions } = run(s, [...s, ...s.slice(-5)]);
    expect(end.done).toBe(true);
    expect(completions).toBe(1);
  });

  it("starting at the end or the middle does not count", () => {
    const s = samplePath([{ x: 10, y: 35 }, { x: 90, y: 35 }]);
    expect(run(s, [s[s.length - 1]!, s[30]!]).s.head).toBe(0);
  });

  it("drifting off the path pauses progress and keeps it", () => {
    const s = samplePath([{ x: 10, y: 35 }, { x: 90, y: 35 }]);
    const { s: mid } = run(s, s.slice(0, 20));
    const off = traceStep(mid, s, { x: 50, y: 5 }, 8);
    expect(off.state.head).toBe(mid.head);
    // Lifting and coming back near the head continues.
    expect(traceStep(mid, s, s[mid.head + 3]!, 8).state.head).toBeGreaterThan(mid.head);
  });

  it("scribbling cannot skip ahead: one move advances at most a few samples", () => {
    const s = samplePath(LINE_PATTERNS.find((p) => p.id === "loops-3")!.points);
    let st = startLine();
    for (let i = 0; i < 2000; i++) {
      const before = st.head;
      st = traceStep(st, s, { x: (i * 37) % 100, y: (i * 53) % 70 }, 11).state;
      expect(st.head - before).toBeLessThanOrEqual(LOOKAHEAD);
    }
    // A scribble that stays away from the start never gets going.
    let far = startLine();
    for (let i = 0; i < 2000; i++) far = traceStep(far, s, { x: 45 + ((i * 37) % 55), y: (i * 53) % 70 }, 11).state;
    expect(far.head).toBe(0);
  });

  it("tolerance is generous for the youngest and never below 7 units", () => {
    expect(toleranceFor(1)).toBe(11);
    expect(toleranceFor(5)).toBe(7);
  });

  it("deals 3 different patterns, easier warm-up first", () => {
    for (let lv = 1; lv <= 5; lv++)
      for (let i = 0; i < 50; i++) {
        const d = dealLines(lv);
        expect(new Set(d.map((p) => p.id)).size).toBe(3);
        expect(d[0]!.level).toBe(Math.max(1, lv - 1));
        expect(d[1]!.level).toBe(lv);
      }
  });

  it("is one free game in the catalog with its own engine/kind", () => {
    const g = GAMES.filter((x) => x.title === "Line Tracing");
    expect(g).toHaveLength(1);
    expect(g[0]!.premium).toBe(false);
    expect(GAMES.filter((x) => `${x.engine}:${x.kind}` === "tracing:lines")).toHaveLength(1);
  });
});
