/**
 * Teachers & printables — pure sheet catalogue, free-sample rules and page
 * layout. Everything here is plain data in PDF points (1/72 in) so it can be
 * tested without a DOM and drawn either as an on-screen SVG thumbnail or by
 * the lazily loaded PDF writer (printables-pdf.ts). Black and white only.
 */
import { PUZZLES, type DotsPuzzle } from "./connect-dots";
import { LINE_PATTERNS, BOARD_W, BOARD_H, type LinePattern, type Pt } from "./line-trace";
import { SHAPE_CHARACTERS, DIGIT_CHARACTERS, DIGIT_GUIDES, characterSamples, type StrokeCharacter } from "./trace-strokes";

// ---- Paper & layout --------------------------------------------------------

export type PaperId = "letter" | "a4";
export const PAPERS: Record<PaperId, { w: number; h: number }> = {
  letter: { w: 612, h: 792 }, // 8.5 × 11 in
  a4: { w: 595.28, h: 841.89 }, // 210 × 297 mm
};
/** 0.5 in / 12.7 mm on every side. */
export const MARGIN = 36;
export const HEADER_H = 44; // name/date line band
export const TITLE_H = 26;
export const FOOTER_H = 18;
export const SLOT_GAP = 18;

/** Photocopy-safe stroke sizes (points). */
export const STYLE = {
  guide: 2.5,
  trace: 3,
  dash: [6, 5] as [number, number],
  /** Dotted alternative for tracing strokes: round dots via a near-zero dash length + round cap. */
  dotWidth: 2.5,
  dotDash: [0.01, 7] as [number, number],
  startDot: 9,
  endRing: 7,
  dot: 5,
  number: 14,
  border: 4,
  title: 15,
  header: 12,
  footer: 9,
} as const;

export type TraceStyle = "dash" | "dot";
/** Stroke width/dash for the tracing sheet types (Line Tracing, Trace Shapes, Trace Numbers). */
const strokeStyle = (s: TraceStyle): { width: number; dash: [number, number] } =>
  s === "dot" ? { width: STYLE.dotWidth, dash: STYLE.dotDash } : { width: STYLE.trace, dash: STYLE.dash };

export type Rect = { x: number; y: number; w: number; h: number };

export type Op =
  | { t: "path"; pts: Pt[]; width: number; dash?: [number, number]; closed?: boolean }
  | { t: "dot"; x: number; y: number; r: number; fill: boolean; width?: number }
  | { t: "text"; x: number; y: number; text: string; size: number; bold?: boolean; align?: "left" | "center" | "right" }
  | { t: "rrect"; x: number; y: number; w: number; h: number; r: number; width: number };

export type Page = { ops: Op[] };

export type SheetOptions = {
  paper: PaperId;
  perPage: 1 | 2;
  nameLine: boolean;
  /** Optional child name typed for this print only — never stored. */
  childName?: string;
  lang: "en" | "es";
  /** Dashed vs dotted outline for tracing sheet types (lines, shapes, numbers). Ignored by dots/blank. */
  traceStyle?: TraceStyle;
};

/** Area left for the activity after margins, header, footer. */
export function contentArea(o: Pick<SheetOptions, "paper" | "nameLine">): Rect {
  const p = PAPERS[o.paper];
  const top = MARGIN + (o.nameLine ? HEADER_H : 0);
  const bottom = p.h - MARGIN - FOOTER_H;
  return { x: MARGIN, y: top, w: p.w - MARGIN * 2, h: bottom - top };
}

/** Stack `n` equal slots vertically inside `area`. */
export function slots(area: Rect, n: 1 | 2): Rect[] {
  const h = (area.h - SLOT_GAP * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: area.x, y: area.y + i * (h + SLOT_GAP), w: area.w, h }));
}

/** Largest rect of aspect w:h centred inside `r`. */
export function fit(r: Rect, w: number, h: number): Rect {
  const s = Math.min(r.w / w, r.h / h);
  const fw = w * s, fh = h * s;
  return { x: r.x + (r.w - fw) / 2, y: r.y + (r.h - fh) / 2, w: fw, h: fh };
}

// ---- Catalogue & free samples ---------------------------------------------

export type SheetType = "dots" | "lines" | "shapes" | "numbers" | "blank";
export const FREE_PER_TYPE = 3;

export type SheetItem =
  | { type: "dots"; id: string; level: number; puzzle: DotsPuzzle }
  | { type: "lines"; id: string; level: number; pattern: LinePattern }
  | { type: "shapes"; id: string; level: number; character: StrokeCharacter }
  | { type: "numbers"; id: string; level: number; character: StrokeCharacter }
  | { type: "blank"; id: string; level: number };

const byLevel = <T extends { level: number }>(list: T[]) =>
  list.map((x, i) => ({ x, i })).sort((a, b) => a.x.level - b.x.level || a.i - b.i).map((e) => e.x);

export function sheetItems(type: SheetType): SheetItem[] {
  if (type === "dots") return byLevel(PUZZLES).map((p) => ({ type: "dots", id: p.id, level: p.level, puzzle: p }));
  if (type === "lines") return byLevel(LINE_PATTERNS).map((p) => ({ type: "lines", id: p.id, level: p.level, pattern: p }));
  if (type === "shapes") return byLevel(SHAPE_CHARACTERS).map((c) => ({ type: "shapes", id: c.id, level: c.level, character: c }));
  if (type === "numbers") return byLevel(DIGIT_CHARACTERS).map((c) => ({ type: "numbers", id: c.id, level: c.level, character: c }));
  return [{ type: "blank", id: "blank", level: 1 }];
}

/** Free = the 3 easiest (first 3 by level) per type; the blank page is always free. */
export function isFreeSheet(item: SheetItem): boolean {
  if (item.type === "blank") return true;
  return sheetItems(item.type).findIndex((s) => s.id === item.id) < FREE_PER_TYPE;
}

export const isSheetLocked = (item: SheetItem, premium: boolean) => !premium && !isFreeSheet(item);

/** Which per-page counts a type supports. */
export const perPageOptions = (type: SheetType): (1 | 2)[] => (type === "blank" ? [1] : [1, 2]);

export function pageCount(selected: number, perPage: 1 | 2, copies = 1): number {
  if (selected <= 0 || copies <= 0) return 0;
  return Math.ceil(selected / perPage) * copies;
}

// ---- Drawing ---------------------------------------------------------------

const map = (box: Rect, bw: number, bh: number) => (p: Pt): Pt => ({ x: box.x + (p.x / bw) * box.w, y: box.y + (p.y / bh) * box.h });

/** Unit arrow head at `at`, pointing along `dir`. */
function arrow(at: Pt, dir: Pt, size: number): Pt[] {
  const len = Math.hypot(dir.x, dir.y) || 1;
  const ux = dir.x / len, uy = dir.y / len;
  const back = { x: at.x - ux * size, y: at.y - uy * size };
  return [
    { x: back.x - uy * size * 0.6, y: back.y + ux * size * 0.6 },
    at,
    { x: back.x + uy * size * 0.6, y: back.y - ux * size * 0.6 },
  ];
}

const T = (lang: "en" | "es", en: string, es: string) => (lang === "es" ? es : en);

export function sheetTitle(item: SheetItem, lang: "en" | "es"): string {
  if (item.type === "dots") return T(lang, `Connect the dots from 1 to ${item.puzzle.points.length}`, `Une los puntos del 1 al ${item.puzzle.points.length}`);
  if (item.type === "lines") return T(lang, "Trace the line from the dot", "Traza la línea desde el punto");
  if (item.type === "shapes" || item.type === "numbers") return T(lang, `Trace the ${item.character.label.en}`, `Traza ${item.character.label.es}`);
  return T(lang, "My drawing", "Mi dibujo");
}

/** Ops for one activity drawn inside `slot` (title on top). */
export function drawItem(item: SheetItem, slot: Rect, lang: "en" | "es", traceStyle: TraceStyle = "dash"): Op[] {
  const ops: Op[] = [{ t: "text", x: slot.x + slot.w / 2, y: slot.y + STYLE.title, text: sheetTitle(item, lang), size: STYLE.title, bold: true, align: "center" }];
  const body: Rect = { x: slot.x, y: slot.y + TITLE_H, w: slot.w, h: slot.h - TITLE_H };

  if (item.type === "blank") {
    ops.push({ t: "rrect", ...body, r: 18, width: STYLE.border });
    return ops;
  }

  if (item.type === "dots") {
    const pad = 22; // room for numbers outside dots at the board edge
    const box = fit({ x: body.x + pad, y: body.y + pad, w: body.w - pad * 2, h: body.h - pad * 2 }, 100, 100);
    const m = map(box, 100, 100);
    const pts = item.puzzle.points.map(m);
    const c = pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }), { x: 0, y: 0 });
    pts.forEach((p, i) => {
      ops.push({ t: "dot", x: p.x, y: p.y, r: STYLE.dot, fill: true });
      const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy) || 1;
      const off = STYLE.dot + 10;
      ops.push({ t: "text", x: p.x + (dx / d) * off, y: p.y + (dy / d) * off + STYLE.number * 0.35, text: String(i + 1), size: STYLE.number, bold: true, align: "center" });
    });
    return ops;
  }

  if (item.type === "shapes" || item.type === "numbers") {
    const pad = 16;
    const box = fit({ x: body.x + pad, y: body.y + pad, w: body.w - pad * 2, h: body.h - pad * 2 }, BOARD_W, BOARD_H);
    const m = map(box, BOARD_W, BOARD_H);
    const { width, dash } = strokeStyle(traceStyle);
    if (item.character.guides) {
      for (const gy of DIGIT_GUIDES) {
        const a = m({ x: 8, y: gy }), b = m({ x: BOARD_W - 8, y: gy });
        ops.push({ t: "path", pts: [a, b], width: 0.75, dash: [3, 3] });
      }
    }
    for (const stroke of characterSamples(item.character)) {
      const pts = stroke.map(m);
      ops.push({ t: "path", pts, width, dash });
      const s = pts[0]!;
      const ahead = pts[Math.min(pts.length - 1, 4)]!;
      const dir = { x: ahead.x - s.x, y: ahead.y - s.y };
      const len = Math.hypot(dir.x, dir.y) || 1;
      ops.push({ t: "dot", x: s.x, y: s.y, r: STYLE.startDot, fill: true });
      const tip = { x: s.x + (dir.x / len) * (STYLE.startDot + 16), y: s.y + (dir.y / len) * (STYLE.startDot + 16) };
      ops.push({ t: "path", pts: arrow(tip, dir, 8), width: STYLE.guide });
    }
    return ops;
  }

  // Line tracing: dashed/dotted path, filled start dot + arrow, open end ring.
  const pad = 16;
  const box = fit({ x: body.x + pad, y: body.y + pad, w: body.w - pad * 2, h: body.h - pad * 2 }, BOARD_W, BOARD_H);
  const m = map(box, BOARD_W, BOARD_H);
  const pts = item.pattern.points.map(m);
  const { width, dash } = strokeStyle(traceStyle);
  ops.push({ t: "path", pts, width, dash });
  const s = pts[0]!, e = pts[pts.length - 1]!;
  const ahead = pts[Math.min(pts.length - 1, 4)]!;
  ops.push({ t: "dot", x: s.x, y: s.y, r: STYLE.startDot, fill: true });
  const dir = { x: ahead.x - s.x, y: ahead.y - s.y };
  const len = Math.hypot(dir.x, dir.y) || 1;
  const tip = { x: s.x + (dir.x / len) * (STYLE.startDot + 16), y: s.y + (dir.y / len) * (STYLE.startDot + 16) };
  ops.push({ t: "path", pts: arrow(tip, dir, 8), width: STYLE.guide });
  ops.push({ t: "dot", x: e.x, y: e.y, r: STYLE.endRing, fill: false, width: STYLE.guide });
  return ops;
}

function header(o: SheetOptions): Op[] {
  const p = PAPERS[o.paper];
  const y = MARGIN + 22;
  const nameLabel = T(o.lang, "Name", "Nombre");
  const dateLabel = T(o.lang, "Date", "Fecha");
  const split = MARGIN + (p.w - MARGIN * 2) * 0.62;
  const ops: Op[] = [
    { t: "text", x: MARGIN, y, text: nameLabel, size: STYLE.header, bold: true },
    { t: "path", pts: [{ x: MARGIN + 52, y: y + 3 }, { x: split - 14, y: y + 3 }], width: 1.5 },
    { t: "text", x: split, y, text: dateLabel, size: STYLE.header, bold: true },
    { t: "path", pts: [{ x: split + 42, y: y + 3 }, { x: p.w - MARGIN, y: y + 3 }], width: 1.5 },
  ];
  const name = (o.childName ?? "").trim().slice(0, 40);
  if (name) ops.push({ t: "text", x: MARGIN + 58, y: y - 2, text: name, size: STYLE.header + 2 });
  return ops;
}

function footer(o: SheetOptions): Op[] {
  const p = PAPERS[o.paper];
  return [{ t: "text", x: p.w / 2, y: p.h - MARGIN + 4, text: "TotLand", size: STYLE.footer, align: "center" }];
}

/** Lay out the selection into pages (selection order kept, `copies` repeats the whole set). */
export function buildPages(items: SheetItem[], o: SheetOptions, copies = 1): Page[] {
  const perPage: 1 | 2 = items.some((i) => i.type === "blank") ? 1 : o.perPage;
  const area = contentArea(o);
  const pages: Page[] = [];
  for (let c = 0; c < copies; c++) {
    for (let i = 0; i < items.length; i += perPage) {
      const group = items.slice(i, i + perPage);
      const ss = slots(area, perPage);
      const ops: Op[] = [...(o.nameLine ? header(o) : []), ...footer(o)];
      group.forEach((it, k) => ops.push(...drawItem(it, ss[k]!, o.lang, o.traceStyle ?? "dash")));
      pages.push({ ops });
    }
  }
  return pages;
}

/** Every point an op touches — used by tests to prove nothing leaves the margins. */
export function opPoints(op: Op): Pt[] {
  if (op.t === "path") return op.pts;
  if (op.t === "dot") return [{ x: op.x - op.r, y: op.y - op.r }, { x: op.x + op.r, y: op.y + op.r }];
  if (op.t === "rrect") return [{ x: op.x, y: op.y }, { x: op.x + op.w, y: op.y + op.h }];
  return [{ x: op.x, y: op.y }];
}

// ---- Device preference (paper only; never the child's name) ---------------

export const PAPER_PREF_KEY = "totland.printpaper.v1";
export function loadPaper(): PaperId {
  try {
    return localStorage.getItem(PAPER_PREF_KEY) === "a4" ? "a4" : "letter";
  } catch {
    return "letter";
  }
}
export function savePaper(p: PaperId) {
  try {
    localStorage.setItem(PAPER_PREF_KEY, p);
  } catch {
    /* ignore */
  }
}

export const TRACE_STYLE_PREF_KEY = "totland.tracestyle.v1";
export function loadTraceStyle(): TraceStyle {
  try {
    return localStorage.getItem(TRACE_STYLE_PREF_KEY) === "dot" ? "dot" : "dash";
  } catch {
    return "dash";
  }
}
export function saveTraceStyle(s: TraceStyle) {
  try {
    localStorage.setItem(TRACE_STYLE_PREF_KEY, s);
  } catch {
    /* ignore */
  }
}
