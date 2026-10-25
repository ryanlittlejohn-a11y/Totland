import { describe, expect, it, afterAll } from "vitest";
import { GAMES } from "./catalog";
import { roundForKind, CLUE_KINDS } from "./rounds";
import { LETTERS_ES } from "./content";
import { letterRun, mazeTier } from "./number-maze";
import { JIGSAW_ANIMALS, jigsawTier } from "./jigsaw-animals";
import { JIGSAW_VEHICLES } from "./jigsaw-vehicles";
import { letterCardSpecs, numberCardSpecs, numberJigsawMax } from "./jigsaw-cards";
import { shapeTrainSet } from "./shape-train";
import { WORDS_ES } from "./content";
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

  it("free/Premium flags: 49 free / 76 Premium (Trace Shapes + Free Draw free, Trace Numbers Premium), Simple Jigsaw free", () => {
    expect(GAMES).toHaveLength(125);
    expect(GAMES.filter((g) => !g.premium)).toHaveLength(49);
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

  it("Simple Jigsaw has its own 6-picture set, separate from the animals", () => {
    expect(JIGSAW_VEHICLES).toHaveLength(6);
    const animalIds = new Set(JIGSAW_ANIMALS.map((a) => a.id));
    for (const v of JIGSAW_VEHICLES) expect(animalIds.has(v.id)).toBe(false);
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

  it("Batch 3 games open their real scenes, distinct from Animal Jigsaw and Pattern Parade", () => {
    expect([byTitle("Alphabet Jigsaw").engine, byTitle("Alphabet Jigsaw").kind]).toEqual(["jigsaw", "letterCards"]);
    expect([byTitle("Number Jigsaw").engine, byTitle("Number Jigsaw").kind]).toEqual(["jigsaw", "numberCards"]);
    expect([byTitle("Shape Train").engine, byTitle("Shape Train").kind]).toEqual(["rocket", "shapeTrain"]);
    const kinds = ["Animal Jigsaw", "Simple Jigsaw", "Alphabet Jigsaw", "Number Jigsaw"].map((t) => byTitle(t).kind);
    expect(new Set(kinds).size).toBe(4);
    expect(byTitle("Shape Train").engine).not.toBe(byTitle("Pattern Parade").engine);
  });

  it("Alphabet Jigsaw covers EN 26 / ES 27 letters, Spanish pictures from WORDS_ES", () => {
    setLang("en");
    expect(letterCardSpecs()).toHaveLength(26);
    setLang("es");
    const es = letterCardSpecs();
    expect(es).toHaveLength(27);
    expect(es.find((c) => c.letter === "Ñ")?.emoji).toBe("🍍");
    for (const c of es.filter((x) => x.word)) {
      expect(WORDS_ES.some((w) => w.word === c.word && w.letter === c.letter), c.word!).toBe(true);
    }
    setLang("en");
  });

  it("Number Jigsaw uses 1–20, capped by level like the numbers world", () => {
    expect(numberCardSpecs(numberJigsawMax(1)).map((c) => c.n)).toEqual([1, 2, 3, 4, 5]);
    expect(numberCardSpecs(numberJigsawMax(5))).toHaveLength(20);
    expect(numberCardSpecs(numberJigsawMax(5))[0]!.n).toBe(1);
  });

  it("Shape Train cars follow a repeating pattern with the first cars given", () => {
    for (let i = 0; i < 100; i++) {
      for (const level of [1, 3, 5]) {
        const t = shapeTrainSet(level);
        const unit = level >= 5 ? 3 : 2;
        t.cars.forEach((c, j) => expect(c.shape).toBe(t.cars[j % unit]!.shape));
        expect(t.given).toBeLessThan(t.cars.length);
        for (const d of t.decoys) expect(t.cars.some((c) => c.shape === d.shape)).toBe(false);
      }
    }
  });
});
