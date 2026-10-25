import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CELLS_PER_SLOT, cellsInBrush, letterCoverage, nearLetterInk, paintCells, startTrace, wordBrushRadius, wordTouchAllowance, wordFrameLayout,
  type TraceState, type WordFrameLayout,
} from "@/lib/word-trace";
import { L } from "@/lib/i18n";

const DPR = 2;
const cssVar = (name: string, fallback: string) =>
  (typeof window !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) || fallback;

interface Props {
  letters: string[];
  reducedMotion: boolean;
  onLetter: (index: number, glyph: string) => void;
  onWord: () => void;
}

/** The whole word on one baseline; letters finish one at a time, left to right. */
export function WordTraceFrame({ letters, reducedMotion, onLetter, onWord }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const [fontReady, setFontReady] = useState(false);
  const [trace, setTrace] = useState<TraceState>(startTrace);
  const [progress, setProgress] = useState(0);
  const traceRef = useRef(trace);
  const inkCells = useRef<Set<number>[]>([]);
  const glyphMasks = useRef<HTMLCanvasElement[]>([]);
  const strokeCanvas = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const pointer = useRef<number | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const handlers = useRef({ onLetter, onWord });
  handlers.current = { onLetter, onWord };

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setFrameWidth(Math.floor(el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout: WordFrameLayout | null = frameWidth ? wordFrameLayout(letters.length, frameWidth) : null;
  const fontSize = layout ? Math.round(layout.slot * 1.0) : 0;
  const font = `700 ${fontSize}px "Baloo 2", ui-rounded, sans-serif`;
  const baseline = layout ? Math.round(layout.height * 0.72) : 0;

  useEffect(() => {
    if (!fontSize) return;
    let alive = true;
    const fonts = document.fonts;
    (fonts ? fonts.load(font, letters.join("")).then(() => fonts.ready) : Promise.resolve())
      .catch(() => undefined)
      .then(() => alive && setFontReady(true));
    return () => { alive = false; };
  }, [font, fontSize, letters]);

  // Measure each letter's ink cells after the font has loaded.
  useEffect(() => {
    if (!layout || !fontReady) return;
    const cell = layout.slot / CELLS_PER_SLOT;
    const cols = Math.ceil(layout.width / cell);
    const off = document.createElement("canvas");
    off.width = layout.width;
    off.height = layout.height;
    const ctx = off.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const offsetX = (layout.width - layout.slot * letters.length) / 2;
    inkCells.current = letters.map((glyph, i) => {
      ctx.clearRect(0, 0, off.width, off.height);
      ctx.fillStyle = cssVar("--ink", "#4a3a2c");
      ctx.fillText(glyph, offsetX + layout.slot * (i + 0.5), baseline);
      const data = ctx.getImageData(0, 0, off.width, off.height).data;
      const set = new Set<number>();
      for (let y = 0; y < off.height; y += 2)
        for (let x = 0; x < off.width; x += 2)
          if ((data[(y * off.width + x) * 4 + 3] ?? 0) > 128) set.add(Math.floor(y / cell) * cols + Math.floor(x / cell));
      return set;
    });
    glyphMasks.current = letters.map((glyph, i) => {
      const mask = document.createElement("canvas");
      mask.width = layout.width * DPR;
      mask.height = layout.height * DPR;
      const maskCtx = mask.getContext("2d");
      if (maskCtx) {
        maskCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
        maskCtx.font = font;
        maskCtx.textAlign = "center";
        maskCtx.textBaseline = "alphabetic";
        maskCtx.fillText(glyph, offsetX + layout.slot * (i + 0.5), baseline);
      }
      return mask;
    });
    const stroke = document.createElement("canvas");
    stroke.width = layout.width * DPR;
    stroke.height = layout.height * DPR;
    strokeCanvas.current = stroke;
  }, [layout?.width, layout?.slot, layout?.height, fontReady, font, baseline, letters]);

  // Guides and letters (redrawn as the active letter changes).
  useEffect(() => {
    const canvas = bgRef.current;
    if (!layout || !fontReady || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, layout.width, layout.height);
    ctx.font = font;
    const cap = ctx.measureText("H").actualBoundingBoxAscent || fontSize * 0.7;
    const xh = ctx.measureText("x").actualBoundingBoxAscent || fontSize * 0.45;
    const soft = cssVar("--inksoft", "#8a7a6a");
    ctx.lineWidth = 2;
    ctx.strokeStyle = soft;
    for (const [y, dash] of [[baseline - cap, [8, 8]], [baseline - xh, [4, 8]], [baseline, []]] as const) {
      ctx.globalAlpha = dash.length ? 0.4 : 0.7;
      ctx.setLineDash([...dash]);
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(layout.width - 8, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    const offsetX = (layout.width - layout.slot * letters.length) / 2;
    const felt = cssVar("--felt", "#eee3cf");
    const ink = cssVar("--ink", "#4a3a2c");
    letters.forEach((glyph, i) => {
      const done = i < trace.active || trace.finished;
      const active = i === trace.active && !trace.finished;
      ctx.globalAlpha = active || done ? 1 : 0.22;
      ctx.fillStyle = active || done ? felt : soft;
      if (active) {
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.strokeStyle = ink;
        ctx.strokeText(glyph, offsetX + layout.slot * (i + 0.5), baseline);
      }
      // The opaque fill hides the font's overlapping internal stroke contours.
      ctx.globalAlpha = active || done ? 1 : 0.22;
      ctx.fillText(glyph, offsetX + layout.slot * (i + 0.5), baseline);
    });
    ctx.globalAlpha = 1;
  }, [layout?.width, layout?.height, layout?.slot, fontReady, font, fontSize, baseline, letters, trace.active, trace.finished]);

  // Keep the active letter in view when the word is wider than the screen.
  useEffect(() => {
    const el = scrollRef.current;
    if (!layout?.scrolls || !el) return;
    const offsetX = (layout.width - layout.slot * letters.length) / 2;
    const center = offsetX + layout.slot * (trace.active + 0.5);
    el.scrollTo({ left: Math.max(0, center - el.clientWidth / 2), behavior: reducedMotion ? "auto" : "smooth" });
  }, [trace.active, layout?.scrolls, layout?.width, layout?.slot, letters.length, reducedMotion]);

  const paint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || pointer.current !== event.pointerId || !layout || !inkCells.current.length) return;
    const canvas = inkRef.current;
    const ctx = canvas?.getContext("2d");
    const activeInk = inkCells.current[traceRef.current.active];
    const mask = glyphMasks.current[traceRef.current.active];
    const stroke = strokeCanvas.current;
    const strokeCtx = stroke?.getContext("2d");
    if (!canvas || !ctx || !activeInk || !mask || !stroke || !strokeCtx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * layout.width;
    const y = ((event.clientY - rect.top) / rect.height) * layout.height;
    const radius = wordBrushRadius(layout.slot);
    const cell = layout.slot / CELLS_PER_SLOT;
    const cols = Math.ceil(layout.width / cell);
    const margin = wordTouchAllowance(layout.slot);
    if (!nearLetterInk(x, y, activeInk, cell, cols, margin)) {
      // Break interpolation across the gap, not pointer capture: re-entry resumes without lifting.
      last.current = null;
      return;
    }
    const colour = cssVar("--clay", "#d9714f");
    const from = last.current ?? { x, y };
    last.current = { x, y };
    strokeCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    strokeCtx.globalCompositeOperation = "source-over";
    strokeCtx.clearRect(0, 0, layout.width, layout.height);
    strokeCtx.fillStyle = colour;
    // Sample along the stroke so a fast finger leaves no gaps.
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (cell * 0.5)));
    const cells: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const px = from.x + ((x - from.x) * i) / steps;
      const py = from.y + ((y - from.y) * i) / steps;
      if (!nearLetterInk(px, py, activeInk, cell, cols, margin)) continue;
      strokeCtx.beginPath();
      strokeCtx.arc(px, py, radius, 0, Math.PI * 2);
      strokeCtx.fill();
      cells.push(...cellsInBrush(px, py, radius, cell, cols));
    }
    // Mask only this stroke, not the persistent canvas: finished letters keep their ink.
    strokeCtx.setTransform(1, 0, 0, 1, 0, 0);
    strokeCtx.globalCompositeOperation = "destination-in";
    strokeCtx.drawImage(mask, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(stroke, 0, 0);
    const { state, completedLetter } = paintCells(traceRef.current, cells, inkCells.current);
    if (state === traceRef.current) return;
    traceRef.current = state;
    const nextInk = inkCells.current[state.active];
    setProgress(state.finished ? 100 : nextInk ? Math.round(letterCoverage(state, nextInk) * 100) : 0);
    if (completedLetter !== null) {
      setTrace(state);
      const glyph = letters[completedLetter];
      if (glyph) handlers.current.onLetter(completedLetter, glyph);
      if (state.finished) {
        drawing.current = false;
        handlers.current.onWord();
      } else {
        last.current = null;
      }
    }
  };

  const offsetX = layout ? (layout.width - layout.slot * letters.length) / 2 : 0;

  return (
    <div ref={wrapRef} className="mt-4 w-full">
      <div ref={scrollRef} className="overflow-x-auto rounded-3xl bg-card wood-block">
        {layout && (
          <div style={{ width: layout.width }}>
            <div className="relative" style={{ width: layout.width, height: layout.height }}>
              <canvas
                ref={bgRef}
                width={layout.width * DPR}
                height={layout.height * DPR}
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden
              />
              <canvas
                ref={inkRef}
                width={layout.width * DPR}
                height={layout.height * DPR}
                aria-label={L(`Trace ${letters.join("")}`, `Traza ${letters.join("")}`)}
                className="absolute inset-0 h-full w-full touch-none"
                onPointerDown={(event) => {
                  if (traceRef.current.finished || pointer.current !== null) return;
                  pointer.current = event.pointerId;
                  drawing.current = true;
                  last.current = null;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  paint(event);
                }}
                onPointerMove={paint}
                onPointerUp={(event) => { if (pointer.current !== event.pointerId) return; drawing.current = false; pointer.current = null; last.current = null; }}
                onPointerCancel={(event) => { if (pointer.current !== event.pointerId) return; drawing.current = false; pointer.current = null; last.current = null; }}
                onLostPointerCapture={() => { drawing.current = false; pointer.current = null; last.current = null; }}
              />
            </div>
            <div className="flex pb-2" style={{ paddingLeft: offsetX }} aria-hidden>
              {letters.map((glyph, i) => (
                <span key={`${glyph}-${i}`} className="grid h-7 place-items-center font-ui text-xl font-bold text-moss" style={{ width: layout.slot }}>
                  {i < trace.active || trace.finished ? "✓" : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-felt" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
