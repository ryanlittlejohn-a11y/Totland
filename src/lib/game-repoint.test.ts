import { describe, expect, it, afterAll } from "vitest";
import { GAMES } from "./catalog";
import { roundForKind, CLUE_KINDS } from "./rounds";
import { LETTERS_ES } from "./content";
import { letterRun, mazeTier } from "./number-maze";
import { jigsawTier } from "./jigsaw-animals";
import { setLang } from "./i18n";

const byTitle = (t: string) => GAMES.find((g) => g.title === t)!;
const BESPOKE = new Set(["fishing", "monster", "rain", "rocket", "jigsaw", "maze"]);

describe("Group 1 re-pointed games", () => {
  afterAll(() => setLang("en"));

  it("each of the 8 games opens its real scene", () => {
    const expected: Record<string, [string, string]> = {
      "Letter Rocket": ["rocket", "letters"],
      "Number Rocket": ["rocket", "numbers"],
      "Simple Jigsaw": ["jigsaw", "jigsawEasy"],
      "Number Fishing": ["fishing", "nextNumber"],
      "Word Fishing": ["fishing", "missingLetterWord"],
      "Number Monster": ["monster", "countObjects"],
      "Number Rain": ["rain", "numbersInOrder"],
      "Letter Maze": ["maze", "letters"],
    };
    for (const [title, [engine, kind]] of Object.entries(expected)) {
      const g = byTitle(title);
      expect([g.engine, g.kind], title).toEqual([engine, kind]);
    }
  });

  it("no two bespoke-scene games share the same engine + content", () => {
    const seen = new Map<string, string>();
    for (const g of GAMES.filter((x) => BESPOKE.has(x.engine))) {
      const key = `${g.engine}:${g.kind}`;
      expect(seen.get(key), `${g.title} duplicates ${seen.get(key)}`).toBeUndefined();
      seen.set(key, g.title);
    }
  });

  it("Number Rain, Number Monster and Number Fishing differ from their look-alikes", () => {
    expect(byTitle("Number Rain").kind).not.toBe(byTitle("Falling Numbers").kind);
    expect(byTitle("Number Monster").kind).not.toBe(byTitle("Hungry for Numbers").kind);
    expect(byTitle("Number Fishing").kind).not.toBe(byTitle("Catch the Number").kind);
  });

  it("free/Premium flags unchanged: 46 free / 75 Premium, Simple Jigsaw free", () => {
    expect(GAMES).toHaveLength(121);
    expect(GAMES.filter((g) => !g.premium)).toHaveLength(46);
    expect(byTitle("Simple Jigsaw").premium).toBe(false);
  });

  it("next-number rounds show three numbers in a row and want the fourth", () => {
    for (let i = 0; i < 200; i++) {
      for (const level of [1, 3, 5]) {
        const r = roundForKind("nextNumber", level);
        const shown = r.prompt.split(/\s+/).filter((t) => /^\d+$/.test(t)).map(Number);
        expect(shown).toHaveLength(3);
        expect(Number(r.answerId)).toBe(shown[2]! + 1);
        expect(r.options.map((o) => o.id)).toContain(r.answerId);
      }
    }
  });

  it("counting and missing-letter games show a clue", () => {
    expect(CLUE_KINDS.has("countObjects")).toBe(true);
    expect(CLUE_KINDS.has("missingLetterWord")).toBe(true);
    const r = roundForKind("countObjects", 2);
    expect(Array.from(r.visual ?? "")).toHaveLength(Number(r.answerId));
  });

  it("Simple Jigsaw stays at 2–4 pieces at every level", () => {
    for (const level of [1, 2, 3, 4, 5]) {
      const t = jigsawTier(level, true);
      expect(t.cols * t.rows).toBeGreaterThanOrEqual(2);
      expect(t.cols * t.rows).toBeLessThanOrEqual(4);
    }
  });

  it("Letter Maze uses consecutive letters and the 3/5/7/8/10 tiers; Spanish runs can include Ñ", () => {
    expect([1, 2, 3, 4, 5].map((l) => mazeTier(l).points)).toEqual([3, 5, 7, 8, 10]);
    const run = letterRun(LETTERS_ES, 3, () => 13 / 25);
    expect(run).toEqual(["N", "Ñ", "O"]);
    expect(letterRun(LETTERS_ES, 10, () => 0.999)).toHaveLength(10);
  });
});
