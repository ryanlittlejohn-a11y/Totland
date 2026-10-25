import { describe, expect, it } from "vitest";
import { BOUNDS, HIT_RADIUS, MIN_SPACING, PUZZLES, dealPuzzles, nearestDot, puzzleSvg, startDots, touchDot } from "./connect-dots";
import { GAMES } from "./catalog";

describe("Connect the Dots rules", () => {
  it("connects only in numeric order", () => {
    let s = startDots();
    ({ state: s } = touchDot(s, 0, 4));
    expect(s.connected).toBe(1);
    const r = touchDot(s, 2, 4);
    expect(r.outcome).toBe("nudge");
    expect(r.state.connected).toBe(1); // no lost progress
    expect(touchDot(s, 0, 4).outcome).toBe("ignore");
    expect(touchDot(s, 1, 4).outcome).toBe("connect");
  });

  it("completes exactly once", () => {
    let s = startDots();
    const outs: string[] = [];
    for (const i of [0, 1, 2, 2, 0, 1]) {
      const r = touchDot(s, i, 3);
      outs.push(r.outcome);
      s = r.state;
    }
    expect(outs.filter((o) => o === "complete")).toHaveLength(1);
    expect(s.finished).toBe(true);
  });

  it("hit radius is generous (>= Line Tracing's 11) and picks the nearest dot", () => {
    expect(HIT_RADIUS).toBeGreaterThanOrEqual(11);
    const pts = [{ x: 20, y: 20 }, { x: 40, y: 20 }];
    expect(nearestDot(pts, { x: 30, y: 28 })).toBe(null);
    expect(nearestDot(pts, { x: 28, y: 25 })).toBe(0);
    expect(nearestDot(pts, { x: 31, y: 20 })).toBe(1);
  });

  it("has about 30 original puzzles across 5 levels, growing to ~20 dots", () => {
    expect(PUZZLES.length).toBe(30);
    const ranges: Record<number, [number, number]> = { 1: [3, 5], 2: [6, 7], 3: [8, 11], 4: [11, 15], 5: [16, 20] };
    for (const p of PUZZLES) {
      const [lo, hi] = ranges[p.level]!;
      expect(p.points.length, p.id).toBeGreaterThanOrEqual(lo);
      expect(p.points.length, p.id).toBeLessThanOrEqual(hi);
    }
    expect(Math.max(...PUZZLES.map((p) => p.points.length))).toBe(20);
    for (const l of [1, 2, 3, 4, 5]) expect(dealPuzzles(l)).toHaveLength(3);
    expect(new Set(PUZZLES.map((p) => p.id)).size).toBe(PUZZLES.length);
  });

  it("every puzzle: sequential dots in bounds, no two dots overlapping", () => {
    for (const p of PUZZLES) {
      const svg = puzzleSvg(p);
      expect(svg.dots.map((d) => d.n)).toEqual(p.points.map((_, i) => i + 1));
      for (const q of p.points) {
        expect(q.x, p.id).toBeGreaterThanOrEqual(BOUNDS.min);
        expect(q.x, p.id).toBeLessThanOrEqual(BOUNDS.max);
        expect(q.y, p.id).toBeGreaterThanOrEqual(BOUNDS.min);
        expect(q.y, p.id).toBeLessThanOrEqual(BOUNDS.max);
      }
      for (let i = 0; i < p.points.length; i++)
        for (let j = i + 1; j < p.points.length; j++) {
          const a = p.points[i]!, b = p.points[j]!;
          expect(Math.hypot(a.x - b.x, a.y - b.y), `${p.id} ${i + 1}/${j + 1}`).toBeGreaterThanOrEqual(MIN_SPACING);
        }
      expect(svg.outline.endsWith(" Z")).toBe(p.closed);
      // No line segment runs straight over another dot (dot radius ~5 units).
      const segs = p.points.map((a, i) => [a, p.points[i + 1] ?? (p.closed ? p.points[0]! : null)] as const);
      segs.forEach(([a, b], si) => {
        if (!b) return;
        p.points.forEach((q, qi) => {
          if (q === a || q === b) return;
          const t = Math.max(0, Math.min(1, ((q.x - a.x) * (b.x - a.x) + (q.y - a.y) * (b.y - a.y)) / ((b.x - a.x) ** 2 + (b.y - a.y) ** 2)));
          const d = Math.hypot(a.x + t * (b.x - a.x) - q.x, a.y + t * (b.y - a.y) - q.y);
          expect(d, `${p.id} segment ${si + 1} over dot ${qi + 1}`).toBeGreaterThanOrEqual(5);
        });
      });
    }
  });

  it("is game 126, free, with its own signature; totals 126 / 50 free / 76 Premium", () => {
    const g = GAMES.find((x) => x.title === "Connect the Dots")!;
    expect(g.number).toBe(126);
    expect(g.premium).toBe(false);
    expect(GAMES.filter((x) => x.engine === g.engine && x.kind === g.kind)).toHaveLength(1);
    expect(GAMES).toHaveLength(126);
    expect(GAMES.filter((x) => !x.premium)).toHaveLength(50);
    expect(GAMES.filter((x) => x.premium)).toHaveLength(76);
  });
});
