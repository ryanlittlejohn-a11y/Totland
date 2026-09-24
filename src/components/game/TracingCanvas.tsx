import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { L } from "@/lib/i18n";

export function TracingCanvas({ glyph, onDone }: { glyph: string; onDone: (good: boolean) => void }) {
  const [coverage, setCoverage] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const painted = useRef(new Set<string>());

  const reset = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    painted.current = new Set();
    setCoverage(0);
  };

  const paint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    context.fillStyle = "oklch(0.68 0.148 32)";
    context.beginPath();
    context.arc(x, y, 14, 0, Math.PI * 2);
    context.fill();
    painted.current.add(`${Math.round(x / 20)}:${Math.round(y / 20)}`);
    setCoverage(Math.min(100, Math.round((painted.current.size / 34) * 100)));
  };

  return (
    <>
      <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-3xl bg-card wood-block">
        <span className="pointer-events-none absolute inset-0 grid place-items-center font-ui text-[16rem] font-bold leading-none text-felt" aria-hidden>
          {glyph}
        </span>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          aria-label={L(`Trace ${glyph}`, `Traza ${glyph}`)}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={(event) => {
            drawing.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            paint(event);
          }}
          onPointerMove={paint}
          onPointerUp={() => { drawing.current = false; }}
          onPointerCancel={() => { drawing.current = false; }}
          onPointerLeave={() => { drawing.current = false; }}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-felt" role="progressbar" aria-valuenow={coverage} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${coverage}%` }} />
        </div>
        <Button type="button" variant="secondary" size="lg" onClick={reset} className="wood-block">{L("Clear", "Borrar")}</Button>
        <Button
          type="button"
          size="lg"
          onClick={() => {
            const good = coverage >= 55;
            onDone(good);
            if (!good) reset();
          }}
          className="bg-clay font-ui font-bold text-primary-foreground wood-block"
        >
          {L("Done", "Listo")}
        </Button>
      </div>
    </>
  );
}