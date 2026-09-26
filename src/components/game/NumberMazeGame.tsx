import { useEffect, useRef, useState } from "react";
import { type SkillId } from "@/lib/content";
import { L, getLang } from "@/lib/i18n";
import { chime, say, setNarration, stripEmoji, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { MAZE_REVEALS, makeMaze, mazeTier } from "@/lib/number-maze";
import type { TracePoint } from "@/hooks/usePathTrace";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";
import { GameThemeScene } from "./GameThemeScene";
import { NumberMazeScene } from "./NumberMazeScene";

/**
 * Number Maze: trace a path through numbered stones in order (drag, or tap
 * each number in order). Wrong-order touches are playful retries, never misses.
 */
export function NumberMazeGame({
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  // Tier is fixed for the session so a mid-game level-up doesn't rebuild the board.
  const [tier, setTier] = useState(() => mazeTier(1));
  const tierSet = useRef(false);
  if (hydrated && !tierSet.current) {
    tierSet.current = true;
    setTier(mazeTier(skillOf(profile, skill).level));
  }

  const [round, setRound] = useState(0);
  const [points, setPoints] = useState<TracePoint[]>([]);
  const [connected, setConnected] = useState(0);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [hintNext, setHintNext] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const connectedRef = useRef(0);
  const doneRef = useRef(false);
  const lastRetrySpeech = useRef(0);
  const lastWrong = useRef(0);
  const started = useRef(Date.now());
  const reveal = MAZE_REVEALS[round % MAZE_REVEALS.length] ?? MAZE_REVEALS[0]!;

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const prompt = () =>
    L("Trace the path: start at 1 and follow the numbers!", "Traza el camino: ¡empieza en 1 y sigue los números!");

  useEffect(() => {
    if (!hydrated || !tierSet.current) return;
    setPoints(makeMaze(tier.points));
    setConnected(0);
    connectedRef.current = 0;
    doneRef.current = false;
    setDone(false);
    setMessage("");
    started.current = Date.now();
    say(prompt());
  }, [hydrated, tier.points, round]);

  const connect = (i: number) => {
    const next = i + 1;
    connectedRef.current = next;
    setConnected(next);
    setHintNext(false);
    update((p) =>
      recordAnswer(p, { skill, correct: true, responseMs: Date.now() - started.current, itemId: `maze-${i + 1}` }),
    );
    started.current = Date.now();
    themeChime(theme.motif, profile.sfx);
    if (next >= points.length) {
      doneRef.current = true;
      const text = getLang() === "es" ? `¡Lo lograste! Hiciste ${reveal.es}. ` : `You did it! You made ${reveal.en}! `;
      setDone(true);
      setMessage(text + reveal.emoji);
      chime("reward", profile.sfx);
      say(stripEmoji(text));
      window.setTimeout(() => {
        if (round + 1 < tier.rounds) setRound(round + 1);
        else {
          update((p) => recordGameComplete(p, skill, 3, 1));
          onFinish(3, 1);
        }
      }, 2400);
    } else {
      setMessage(
        L(`${next} connected. Next: ${next + 1}.`, `${next} conectado. Siguiente: ${next + 1}.`),
      );
      say(String(next));
    }
  };

  const wrong = (i: number) => {
    const now = Date.now();
    if (now - lastWrong.current < 400) return; // pointer + click from one tap
    lastWrong.current = now;
    // Penalty-free: no answer recorded, no star/accuracy impact.
    setWrongIndex(i);
    window.setTimeout(() => setWrongIndex(null), 600);
    const want = connectedRef.current + 1;
    const retry = L(`Find ${want}!`, `¡Busca el ${want}!`);
    setMessage(retry);
    if (now - lastRetrySpeech.current > 2000) {
      lastRetrySpeech.current = now;
      chime("retry", profile.sfx);
      say(retry);
    }
  };

  const onStart = (i: number | null) => {
    if (doneRef.current) return false;
    const c = connectedRef.current;
    if (i === c) { connect(i); return true; }
    if (c > 0 && i === c - 1) return true;
    if (i !== null && i > c) wrong(i);
    else { setHintNext(true); window.setTimeout(() => setHintNext(false), 1200); }
    return false;
  };

  const onEnter = (i: number) => {
    if (doneRef.current) return false;
    const c = connectedRef.current;
    if (i === c) { connect(i); return !doneRef.current; }
    if (i > c) { wrong(i); return false; }
    return true;
  };

  const onTap = (i: number) => {
    if (doneRef.current) return;
    const c = connectedRef.current;
    if (i === c) connect(i);
    else if (i > c) wrong(i);
  };

  if (!points.length) return <div className="h-64 rounded-3xl felt-panel" />;

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(prompt())}
        className="relative w-full rounded-3xl rounded-tl-md felt-panel px-4 py-3 text-left"
      >
        <p className="pr-9 font-ui text-[22px] font-semibold leading-tight text-ink">{prompt()}</p>
        <span className="absolute bottom-2 right-2 grid size-9 place-items-center text-xl" aria-hidden>🔊</span>
      </button>

      <NumberMazeScene
        points={points}
        connected={connected}
        wrongIndex={wrongIndex}
        hintNext={hintNext}
        done={done}
        revealEmoji={reveal.emoji}
        onStart={onStart}
        onEnter={onEnter}
        onTap={onTap}
      />

      <div
        className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${
          done ? "bg-moss/20" : wrongIndex !== null ? "bg-amber/20" : "bg-card/60"
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="text-xl" aria-hidden>{done ? "🌟" : "🌀"}</span>
        <p className="font-ui font-semibold text-ink" data-maze-status>
          {message || L(
            "Slide your finger from 1 to the next number — or tap the numbers in order.",
            "Desliza el dedo del 1 al siguiente número — o toca los números en orden.",
          )}
        </p>
      </div>
    </GameThemeScene>
  );
}
