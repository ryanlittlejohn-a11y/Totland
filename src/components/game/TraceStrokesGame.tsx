import { useEffect, useMemo, useRef, useState } from "react";
import { usePathTrace } from "@/hooks/usePathTrace";
import {
  BOARD_H, BOARD_W, arrowsAlong, currentStroke, startMulti, toleranceFor, traceStepMulti,
  type MultiTraceState, type Pt,
} from "@/lib/line-trace";
import {
  characterSamples, dealCharacters, DIGIT_CHARACTERS, DIGIT_GUIDES, SHAPE_CHARACTERS, type StrokeCharacter,
} from "@/lib/trace-strokes";
import { L } from "@/lib/i18n";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { chime, say } from "@/lib/speech";

const PROMPT = (c: StrokeCharacter) => L(`Trace the ${c.label.en}.`, `Traza ${c.label.es}.`);
const PRAISE = (c: StrokeCharacter) => L(`You traced the ${c.label.en}!`, `¡Trazaste ${c.label.es}!`);

const pathD = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

/**
 * Trace Shapes / Trace Numbers: multi-stroke characters on the line-trace
 * engine. Strict stroke order by default; the parent dashboard's "free
 * stroke order" switch lets any stroke move. Rounds are dealt once and
 * frozen; completion fires exactly once.
 */
export function TraceStrokesGame({ set, onFinish }: { set: "shapes" | "numbers"; onFinish: (stars: number, accuracy: number) => void }) {
  const { profile, update, hydrated } = useProfile();
  const [chars, setChars] = useState<StrokeCharacter[]>([]);
  const [index, setIndex] = useState(0);
  const [trace, setTrace] = useState<MultiTraceState>(() => startMulti(1));
  const traceRef = useRef(trace);
  const finished = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const level = useRef(1);
  const pool = set === "shapes" ? SHAPE_CHARACTERS : DIGIT_CHARACTERS;
  const skill = set === "shapes" ? "shapes" : "numbers";
  const freeOrder = profile.freeTraceOrder ?? false;

  // Dealt once and frozen for the game's lifetime.
  useEffect(() => {
    if (!hydrated || chars.length) return;
    level.current = skillOf(profile, skill).level;
    const dealt = dealCharacters(pool, level.current);
    setChars(dealt);
    traceRef.current = startMulti(dealt[0]!.strokes.length);
    setTrace(traceRef.current);
    say(PROMPT(dealt[0]!));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, chars.length]);

  const character = chars[index];
  const strokes = useMemo(() => (character ? characterSamples(character) : []), [character]);
  const arrows = useMemo(() => strokes.map((s) => arrowsAlong(s)), [strokes]);
  const tolerance = toleranceFor(level.current);

  const { boardRef, boardProps, livePos } = usePathTrace({
    points: [],
    radius: 0,
    enabled: !!character && !trace.done,
    onStart: () => true,
    onEnter: () => true,
  });

  useEffect(() => {
    if (!livePos || !character) return;
    // The hook reports 0–100 on both axes; the board is 100 × 70.
    const finger = { x: (livePos.x / 100) * BOARD_W, y: (livePos.y / 100) * BOARD_H };
    const { state, completed } = traceStepMulti(traceRef.current, strokes, finger, tolerance, freeOrder);
    if (state === traceRef.current) return;
    traceRef.current = state;
    setTrace(state);
    if (!completed) return;
    update((current) => recordAnswer(current, { skill, correct: true, responseMs: 4000, itemId: `trace:${character.id}` }));
    chime("correct", profile.sfx);
    say(PRAISE(character));
    const next = index + 1;
    if (next >= chars.length) {
      if (finished.current) return;
      finished.current = true;
      window.setTimeout(() => {
        update((current) => recordGameComplete(current, skill, 3, 2));
        finishRef.current(3, 1);
      }, profile.reducedMotion ? 900 : 1600);
      return;
    }
    window.setTimeout(() => {
      traceRef.current = startMulti(chars[next]!.strokes.length);
      setTrace(traceRef.current);
      setIndex(next);
      say(PROMPT(chars[next]!));
    }, profile.reducedMotion ? 900 : 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePos]);

  if (!hydrated || !character) return null;
  const active = currentStroke(trace, strokes);

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">
        {set === "shapes" ? L("Trace the shape", "Traza la figura") : L("Trace the number", "Traza el número")}
      </p>
      <p className="mt-1 font-ui text-sm text-inksoft">{index + 1} / {chars.length}</p>
      <div
        ref={boardRef}
        {...boardProps}
        className="relative mt-4 w-full touch-none select-none overflow-hidden rounded-3xl bg-card wood-block"
        style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}` }}
        role="img"
        aria-label={L(`Dotted ${character.label.en} to trace from the green dot`, `${character.label.en === "star" ? "Figura" : "Figura"} punteada para trazar desde el punto verde`)}
      >
        <svg viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          {character.guides &&
            DIGIT_GUIDES.map((y) => (
              <line key={y} x1={8} y1={y} x2={BOARD_W - 8} y2={y} className="stroke-inksoft" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.45} />
            ))}
          {strokes.map((samples, i) => {
            const head = trace.heads[i] ?? 0;
            const strokeDone = head >= samples.length - 1;
            const isActive = freeOrder ? !strokeDone : i === active;
            return (
              <g key={i}>
                <path
                  d={pathD(samples)}
                  className="fill-none stroke-inksoft"
                  strokeWidth={1.4}
                  strokeDasharray="2.4 2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={strokeDone ? 0 : isActive ? 0.75 : 0.25}
                />
                {isActive &&
                  arrows[i]!.map((a, j) => (
                    <polyline key={j} points="-1.4,-1.6 0.8,0 -1.4,1.6" transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`} className="fill-none stroke-inksoft" strokeWidth={0.7} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
                  ))}
                {head > 0 && (
                  <path d={pathD(samples.slice(0, head + 1))} className="fill-none stroke-clay" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
                )}
              </g>
            );
          })}
          {strokes.map((samples, i) => {
            const start = samples[0]!;
            const strokeDone = (trace.heads[i] ?? 0) >= samples.length - 1;
            if (strokeDone) return null;
            const isNext = freeOrder ? true : i === active;
            return (
              <g key={`dot-${i}`} transform={`translate(${start.x} ${start.y})`}>
                <circle r={isNext ? 4.4 : 3.2} className={`fill-moss ${isNext && !profile.reducedMotion ? "animate-pulse" : ""}`} opacity={isNext ? 1 : 0.45} />
                <text y={0.1} textAnchor="middle" dominantBaseline="central" fontSize={4.6} fontWeight={700} className="fill-cream" style={{ pointerEvents: "none" }}>
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
