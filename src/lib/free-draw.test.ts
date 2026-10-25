import { beforeEach, describe, expect, it } from "vitest";

const store = new Map<string, string>();
(globalThis as Record<string, unknown>)["window"] = Object.assign(new EventTarget(), {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
});

const {
  beginStroke, clearAllDrawings, clearExpired, clearStep, deleteDrawing, emptyDraw, endStroke,
  FREE_DRAW_STORAGE_KEY, loadDrawing, MAX_STROKES, MIN_STEP, moveStroke, saveDrawing, tryFinish,
  undoStroke,
} = await import("./free-draw");
const { GAMES, gameById } = await import("./catalog");

const STYLE = { color: "#d62828", size: 10, erase: false };

beforeEach(() => store.clear());

describe("free-draw rules", () => {
  it("single pointer: a second finger is ignored while one is drawing", () => {
    let s = beginStroke(emptyDraw(), 1, { x: 0, y: 0 }, STYLE);
    const afterSecond = beginStroke(s, 2, { x: 50, y: 50 }, STYLE);
    expect(afterSecond).toBe(s);
    s = moveStroke(s, 2, { x: 60, y: 60 }); // wrong pointer: no-op
    expect(s.current!.points).toHaveLength(1);
    s = moveStroke(s, 1, { x: 10, y: 0 });
    expect(s.current!.points).toHaveLength(2);
    s = endStroke(s, 2); // wrong pointer lifting: stroke survives
    expect(s.current).not.toBeNull();
    s = endStroke(s, 1);
    expect(s.strokes).toHaveLength(1);
    expect(s.strokes[0]!.points).toHaveLength(2);
  });

  it("wiggles under MIN_STEP are not recorded; real moves are", () => {
    let s = beginStroke(emptyDraw(), 1, { x: 0, y: 0 }, STYLE);
    s = moveStroke(s, 1, { x: MIN_STEP / 2, y: 0 });
    expect(s.current!.points).toHaveLength(1);
    s = moveStroke(s, 1, { x: MIN_STEP * 2, y: 0 });
    expect(s.current!.points).toHaveLength(2);
  });

  it("undo is multi-step, one committed stroke per tap", () => {
    let s = emptyDraw();
    for (let i = 0; i < 3; i++) {
      s = beginStroke(s, 1, { x: i * 10, y: 0 }, STYLE);
      s = moveStroke(s, 1, { x: i * 10 + 5, y: 5 });
      s = endStroke(s, 1);
    }
    expect(s.strokes).toHaveLength(3);
    s = undoStroke(s);
    s = undoStroke(s);
    expect(s.strokes).toHaveLength(1);
    expect(s.strokes[0]!.points[0]!.x).toBe(0);
    s = undoStroke(s);
    expect(undoStroke(s)).toBe(s); // nothing left: no-op
  });

  it("eraser strokes keep the erase flag through begin/move/end and undo", () => {
    let s = beginStroke(emptyDraw(), 1, { x: 0, y: 0 }, { color: "#000", size: 20, erase: true });
    s = moveStroke(s, 1, { x: 10, y: 10 });
    s = endStroke(s, 1);
    expect(s.strokes[0]!.erase).toBe(true);
    s = undoStroke(s);
    expect(s.strokes).toHaveLength(0);
  });

  it("clear needs a deliberate second tap within the window", () => {
    const first = clearStep(null, 1000);
    expect(first.cleared).toBe(false);
    expect(first.armedSince).toBe(1000);
    const second = clearStep(first.armedSince, 2000);
    expect(second.cleared).toBe(true);
    expect(second.armedSince).toBeNull();
  });

  it("a slow second tap re-arms instead of clearing", () => {
    const first = clearStep(null, 1000);
    const late = clearStep(first.armedSince, 1000 + 4000);
    expect(late.cleared).toBe(false);
    expect(late.armedSince).toBe(4000 + 1000);
    expect(clearExpired(first.armedSince, 1000 + 4000)).toBe(true);
    expect(clearExpired(first.armedSince, 1000 + 1000)).toBe(false);
  });

  it("finish fires exactly once", () => {
    const first = tryFinish(false);
    expect(first.fired).toBe(true);
    const again = tryFinish(first.finished);
    expect(again.fired).toBe(false);
  });

  it("stroke history is capped so storage cannot grow without bound", () => {
    let s = emptyDraw();
    for (let i = 0; i < MAX_STROKES + 20; i++) {
      s = beginStroke(s, 1, { x: i, y: 0 }, STYLE);
      s = endStroke(s, 1);
    }
    expect(s.strokes).toHaveLength(MAX_STROKES);
  });
});

describe("free-draw on-device persistence", () => {
  const strokes = [
    { color: "#d62828", size: 10, erase: false, points: [{ x: 1.234, y: 2.345 }, { x: 9, y: 9 }] },
  ];

  it("saves and loads per child, on-device storage only", () => {
    saveDrawing("child-a", strokes);
    saveDrawing("child-b", []);
    expect(loadDrawing("child-a")).toHaveLength(1);
    expect(loadDrawing("child-a")[0]!.points[0]).toEqual({ x: 1.2, y: 2.3 });
    expect(loadDrawing("child-b")).toEqual([]);
    expect(loadDrawing("child-c")).toEqual([]);
    expect(store.has(FREE_DRAW_STORAGE_KEY)).toBe(true);
    // never touches the family/profile keys
    expect([...store.keys()].filter((k) => k.includes("family") || k.includes("profile"))).toEqual([]);
  });

  it("deleteDrawing removes only that child; clearAllDrawings removes everything", () => {
    saveDrawing("child-a", strokes);
    saveDrawing("child-b", strokes);
    deleteDrawing("child-a");
    expect(loadDrawing("child-a")).toEqual([]);
    expect(loadDrawing("child-b")).toHaveLength(1);
    clearAllDrawings();
    expect(store.has(FREE_DRAW_STORAGE_KEY)).toBe(false);
    expect(loadDrawing("child-b")).toEqual([]);
  });

  it("corrupt stored data falls back to a blank page", () => {
    store.set(FREE_DRAW_STORAGE_KEY, "not json{");
    expect(loadDrawing("child-a")).toEqual([]);
    store.set(FREE_DRAW_STORAGE_KEY, JSON.stringify({ "child-a": [{ bogus: true }] }));
    expect(loadDrawing("child-a")).toEqual([]);
  });
});

describe("Free Draw catalog entry", () => {
  it("is game 125, free, in Color Cove, with its own engine/kind signature", () => {
    const g = gameById("free-draw")!;
    expect(g.number).toBe(125);
    expect(g.title).toBe("Free Draw");
    expect(g.premium).toBe(false);
    expect(g.world).toBe("color-cove");
    expect(`${g.engine}:${g.kind}`).toBe("draw:freeDraw");
    expect(g.ageModes).toEqual(["explorer", "learner", "reader"]);
    expect(GAMES.filter((x) => `${x.engine}:${x.kind}` === "draw:freeDraw")).toHaveLength(1);
  });

  it("totals are now 125 games, 49 free / 76 Premium", () => {
    expect(GAMES).toHaveLength(125);
    expect(GAMES.filter((g) => !g.premium)).toHaveLength(49);
    expect(GAMES.filter((g) => g.premium)).toHaveLength(76);
  });
});
