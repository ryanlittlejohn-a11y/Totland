import { useEffect, useRef, useState } from "react";
import { LETTERS, pick } from "@/lib/content";
import { chime, say } from "@/lib/speech";
import { recordAnswer, recordGameComplete, useProfile } from "@/lib/profile";

export function TracingGame({ onFinish }: { onFinish: (stars: number) => void }) {
  const { profile, update, hydrated } = useProfile();
  const [letter, setLetter] = useState("A");
  const [lower, setLower] = useState(false);
  const [coverage, setCoverage] = useState(0);
  const [done, setDone] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const painted = useRef(new Set<string>());

  useEffect(() => {
    if (!hydrated) return;
    const l = pick(LETTERS);
    setLetter(l);
    say(`Let's trace the letter ${l}. Follow the line with your finger.`);
  }, [hydrated]);

  const reset = () => {
    const c = canvasRef.current;
    if (c) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    painted.current = new Set();
    setCoverage(0);
  };

  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "oklch(0.68 0.148 32)";
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    painted.current.add(`${Math.round(x / 20)}:${Math.round(y / 20)}`);
    setCoverage(Math.min(100, Math.round((painted.current.size / 34) * 100)));
  };

  const finishLetter = () => {
    const good = coverage >= 55;
    update((p) => recordAnswer(p, { skill: "tracing", correct: good, responseMs: 4000, itemId: letter }));
    chime(good ? "correct" : "retry", profile.sfx);
    say(good ? `Beautiful ${letter}! Great job!` : "Great try! Let's trace it again.");
    if (!good) {
      reset();
      return;
    }
    const next = done + 1;
    setDone(next);
    reset();
    if (next >= 3) {
      update((p) => recordGameComplete(p, "tracing", 3, 2));
      onFinish(3);
    } else {
      const l = pick(LETTERS);
      setLetter(l);
      setLower((v) => !v);
      say(`Now trace ${l}.`);
    }
  };

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">
        Trace the letter {lower ? letter.toLowerCase() : letter}
      </p>
      <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-3xl bg-card wood-block">
        <span
          className="pointer-events-none absolute inset-0 grid place-items-center font-ui font-bold text-felt"
          style={{ fontSize: "16rem", lineHeight: 1 }}
          aria-hidden
        >
          {lower ? letter.toLowerCase() : letter}
        </span>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={(e) => {
            drawing.current = true;
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
            paint(e);
          }}
          onPointerMove={paint}
          onPointerUp={() => (drawing.current = false)}
          onPointerLeave={() => (drawing.current = false)}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-felt">
          <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${coverage}%` }} />
        </div>
        <button type="button" onClick={reset} className="rounded-2xl bg-card px-4 py-3 font-ui font-semibold wood-block">
          Clear
        </button>
        <button
          type="button"
          onClick={finishLetter}
          className="rounded-2xl bg-clay px-5 py-3 font-ui font-bold text-primary-foreground wood-block"
        >
          Done
        </button>
      </div>
    </div>
  );
}
