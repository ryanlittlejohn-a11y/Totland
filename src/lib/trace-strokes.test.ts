import { describe, expect, it } from "vitest";
import { BOARD_H, BOARD_W, START_ZONE, currentStroke, startMulti, traceStepMulti, type Pt } from "./line-trace";
import {
  DIGIT_CHARACTERS, SHAPE_CHARACTERS, characterInBounds, characterSamples, dealCharacters, type StrokeCharacter,
} from "./trace-strokes";
import { GAMES, gameById } from "./catalog";

const ALL = [...SHAPE_CHARACTERS, ...DIGIT_CHARACTERS];

/** Feed finger points through the multi-stroke engine. */
const run = (strokes: Pt[][], fingers: Pt[], freeOrder = false, tol = 9) => {
  let s = startMulti(strokes.length);
  let completions = 0;
  for (const p of fingers) {
    const r = traceStepMulti(s, strokes, p, tol, freeOrder);
    s = r.state;
    if (r.completed) completions++;
  }
  return { s, completions };
};

/** Follow every stroke of a character in order, sample by sample. */
const traceAll = (c: StrokeCharacter, freeOrder = false) => {
  const strokes = characterSamples(c);
  const fingers = strokes.flatMap((s) => [...s, ...s.slice(-3)]);
  return run(strokes, fingers, freeOrder);
};

describe("Trace Shapes / Trace Numbers stroke data", () => {
  it("has 8 shapes and 10 digits, all with unique ids and labels", () => {
    expect(SHAPE_CHARACTERS).toHaveLength(8);
    expect(DIGIT_CHARACTERS).toHaveLength(10);
    expect(new Set(ALL.map((c) => c.id)).size).toBe(18);
    for (const c of ALL) {
      expect(c.label.en.length, c.id).toBeGreaterThan(0);
      expect(c.label.es.length, c.id).toBeGreaterThan(0);
      expect(c.strokes.length, c.id).toBeGreaterThanOrEqual(1);
    }
    expect(DIGIT_CHARACTERS.map((c) => c.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `digit-${n}`));
  });

  it("every stroke stays on the board", () => {
    for (const c of ALL) expect(characterInBounds(c), c.id).toBe(true);
  });

  it("digits draw guides, shapes do not", () => {
    expect(DIGIT_CHARACTERS.every((c) => c.guides)).toBe(true);
    expect(SHAPE_CHARACTERS.every((c) => !c.guides)).toBe(true);
  });

  it("digits 4 and 5 are two-stroke characters (strict order matters)", () => {
    expect(DIGIT_CHARACTERS.find((c) => c.id === "digit-4")!.strokes).toHaveLength(2);
    expect(DIGIT_CHARACTERS.find((c) => c.id === "digit-5")!.strokes).toHaveLength(2);
  });

  it("deals 3 different characters, easier warm-up first", () => {
    for (const pool of [SHAPE_CHARACTERS, DIGIT_CHARACTERS])
      for (let lv = 1; lv <= 5; lv++)
        for (let i = 0; i < 50; i++) {
          const d = dealCharacters(pool, lv);
          expect(new Set(d.map((c) => c.id)).size).toBe(3);
          expect(d[0]!.level).toBe(Math.max(1, Math.min(3, Math.ceil(lv / 2)) - 1));
        }
  });
});

describe("Multi-stroke engine", () => {
  const two = characterSamples(DIGIT_CHARACTERS.find((c) => c.id === "digit-4")!);

  it("strict order: touching a later stroke before its turn does not count", () => {
    // Stroke 2 of "4" is the vertical line; trace it fully first — nothing moves.
    const { s } = run(two, two[1]!);
    expect(s.heads[1]).toBe(0);
    expect(currentStroke(s, two)).toBe(0);
  });

  it("free order: a later stroke can move before the first is finished", () => {
    const { s } = run(two, two[1]!, true);
    expect(s.heads[1]).toBe(two[1]!.length - 1);
    // Stroke 1 shares its start point with stroke 2, so it may move a
    // little — but it must not be finished.
    expect(s.heads[0]).toBeLessThan(two[0]!.length - 1);
  });

  it("a new stroke only starts near its start dot", () => {
    // Far from stroke 1's start dot: no progress.
    const far = traceStepMulti(startMulti(2), two, { x: 90, y: 60 }, 9);
    expect(far.state.heads[0]).toBe(0);
    // Inside the generous start zone: progress begins.
    const near = traceStepMulti(startMulti(2), two, two[0]![2]!, 9);
    expect(near.state.heads[0]).toBeGreaterThan(0);
    expect(START_ZONE).toBeGreaterThanOrEqual(10);
  });

  it("lifting the finger keeps progress; the next touch resumes where it stopped", () => {
    const stroke = two[0]!;
    let s = run(two, stroke.slice(0, 15)).s;
    const kept = s.heads[0]!;
    expect(kept).toBeGreaterThan(0);
    // Wandering far away pauses; coming back near the head continues.
    s = run(two, [{ x: 95, y: 65 }], false).s && s;
    const resumed = traceStepMulti(s, two, stroke[kept + 2]!, 9);
    expect(resumed.state.heads[0]).toBeGreaterThan(kept);
  });

  it("a straight swipe across a character does not finish it", () => {
    for (const c of ALL) {
      const strokes = characterSamples(c);
      const swipe = Array.from({ length: 40 }, (_, i) => ({ x: 20 + (60 * i) / 39, y: 35 }));
      const { s, completions } = run(strokes, swipe);
      expect(s.done, c.id).toBe(false);
      expect(completions, c.id).toBe(0);
    }
  });

  it("following every stroke completes exactly once, strict and free", () => {
    for (const c of ALL) {
      for (const free of [false, true]) {
        const { s, completions } = traceAll(c, free);
        expect(s.done, `${c.id} free=${free}`).toBe(true);
        expect(completions, `${c.id} free=${free}`).toBe(1);
        // Once done, further touches do nothing.
        const after = traceStepMulti(s, characterSamples(c), { x: 50, y: 35 }, 9, free);
        expect(after.state).toBe(s);
      }
    }
  });

  it("free order still completes when strokes are traced out of order", () => {
    const strokes = characterSamples(DIGIT_CHARACTERS.find((c) => c.id === "digit-5")!);
    const fingers = [...strokes[1]!, ...strokes[1]!.slice(-3), ...strokes[0]!, ...strokes[0]!.slice(-3)];
    const { s, completions } = run(strokes, fingers, true);
    expect(s.done).toBe(true);
    expect(completions).toBe(1);
  });
});

describe("Catalog entries", () => {
  it("adds Trace Shapes (free) and Trace Numbers (Premium) with distinct signatures", () => {
    const shapes = gameById("trace-shapes")!;
    const numbers = gameById("trace-numbers")!;
    expect(shapes.title).toBe("Trace Shapes");
    expect(shapes.premium).toBe(false);
    expect(numbers.title).toBe("Trace Numbers");
    expect(numbers.premium).toBe(true);
    expect(`${shapes.engine}:${shapes.kind}`).toBe("tracing:traceShapes");
    expect(`${numbers.engine}:${numbers.kind}`).toBe("tracing:traceNumbers");
    expect(GAMES.filter((g) => `${g.engine}:${g.kind}` === "tracing:traceShapes")).toHaveLength(1);
    expect(GAMES.filter((g) => `${g.engine}:${g.kind}` === "tracing:traceNumbers")).toHaveLength(1);
    // Existing tracing games untouched.
    expect(gameById("letter-tracing")!.kind).toBe("letters");
    expect(gameById("number-tracing")!.kind).toBe("numbers");
    expect(gameById("line-tracing")!.kind).toBe("lines");
  });

  it("totals are now 126 games, 50 free / 76 Premium", () => {
    expect(GAMES).toHaveLength(126);
    expect(GAMES.filter((g) => !g.premium)).toHaveLength(50);
    expect(GAMES.filter((g) => g.premium)).toHaveLength(76);
  });
});
