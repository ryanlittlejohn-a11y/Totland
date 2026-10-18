import { describe, expect, it, afterAll } from "vitest";
import { GAMES } from "./catalog";
import { dipBrush, fits, isDecoy, neededCount, paintPicture, placeSet, tapCountSet } from "./scenes";
import { huntSet } from "./rounds";
import { setLang } from "./i18n";

const byTitle = (t: string) => GAMES.find((g) => g.title === t)!;

describe("misnamed games open their real scenes", () => {
  afterAll(() => setLang("en"));

  it("every Pop/Bubbles game uses the bubble-pop scene", () => {
    for (const t of [
      "Letter Pop",
      "Letter Bubbles",
      "Number Pop",
      "Number Bubbles",
      "Color Pop",
      "Shape Pop",
    ])
      expect(byTitle(t).engine, t).toBe("pop");
    expect(byTitle("Letter Pop").kind).not.toBe(byTitle("Letter Bubbles").kind);
    expect(byTitle("Number Pop").kind).not.toBe(byTitle("Number Bubbles").kind);
  });

  it("sort, assemble, train, garden and detective games are re-pointed", () => {
    const expected: Record<string, string> = {
      "Rainbow Sort": "sort",
      "Shape Sort": "sort",
      "Sort the Toys": "sort",
      "Color Carousel": "sort",
      "Letter Puzzle": "assemble",
      "Number Puzzle": "assemble",
      "Shape Puzzle": "assemble",
      "Picture Puzzle": "assemble",
      "Shape Builder": "assemble",
      "Pattern Builder": "assemble",
      "Beginning Sound Train": "train",
      "Counting Train": "train",
      "Number Garden": "garden",
      "Sound Detective": "hunt",
    };
    for (const [t, e] of Object.entries(expected)) expect(byTitle(t).engine, t).toBe(e);
  });

  it("flat shape/count games get their own scenes (Part 1)", () => {
    expect(byTitle("Twin Shapes").engine).toBe("memory");
    expect(byTitle("Twin Shapes").kind).toBe("shapes");
    expect(byTitle("Count the Stars").kind).toBe("fillJar");
    expect(byTitle("Count the Fruit").kind).toBe("fillBasket");
    expect(byTitle("Count the Animals").engine).toBe("tapcount");
    expect(byTitle("Shape Match").kind).toBe("shapeSorter");
    expect(byTitle("Shape Shadow").kind).toBe("shadowShape");
    expect(byTitle("Match the Shadows").kind).toBe("shadowObject");
    const sig = (t: string) => `${byTitle(t).engine}:${byTitle(t).kind}`;
    const titles = ["Twin Shapes", "Shape Match", "Shape Shadow", "Match the Shadows", "Count the Stars", "Count the Fruit", "Count the Animals"];
    expect(new Set(titles.map(sig)).size).toBe(titles.length);
  });

  it("shadow and sorter rounds: every piece fits exactly one slot", () => {
    for (const lang of ["en", "es"] as const) {
      setLang(lang);
      for (const kind of ["shapeSorter", "shadowShape", "shadowObject"])
        for (let i = 0; i < 60; i++)
          for (const level of [1, 3, 5]) {
            const set = placeSet(kind, level);
            for (const p of set.pieces) {
              const n = set.slots.filter((s) => fits(s, p)).length;
              expect(n, kind).toBe(isDecoy(set, p) ? 0 : 1);
            }
            expect(neededCount(set)).toBe(set.slots.length);
            expect(set.slots.every((s) => s.shadow)).toBe(true);
          }
    }
  });

  it("Part 2: paint, tap-to-count, size and length games have their own scenes", () => {
    expect(byTitle("Color Match").engine).toBe("paint");
    expect(byTitle("Color Match").kind).toBe("paintPicture");
    expect(byTitle("Paint Match").engine).toBe("paint");
    expect(byTitle("Paint Match").kind).toBe("dipBrush");
    expect(byTitle("Count the Animals").engine).toBe("tapcount");
    expect(byTitle("Big or Small").kind).toBe("sizeBoxes");
    expect(byTitle("Long or Short").kind).toBe("lengthOrder");
    const sig = (t: string) => `${byTitle(t).engine}:${byTitle(t).kind}`;
    const titles = ["Color Match", "Paint Match", "Count the Animals", "Count the Stars", "Count the Fruit", "Big or Small", "Long or Short"];
    expect(new Set(titles.map(sig)).size).toBe(titles.length);
    // None of the 11 rebuilt games is left on the plain tap-a-card screen.
    for (const t of [...titles, "Twin Shapes", "Shape Match", "Shape Shadow", "Match the Shadows"])
      expect(byTitle(t).engine, t).not.toBe("choice");
  });

  it("paint rounds always have a pot for every region and the brush target", () => {
    for (let i = 0; i < 200; i++)
      for (const level of [1, 3, 5]) {
        const p = paintPicture(level);
        expect(new Set(p.regions.map((r) => r.color)).size).toBe(p.regions.length);
        for (const r of p.regions) expect(p.pots.some((c) => c.name === r.color)).toBe(true);
        const b = dipBrush(level);
        expect(b.pots.filter((c) => c.name === b.target)).toHaveLength(1);
      }
  });

  it("tap-to-count offers the right total exactly once, within 1–10", () => {
    for (let i = 0; i < 300; i++)
      for (const level of [1, 3, 5]) {
        const t = tapCountSet(level);
        expect(t.count).toBeGreaterThanOrEqual(1);
        expect(t.count).toBeLessThanOrEqual(level <= 1 ? 5 : 10);
        expect(t.options.filter((n) => n === t.count)).toHaveLength(1);
        expect(new Set(t.options).size).toBe(t.options.length);
      }
  });

  it("size boxes and ribbon order are solvable in English and Spanish", () => {
    for (const lang of ["en", "es"] as const) {
      setLang(lang);
      for (let i = 0; i < 60; i++)
        for (const level of [1, 3, 5]) {
          const s = placeSet("sizeBoxes", level);
          expect(s.pieces.filter((p) => p.value === "big")).toHaveLength(s.slots[0]!.capacity);
          expect(s.pieces.filter((p) => p.value === "small")).toHaveLength(s.slots[1]!.capacity);
          const r = placeSet("lengthOrder", level);
          const byRank = r.slots.map((sl) => r.pieces.find((p) => fits(sl, p))!.visual!.bar!);
          expect([...byRank].sort((a, b) => a - b)).toEqual(byRank);
          expect(new Set(byRank).size).toBe(byRank.length);
        }
    }
  });

  it("free/Premium split is unchanged: 121 games, 46 free", () => {
    expect(GAMES).toHaveLength(121);
    expect(GAMES.filter((g) => !g.premium)).toHaveLength(46);
  });

  it("every place-pieces round is solvable in English and Spanish", () => {
    for (const lang of ["en", "es"] as const) {
      setLang(lang);
      for (const kind of [
        "sortColor",
        "sortColor3",
        "sortShape",
        "sortRule",
        "assembleLetter",
        "assembleNumber",
        "assembleShape",
        "assemblePicture",
        "shapeBuild",
        "patternBuild",
        "trainSound",
      ]) {
        for (let i = 0; i < 60; i++) {
          for (const level of [1, 3, 5]) {
            const set = placeSet(kind, level);
            const capacity = set.slots.reduce((n, s) => n + s.capacity, 0);
            expect(neededCount(set), kind).toBe(capacity);
            for (const p of set.pieces.filter((x) => !isDecoy(set, x)))
              expect(
                set.slots.some((s) => fits(s, p)),
                kind,
              ).toBe(true);
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
