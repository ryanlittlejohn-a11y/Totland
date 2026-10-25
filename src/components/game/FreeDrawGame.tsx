import { useCallback, useEffect, useRef, useState } from "react";
import {
  beginStroke, CLEAR_CONFIRM_MS, clearStep, emptyDraw, endStroke, loadDrawing, moveStroke,
  saveDrawing, tryFinish, undoStroke, type DrawState, type DrawStroke,
} from "@/lib/free-draw";
import { L } from "@/lib/i18n";
import { useFamily, useProfile } from "@/lib/profile";
import { chime, say } from "@/lib/speech";

/**
 * Free Draw: a blank page with big crayons. Calm and predictable — same
 * layout every time, no timer, no score, no sharing, no saving to photos,
 * no network. The drawing stays on this device only (see free-draw.ts).
 */

// Ten high-contrast paint colours, chosen to stay distinct for colour-blind
// kids (light/dark spread + warm/cool spread). These are paint, not UI theme.
const PALETTE = [
  { id: "black", value: "#1b1b1b", en: "Black", es: "Negro" },
  { id: "white", value: "#ffffff", en: "White", es: "Blanco" },
  { id: "red", value: "#d62828", en: "Red", es: "Rojo" },
  { id: "orange", value: "#f77f00", en: "Orange", es: "Naranja" },
  { id: "yellow", value: "#ffd43b", en: "Yellow", es: "Amarillo" },
  { id: "green", value: "#2f9e44", en: "Green", es: "Verde" },
  { id: "teal", value: "#0c8599", en: "Teal", es: "Turquesa" },
  { id: "blue", value: "#1971c2", en: "Blue", es: "Azul" },
  { id: "purple", value: "#9c36b5", en: "Purple", es: "Morado" },
  { id: "pink", value: "#e64980", en: "Pink", es: "Rosa" },
];

const BRUSHES = [
  { id: "small", size: 7, en: "Small brush", es: "Pincel pequeño" },
  { id: "medium", size: 14, en: "Medium brush", es: "Pincel mediano" },
  { id: "big", size: 24, en: "Big brush", es: "Pincel grande" },
];

/** Replay one stroke onto the canvas (round caps/joins, quadratic smoothing). */
function paintStroke(ctx: CanvasRenderingContext2D, stroke: DrawStroke, fromIndex = 0) {
  const pts = stroke.points;
  if (pts.length === 0) return;
  ctx.save();
  ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (pts.length === 1) {
    // A single tap: a round dot.
    ctx.beginPath();
    ctx.arc(pts[0]!.x, pts[0]!.y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const start = Math.max(0, fromIndex - 1);
    ctx.beginPath();
    ctx.moveTo(pts[start]!.x, pts[start]!.y);
    for (let i = start + 1; i < pts.length - 1; i++) {
      const midX = (pts[i]!.x + pts[i + 1]!.x) / 2;
      const midY = (pts[i]!.y + pts[i + 1]!.y) / 2;
      ctx.quadraticCurveTo(pts[i]!.x, pts[i]!.y, midX, midY);
    }
    const last = pts[pts.length - 1]!;
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
  ctx.restore();
}

export function FreeDrawGame({ onFinish }: { onFinish: (stars: number, accuracy: number) => void }) {
  const { profile, hydrated } = useProfile();
  const { activeId, hydrated: familyHydrated } = useFamily();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<DrawState>(emptyDraw());
  const [version, setVersion] = useState(0); // bump to re-render toolbar state
  const [color, setColor] = useState(PALETTE[0]!.value);
  const [brush, setBrush] = useState(BRUSHES[1]!.size);
  const [erasing, setErasing] = useState(false);
  const [clearArmedAt, setClearArmedAt] = useState<number | null>(null);
  const finishedRef = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const saveTimer = useRef<number | null>(null);
  const loadedFor = useRef<string | null>(null);

  const apply = useCallback((next: DrawState) => {
    if (next === stateRef.current) return;
    stateRef.current = next;
    setVersion((v) => v + 1);
  }, []);

  const fullRedraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stateRef.current.strokes) paintStroke(ctx, s);
    if (stateRef.current.current) paintStroke(ctx, stateRef.current.current);
  }, []);

  // Retina-crisp sizing: backing store matches device pixels.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fullRedraw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [fullRedraw]);

  // Load this child's last drawing once (device-only storage), then keep it saved.
  useEffect(() => {
    if (!familyHydrated || !activeId || loadedFor.current === activeId) return;
    loadedFor.current = activeId;
    stateRef.current = emptyDraw(loadDrawing(activeId));
    setVersion((v) => v + 1);
    fullRedraw();
  }, [familyHydrated, activeId, fullRedraw]);

  useEffect(() => {
    if (!activeId || loadedFor.current !== activeId) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveDrawing(activeId, stateRef.current.strokes), 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [version, activeId]);

  // An armed Clear disarms itself after the confirm window.
  useEffect(() => {
    if (clearArmedAt === null) return;
    const t = window.setTimeout(() => setClearArmedAt(null), CLEAR_CONFIRM_MS);
    return () => window.clearTimeout(t);
  }, [clearArmedAt]);

  const toPoint = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stateRef.current.pointerId !== null) return; // palm / extra finger
    e.currentTarget.setPointerCapture(e.pointerId);
    const style = { color, size: brush, erase: erasing };
    const next = beginStroke(stateRef.current, e.pointerId, toPoint(e), style);
    if (next !== stateRef.current) {
      apply(next);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && next.current) paintStroke(ctx, next.current);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stateRef.current.pointerId !== e.pointerId) return;
    // Coalesced events keep fast little fingers smooth.
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    let before = 0;
    for (const ev of events) {
      const prev = stateRef.current.current?.points.length ?? 0;
      const next = moveStroke(stateRef.current, e.pointerId, toPoint(ev));
      if (next !== stateRef.current) {
        if (!before) before = prev;
        stateRef.current = next;
      }
    }
    const current = stateRef.current.current;
    if (current && before && current.points.length > before) {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) paintStroke(ctx, current, before);
      setVersion((v) => v + 1);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    apply(endStroke(stateRef.current, e.pointerId));
  };

  const onUndo = () => {
    apply(undoStroke(stateRef.current));
    fullRedraw();
  };

  const onClear = () => {
    const result = clearStep(clearArmedAt, Date.now());
    setClearArmedAt(result.armedSince);
    if (!result.cleared) return;
    stateRef.current = emptyDraw();
    setVersion((v) => v + 1);
    fullRedraw();
  };

  const onFinished = () => {
    const r = tryFinish(finishedRef.current);
    finishedRef.current = r.finished;
    if (!r.fired) return;
    chime("correct", profile.sfx);
    say(L("What a lovely drawing!", "¡Qué dibujo tan bonito!"));
    finishRef.current(3, 1);
  };

  if (!hydrated) return null;
  const strokes = stateRef.current.strokes;
  const armed = clearArmedAt !== null;

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">{L("Draw anything you like!", "¡Dibuja lo que quieras!")}</p>
      <div
        ref={wrapRef}
        className="relative mt-4 w-full overflow-hidden rounded-3xl bg-card wood-block"
        style={{ aspectRatio: "4 / 3" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none select-none"
          role="img"
          aria-label={L("Blank page to draw on", "Página en blanco para dibujar")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2" role="toolbar" aria-label={L("Drawing tools", "Herramientas de dibujo")}>
        {PALETTE.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={L(c.en, c.es)}
            aria-pressed={!erasing && color === c.value}
            onClick={() => {
              setColor(c.value);
              setErasing(false);
            }}
            className={`size-11 rounded-full border-4 ${!erasing && color === c.value ? "border-ink" : "border-ink/15"}`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {BRUSHES.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-label={L(b.en, b.es)}
            aria-pressed={!erasing && brush === b.size}
            onClick={() => {
              setBrush(b.size);
              setErasing(false);
            }}
            className={`grid size-12 place-items-center rounded-2xl font-ui ${!erasing && brush === b.size ? "bg-felt text-ink wood-block" : "bg-card text-inksoft"}`}
          >
            <span className="rounded-full bg-ink" style={{ width: b.size / 2 + 4, height: b.size / 2 + 4 }} />
          </button>
        ))}
        <button
          type="button"
          aria-label={L("Eraser", "Borrador")}
          aria-pressed={erasing}
          onClick={() => setErasing((v) => !v)}
          className={`grid size-12 place-items-center rounded-2xl text-2xl ${erasing ? "bg-felt wood-block" : "bg-card"}`}
        >
          🧽
        </button>
        <button
          type="button"
          aria-label={L("Undo last stroke", "Deshacer el último trazo")}
          disabled={strokes.length === 0}
          onClick={onUndo}
          className="grid size-12 place-items-center rounded-2xl bg-card text-2xl disabled:opacity-30"
        >
          ↩️
        </button>
        <button
          type="button"
          aria-label={armed ? L("Tap again to clear the page", "Toca otra vez para borrar la página") : L("Clear the page", "Borrar la página")}
          onClick={onClear}
          className={`min-h-12 rounded-2xl px-4 font-ui text-sm font-bold ${armed ? "bg-clay text-cream" : "bg-card text-inksoft"}`}
        >
          {armed ? L("Tap again!", "¡Toca otra vez!") : L("Clear", "Borrar")}
        </button>
      </div>

      <button
        type="button"
        onClick={onFinished}
        className="mt-4 w-full rounded-2xl bg-felt py-4 font-ui text-lg font-bold text-ink wood-block"
      >
        {L("I'm finished", "Ya terminé")} 🌟
      </button>
    </div>
  );
}
