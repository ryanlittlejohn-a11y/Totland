import { advanceAfter } from "@/lib/calm";
import { useEffect, useRef, useState } from "react";
import { L, getLang } from "@/lib/i18n";
import { chime, say, setNarration, themeChime } from "@/lib/speech";
import { recordAnswer, recordParentMiss, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import type { SkillId } from "@/lib/content";
import { usePathTrace } from "@/hooks/usePathTrace";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";
import { GameThemeScene } from "./GameThemeScene";
import {
  HIT_RADIUS,
  dealPuzzles,
  dotSizePct,
  puzzleSvg,
  startDots,
  touchDot,
  type DotsPuzzle,
  type DotsState,
} from "@/lib/connect-dots";

/**
 * Connect the Dots: drag or tap 1 → 2 → 3… always in numeric order.
 * Wrong dots get a gentle nudge (no penalty, no lost progress). Puzzles are
 * dealt once per session (frozen); completion is guarded by a ref.
 */
export function ConnectDotsGame({
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const [puzzles, setPuzzles] = useState<DotsPuzzle[]>([]);
  const [round, setRound] = useState(0);
  const [st, setSt] = useState<DotsState>(startDots);
  const stRef = useRef<DotsState>(startDots());
  const [wrong, setWrong] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const lastNudge = useRef(0);
  const tally = useRef({ hits: 0, misses: 0 });
  const started = useRef(Date.now());

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  // Deal once, after the profile is known; never re-deal on profile updates.
  useEffect(() => {
    if (!hydrated || puzzles.length) return;
    setPuzzles(dealPuzzles(skillOf(profile, skill).level));
  }, [hydrated]);

  const puzzle = puzzles[round];
  const prompt = L("Connect the dots in order!", "¡Une los puntos en orden!");

  useEffect(() => {
    if (!puzzle) return;
    const s = startDots();
    stRef.current = s;
    setSt(s);
    setMessage("");
    started.current = Date.now();
    say(prompt);
  }, [puzzle?.id]);

  const touch = (i: number) => {
    if (!puzzle) return false;
    const { state, outcome } = touchDot(stRef.current, i, puzzle.points.length);
    if (outcome === "ignore") return !state.finished;
    if (outcome === "nudge") {
      const now = Date.now();
      if (now - lastNudge.current < 400) return false;
      lastNudge.current = now;
      setWrong(i);
      window.setTimeout(() => setWrong(null), 600);
      tally.current.misses += 1;
      update((p) => recordParentMiss(p, skill));
      const n = stRef.current.connected + 1;
      setMessage(L(`Find ${n}!`, `¡Busca el ${n}!`));
      return false;
    }
    stRef.current = state;
    setSt(state);
    tally.current.hits += 1;
    update((p) => recordAnswer(p, { skill, correct: true, responseMs: Date.now() - started.current, itemId: `dots-${i + 1}` }));
    started.current = Date.now();
    if (outcome === "connect") {
      themeChime(theme.motif, profile.sfx);
      say(String(i + 1));
      setMessage(L(`Next: ${state.connected + 1}`, `Siguiente: ${state.connected + 1}`));
      return true;
    }
    // complete
    const name = getLang() === "es" ? puzzle.es : puzzle.en;
    const text = getLang() === "es" ? `¡Hiciste ${name}!` : `You made ${name}!`;
    setMessage(text);
    chime("reward", profile.sfx);
    say(text);
    advanceAfter(() => {
      if (round + 1 < puzzles.length) setRound(round + 1);
      else if (!finishedRef.current) {
        finishedRef.current = true;
        update((p) => recordGameComplete(p, skill, 3, 1));
        const t = tally.current;
        onFinishRef.current(3, t.hits / Math.max(1, t.hits + t.misses));
      }
    }, 2400);
    return false;
  };

  const points = puzzle?.points ?? [];
  const { boardRef, livePos, boardProps } = usePathTrace({
    points,
    radius: HIT_RADIUS,
    enabled: !st.finished,
    onStart: (i) => {
      if (i === null) return false;
      const c = stRef.current.connected;
      if (c > 0 && i === c - 1) return true; // resume a drag from the last dot
      return touch(i);
    },
    onEnter: (i) => {
      const c = stRef.current.connected;
      if (i < c) return true;
      // Sliding over a later dot on the way is not a mistake — keep the drag alive.
      if (i > c) return true;
      return touch(i);
    },
  });

  if (!puzzle) return <div className="h-64 rounded-3xl felt-panel" />;
  const svg = puzzleSvg(puzzle);
  const done = st.finished;
  const anchor = st.connected > 0 ? points[st.connected - 1] : null;
  const size = dotSizePct(points.length);

  return (
    <GameThemeScene theme={theme}>
      <button type="button" onClick={() => say(prompt)} className="relative w-full rounded-3xl rounded-tl-md felt-panel px-4 py-3 text-left">
        <p className="pr-9 font-ui text-[22px] font-semibold leading-tight text-ink">{prompt}</p>
        <span className="absolute bottom-2 right-2 grid size-9 place-items-center text-xl" aria-hidden>🔊</span>
      </button>

      <div
        ref={boardRef}
        {...boardProps}
        className="dots-board relative mx-auto mt-4 aspect-square w-full max-w-[640px] select-none overflow-hidden rounded-3xl"
        style={{ touchAction: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none", containerType: "inline-size" }}
        data-dots-board
        data-puzzle={puzzle.id}
      >
        <svg viewBox={svg.viewBox} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {done && <path d={svg.outline} className={`dots-fill dots-fill-${puzzle.fill}`} />}
          {st.connected > 1 && <path d={svg.partial(st.connected)} className="dots-line" fill="none" />}
          {anchor && livePos && !done && <line x1={anchor.x} y1={anchor.y} x2={livePos.x} y2={livePos.y} className="dots-live" />}
        </svg>
        {points.map((p, i) => {
          const isDone = i < st.connected;
          const isNext = i === st.connected && !done;
          const n = i + 1;
          return (
            <button
              key={`${puzzle.id}-${i}`}
              type="button"
              data-dot={n}
              aria-label={isDone ? L(`Dot ${n}, connected`, `Punto ${n}, unido`) : isNext ? L(`Dot ${n}, next`, `Punto ${n}, siguiente`) : L(`Dot ${n}`, `Punto ${n}`)}
              disabled={done}
              onClick={() => touch(i)}
              className={`dots-dot absolute grid place-items-center rounded-full font-ui font-bold ${isDone ? "is-done" : ""} ${isNext ? "is-next" : ""} ${wrong === i ? "is-wrong" : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${size}%`, fontSize: `clamp(14px, ${size * 0.5}cqw, 34px)` }}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${done ? "bg-moss/20" : wrong !== null ? "bg-amber/20" : "bg-card/60"}`} role="status" aria-live="polite">
        <span className="text-xl" aria-hidden>{done ? "🌟" : "✏️"}</span>
        <p className="font-ui font-semibold text-ink" data-dots-status>
          {message || L("Slide from 1 to 2 to 3 — or tap the dots in order.", "Desliza del 1 al 2 al 3 — o toca los puntos en orden.")}
        </p>
      </div>
    </GameThemeScene>
  );
}
