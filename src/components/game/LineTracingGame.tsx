import { useEffect, useMemo, useRef, useState } from "react";
import { usePathTrace } from "@/hooks/usePathTrace";
import {
  BOARD_H, BOARD_W, arrowsAlong, dealLines, samplePath, startLine, toleranceFor, traceStep,
  type LinePattern, type LineTheme, type LineTraceState, type Pt,
} from "@/lib/line-trace";
import { L } from "@/lib/i18n";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { chime, say } from "@/lib/speech";

const PROMPT = () => L("Put your finger on the green dot and follow the line.", "Pon tu dedo en el punto verde y sigue la línea.");
const PRAISE = () => L("You followed the line!", "¡Seguiste la línea!");

/** Simple original drawings (board units, centred on 0,0). */
function Traveler({ theme }: { theme: LineTheme }) {
  if (theme === "car")
    return (
      <g>
        <rect x={-6} y={-5} width={12} height={5} rx={1.5} className="fill-clay" />
        <rect x={-3.5} y={-8} width={7} height={3.5} rx={1.2} className="fill-clay" />
        <circle cx={-3.5} cy={0.5} r={1.8} className="fill-ink" />
        <circle cx={3.5} cy={0.5} r={1.8} className="fill-ink" />
      </g>
    );
  if (theme === "bee")
    return (
      <g>
        <ellipse cx={-1.5} cy={-4.5} rx={2.5} ry={2} className="fill-card stroke-inksoft" strokeWidth={0.4} />
        <ellipse cx={1.5} cy={-4.5} rx={2.5} ry={2} className="fill-card stroke-inksoft" strokeWidth={0.4} />
        <ellipse cx={0} cy={0} rx={5} ry={3.4} className="fill-amber" />
        <rect x={-1.2} y={-3.3} width={1.4} height={6.6} className="fill-ink" />
        <rect x={1.8} y={-3} width={1.2} height={6} className="fill-ink" />
      </g>
    );
  if (theme === "fish")
    return (
      <g>
        <polygon points="-8,-3.5 -4,0 -8,3.5" className="fill-sky" />
        <ellipse cx={0} cy={0} rx={5.5} ry={3.6} className="fill-sky" />
        <circle cx={2.8} cy={-0.8} r={0.8} className="fill-ink" />
      </g>
    );
  if (theme === "snail")
    return (
      <g>
        <rect x={-6} y={-1.5} width={12} height={3} rx={1.5} className="fill-amber" />
        <circle cx={-0.5} cy={-4} r={4} className="fill-clay" />
        <circle cx={-0.5} cy={-4} r={1.8} className="fill-card" />
        <line x1={5} y1={-1.5} x2={6.5} y2={-5} className="stroke-ink" strokeWidth={0.6} />
      </g>
    );
  return <circle r={3.2} className="fill-clay" />;
}

function Goal({ theme }: { theme: LineTheme }) {
  if (theme === "car")
    return (
      <g>
        <rect x={-5.5} y={-6} width={11} height={8} className="fill-amber" />
        <polygon points="-7,-6 0,-12 7,-6" className="fill-clay" />
        <rect x={-1.5} y={-2} width={3} height={4} className="fill-ink" />
      </g>
    );
  if (theme === "bee" || theme === "snail")
    return (
      <g>
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 3.2} cy={Math.sin((a * Math.PI) / 180) * 3.2} r={2.4} className={theme === "bee" ? "fill-plum" : "fill-moss"} />
        ))}
        <circle r={2} className="fill-amber" />
      </g>
    );
  if (theme === "fish")
    return (
      <g>
        <circle cx={0} cy={0} r={2.2} className="fill-none stroke-sky" strokeWidth={0.8} />
        <circle cx={3} cy={-4} r={1.4} className="fill-none stroke-sky" strokeWidth={0.7} />
        <circle cx={-2} cy={-6.5} r={1} className="fill-none stroke-sky" strokeWidth={0.6} />
      </g>
    );
  return <polygon points="0,-5 1.5,-1.6 5,-1.5 2.3,0.8 3.1,4.5 0,2.4 -3.1,4.5 -2.3,0.8 -5,-1.5 -1.5,-1.6" className="fill-amber" />;
}

const pathD = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

export function LineTracingGame({ onFinish }: { onFinish: (stars: number, accuracy: number) => void }) {
  const { profile, update, hydrated } = useProfile();
  const [lines, setLines] = useState<LinePattern[]>([]);
  const [index, setIndex] = useState(0);
  const [trace, setTrace] = useState<LineTraceState>(startLine);
  const [showPicture, setShowPicture] = useState(false);
  const traceRef = useRef(trace);
  const finished = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const level = useRef(1);

  // Dealt once and frozen for the game's lifetime.
  useEffect(() => {
    if (!hydrated || lines.length) return;
    level.current = skillOf(profile, "tracing").level;
    setLines(dealLines(level.current));
    say(PROMPT());
  }, [hydrated, lines.length, profile]);

  const pattern = lines[index];
  const samples = useMemo(() => (pattern ? samplePath(pattern.points) : []), [pattern]);
  const arrows = useMemo(() => arrowsAlong(samples), [samples]);
  const tolerance = toleranceFor(level.current);

  const { boardRef, boardProps, livePos } = usePathTrace({
    points: [],
    radius: 0,
    enabled: !!pattern && !trace.done,
    onStart: () => true,
    onEnter: () => true,
  });

  useEffect(() => {
    if (!livePos || !pattern) return;
    // The hook reports 0–100 on both axes; the board is 100 × 70.
    const finger = { x: (livePos.x / 100) * BOARD_W, y: (livePos.y / 100) * BOARD_H };
    const { state, completed } = traceStep(traceRef.current, samples, finger, tolerance);
    if (state === traceRef.current) return;
    traceRef.current = state;
    setTrace(state);
    if (!completed) return;
    update((current) => recordAnswer(current, { skill: "tracing", correct: true, responseMs: 4000, itemId: `line:${pattern.id}` }));
    chime("correct", profile.sfx);
    say(PRAISE());
    setShowPicture(true);
    const next = index + 1;
    if (next >= lines.length) {
      if (finished.current) return;
      finished.current = true;
      window.setTimeout(() => {
        update((current) => recordGameComplete(current, "tracing", 3, 2));
        finishRef.current(3, 1);
      }, profile.reducedMotion ? 900 : 1600);
      return;
    }
    window.setTimeout(() => {
      traceRef.current = startLine();
      setTrace(traceRef.current);
      setShowPicture(false);
      setIndex(next);
      say(PROMPT());
    }, profile.reducedMotion ? 900 : 1600);
  }, [livePos]);

  if (!hydrated || !pattern) return null;
  const start = samples[0]!;
  const end = samples[samples.length - 1]!;
  const head = samples[trace.head]!;
  const prev = samples[Math.max(0, trace.head - 2)]!;
  const facing = head.x < prev.x - 0.2 ? -1 : 1;

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">{L("Follow the line", "Sigue la línea")}</p>
      <p className="mt-1 font-ui text-sm text-inksoft">{index + 1} / {lines.length}</p>
      <div
        ref={boardRef}
        {...boardProps}
        className="relative mt-4 w-full touch-none select-none overflow-hidden rounded-3xl bg-card wood-block"
        style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}` }}
        role="img"
        aria-label={L("Dotted line to follow from the green dot", "Línea punteada para seguir desde el punto verde")}
      >
        <svg viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          {pattern.theme === "car" && (
            <path d={pathD(samples)} className="fill-none stroke-felt" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          )}
          <path d={pathD(samples)} className="fill-none stroke-inksoft" strokeWidth={1.4} strokeDasharray="2.4 2.2" strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
          {arrows.map((a, i) => (
            <polyline key={i} points="-1.4,-1.6 0.8,0 -1.4,1.6" transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`} className="fill-none stroke-inksoft" strokeWidth={0.7} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
          ))}
          {trace.head > 0 && (
            <path d={pathD(samples.slice(0, trace.head + 1))} className="fill-none stroke-clay" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
          )}
          <g transform={`translate(${end.x} ${end.y})`}><Goal theme={pattern.theme} /></g>
          <circle cx={start.x} cy={start.y} r={4} className="fill-moss" />
          {pattern.theme !== "dot" && !trace.done && (
            <g transform={`translate(${head.x} ${head.y}) scale(${facing} 1)`}><Traveler theme={pattern.theme} /></g>
          )}
        </svg>
        {showPicture && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-card/80">
            <svg viewBox="-16 -14 32 22" className="h-1/2 w-1/2" aria-hidden>
              <g transform="translate(6 0)"><Goal theme={pattern.theme} /></g>
              <g transform="translate(-6 0)"><Traveler theme={pattern.theme === "dot" ? "dot" : pattern.theme} /></g>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
