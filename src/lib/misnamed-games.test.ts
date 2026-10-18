import { describe, expect, it, afterAll } from "vitest";
import { GAMES } from "./catalog";
import { fits, isDecoy, neededCount, placeSet } from "./scenes";
import { huntSet } from "./rounds";
import { setLang } from "./i18n";

const byTitle = (t: string) => GAMES.find((g) => g.title === t)!;

describe("misnamed games open their real scenes", () => {
  afterAll(() => setLang("en"));

  it("every Pop/Bubbles game uses the bubble-pop scene", () => {
    for (const t of ["Letter Pop", "Letter Bubbles", "Number Pop", "Number Bubbles", "Color Pop", "Shape Pop"])
      expect(byTitle(t).engine, t).toBe("pop");
    expect(byTitle("Letter Pop").kind).not.toBe(byTitle("Letter Bubbles").kind);
    expect(byTitle("Number Pop").kind).not.toBe(byTitle("Number Bubbles").kind);
  });

  it("sort, assemble, train, garden and detective games are re-pointed", () => {
    const expected: Record<string, string> = {
      "Rainbow Sort": "sort", "Shape Sort": "sort", "Sort the Toys": "sort", "Color Carousel": "sort",
      "Letter Puzzle": "assemble", "Number Puzzle": "assemble", "Shape Puzzle": "assemble",
      "Picture Puzzle": "assemble", "Shape Builder": "assemble", "Pattern Builder": "assemble",
      "Beginning Sound Train": "train", "Counting Train": "train", "Number Garden": "garden", "Sound Detective": "hunt",
    };
    for (const [t, e] of Object.entries(expected)) expect(byTitle(t).engine, t).toBe(e);
  });

  it("free/Premium split is unchanged: 121 games, 46 free", () => {
    expect(GAMES).toHaveLength(121);
    expect(GAMES.filter((g) => !g.premium)).toHaveLength(46);
  });

  it("every place-pieces round is solvable in English and Spanish", () => {
    for (const lang of ["en", "es"] as const) {
      setLang(lang);
      for (const kind of ["sortColor", "sortColor3", "sortShape", "sortRule", "assembleLetter", "assembleNumber", "assembleShape", "assemblePicture", "shapeBuild", "patternBuild", "trainSound"]) {
        for (let i = 0; i < 60; i++) {
          for (const level of [1, 3, 5]) {
            const set = placeSet(kind, level);
            const capacity = set.slots.reduce((n, s) => n + s.capacity, 0);
            expect(neededCount(set), kind).toBe(capacity);
            for (const p of set.pieces.filter((x) => !isDecoy(set, x)))
              expect(set.slots.some((s) => fits(s, p)), kind).toBe(true);
          }
        }
      }
    }
  });

  it("Sound Detective targets all start with the asked letter", () => {
    for (let i = 0; i < 50; i++) {
      const s = huntSet("sounds", 3);
      expect(s.targetIds.length).toBeGreaterThan(0);
    }
  });
});
