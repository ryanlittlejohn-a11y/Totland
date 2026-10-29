import { describe, expect, it } from "vitest";
import { PUZZLES } from "./connect-dots";
import {
  MARGIN,
  PAPERS,
  buildPages,
  contentArea,
  drawItem,
  isFreeSheet,
  isSheetLocked,
  loadTraceStyle,
  opPoints,
  pageCount,
  perPageOptions,
  sheetItems,
  sheetTitle,
  slots,
  type PaperId,
  type SheetOptions,
} from "./printables";
import { renderPdf } from "./printables-pdf";
import { GAMES } from "./catalog";

const base = (paper: PaperId, perPage: 1 | 2 = 1, nameLine = true): SheetOptions => ({ paper, perPage, nameLine, lang: "en" });

describe("layout", () => {
  for (const paper of ["letter", "a4"] as PaperId[]) {
    it(`every sheet stays inside 0.5in margins on ${paper}, 1 and 2 per page`, () => {
      const { w, h } = PAPERS[paper];
      for (const per of [1, 2] as const) {
        const items = [...sheetItems("dots"), ...sheetItems("lines"), ...sheetItems("shapes"), ...sheetItems("numbers")];
        for (const page of buildPages(items, base(paper, per))) {
          for (const op of page.ops)
            for (const p of opPoints(op)) {
              expect(p.x).toBeGreaterThanOrEqual(MARGIN - 0.01);
              expect(p.x).toBeLessThanOrEqual(w - MARGIN + 0.01);
              expect(p.y).toBeGreaterThanOrEqual(MARGIN - 0.01);
              expect(p.y).toBeLessThanOrEqual(h - MARGIN + 6);
            }
        }
      }
    });
  }
  for (const paper of ["letter", "a4"] as PaperId[]) {
    it(`dotted outline also stays inside margins on ${paper}`, () => {
      const { w, h } = PAPERS[paper];
      const items = [...sheetItems("lines"), ...sheetItems("shapes"), ...sheetItems("numbers")];
      for (const page of buildPages(items, { ...base(paper), traceStyle: "dot" })) {
        for (const op of page.ops)
          for (const p of opPoints(op)) {
            expect(p.x).toBeGreaterThanOrEqual(MARGIN - 0.01);
            expect(p.x).toBeLessThanOrEqual(w - MARGIN + 0.01);
            expect(p.y).toBeGreaterThanOrEqual(MARGIN - 0.01);
            expect(p.y).toBeLessThanOrEqual(h - MARGIN + 6);
          }
      }
    });
  }
  it("two slots split the area without overlap", () => {
    const [a, b] = slots(contentArea(base("letter")), 2);
    expect(a!.y + a!.h).toBeLessThan(b!.y);
  });
  it("letter and a4 sizes", () => {
    expect(PAPERS.letter).toEqual({ w: 612, h: 792 });
    expect(Math.round(PAPERS.a4.w)).toBe(595);
  });
});

describe("free samples", () => {
  it("first 3 by level are free per type, the rest lock without Premium", () => {
    for (const t of ["dots", "lines", "shapes", "numbers"] as const) {
      const items = sheetItems(t);
      expect(items.filter(isFreeSheet)).toHaveLength(3);
      expect(items.slice(0, 3).every((i) => i.level === 1)).toBe(true);
      expect(isSheetLocked(items[3]!, false)).toBe(true);
      expect(isSheetLocked(items[3]!, true)).toBe(false);
      expect(isSheetLocked(items[0]!, false)).toBe(false);
    }
  });
  it("blank page always free", () => {
    expect(isSheetLocked(sheetItems("blank")[0]!, false)).toBe(false);
  });
});

describe("page counts", () => {
  it("1 vs 2 per page", () => {
    expect(pageCount(5, 1)).toBe(5);
    expect(pageCount(5, 2)).toBe(3);
    expect(pageCount(0, 2)).toBe(0);
    const items = sheetItems("dots").slice(0, 5);
    expect(buildPages(items, base("letter", 2))).toHaveLength(3);
    expect(buildPages(items, base("letter", 1))).toHaveLength(5);
  });
  it("blank page is 1 per page only", () => {
    expect(perPageOptions("blank")).toEqual([1]);
    expect(buildPages(sheetItems("blank"), base("a4", 2))).toHaveLength(1);
  });
  it("name line off removes header text; typed name is printed", () => {
    const off = buildPages(sheetItems("blank"), base("letter", 1, false))[0]!;
    expect(off.ops.some((o) => o.t === "text" && o.text === "Name")).toBe(false);
    const on = buildPages(sheetItems("blank"), { ...base("letter"), childName: "Mia" })[0]!;
    expect(on.ops.some((o) => o.t === "text" && o.text === "Mia")).toBe(true);
  });
  it("Trace Shapes and Trace Numbers support 2 per page", () => {
    expect(perPageOptions("shapes")).toEqual([1, 2]);
    expect(perPageOptions("numbers")).toEqual([1, 2]);
    const numbers = sheetItems("numbers").slice(0, 6);
    expect(buildPages(numbers, base("letter", 2))).toHaveLength(3);
    expect(buildPages(numbers, base("letter", 1))).toHaveLength(6);
  });
});

describe("trace style (dashed vs dotted)", () => {
  it("dashed is the default and uses the same sizing as before", () => {
    const page = buildPages(sheetItems("lines").slice(0, 1), base("letter"))[0]!;
    const path = page.ops.find((o) => o.t === "path" && o.dash && o.dash[0] === 6)!;
    expect(path).toBeTruthy();
  });
  it("dotted uses a near-zero dash length (round dots) distinct from dashed", () => {
    const dashed = buildPages(sheetItems("shapes").slice(0, 1), base("letter"))[0]!;
    const dotted = buildPages(sheetItems("shapes").slice(0, 1), { ...base("letter"), traceStyle: "dot" })[0]!;
    const dashedPath = dashed.ops.find((o) => o.t === "path" && o.width === 3)!;
    const dottedPath = dotted.ops.find((o) => o.t === "path" && o.width === 2.5)!;
    expect(dashedPath).toBeTruthy();
    expect(dottedPath).toBeTruthy();
    expect(dottedPath).not.toBe(dashedPath);
  });
  it("defaults to dashed when no device preference is stored", () => {
    expect(loadTraceStyle()).toBe("dash");
  });
});

describe("Trace Shapes / Trace Numbers sheets", () => {
  it("every shape and digit draws a start dot + arrow per stroke, in order", () => {
    for (const t of ["shapes", "numbers"] as const) {
      for (const item of sheetItems(t)) {
        if (item.type !== "shapes" && item.type !== "numbers") continue;
        const ops = drawItem(item, { x: 36, y: 36, w: 200, h: 200 }, "en");
        const dots = ops.filter((o) => o.t === "dot" && o.fill);
        expect(dots.length).toBe(item.character.strokes.length);
      }
    }
  });
  it("Trace Shapes free order matches circle, square, triangle", () => {
    expect(sheetItems("shapes").slice(0, 3).map((i) => i.id)).toEqual(["shape-circle", "shape-square", "shape-triangle"]);
  });
  it("titles use the character's bilingual label", () => {
    const circle = sheetItems("shapes")[0]!;
    expect(sheetTitle(circle, "en")).toContain("circle");
    expect(sheetTitle(circle, "es")).toContain("círculo");
  });
});

describe("pdf output", () => {
  it("has one PDF page per laid-out page and numbers 1..N for a dots puzzle", async () => {
    const puzzle = sheetItems("dots")[0]!;
    const pages = buildPages([puzzle, ...sheetItems("lines").slice(0, 2)], base("letter"));
    const blob = await renderPdf(pages, "letter", false);
    const text = new TextDecoder("latin1").decode(new Uint8Array(await blob.arrayBuffer()));
    expect((text.match(/\/Type \/Page\b/g) ?? []).length).toBe(3);
    const n = (puzzle as { puzzle: (typeof PUZZLES)[number] }).puzzle.points.length;
    for (let i = 1; i <= n; i++) expect(text).toContain(`(${i}) Tj`);
  });
  it("Trace Shapes and Trace Numbers each render one PDF page per sheet", async () => {
    const shapes = sheetItems("shapes").slice(0, 2);
    const numbers = sheetItems("numbers").slice(0, 3);
    const shapesBlob = await renderPdf(buildPages(shapes, base("letter")), "letter", false);
    const numbersBlob = await renderPdf(buildPages(numbers, base("letter")), "letter", false);
    const shapesText = new TextDecoder("latin1").decode(new Uint8Array(await shapesBlob.arrayBuffer()));
    const numbersText = new TextDecoder("latin1").decode(new Uint8Array(await numbersBlob.arrayBuffer()));
    expect((shapesText.match(/\/Type \/Page\b/g) ?? []).length).toBe(2);
    expect((numbersText.match(/\/Type \/Page\b/g) ?? []).length).toBe(3);
  });
});

describe("catalog untouched", () => {
  it("still 126 games, 50 free, 76 Premium", () => {
    expect(GAMES.length).toBe(126);
    expect(GAMES.filter((g) => !g.premium).length).toBe(50);
  });
});
