import { advanceAfter } from "@/lib/calm";
import { useEffect, useRef, useState } from "react";
import { PRAISE, pick, type SkillId } from "@/lib/content";
import { L, PRAISE_ES, getLang } from "@/lib/i18n";
import { huntSet, roundForKind } from "@/lib/rounds";
import { chime, say, sayParts, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import type { Option } from "@/lib/games";
import { GameThemeScene } from "./GameThemeScene";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";

interface PopRound {
  prompt: string;
  spoken: string;
  bubbles: Option[];
  targets: string[];
  reveal?: string | undefined;
}

const ALL_KINDS: Record<string, string> = { bubbleLetters: "letters", bubbleNumbers: "numbers" };

function makeRound(kind: string, level: number): PopRound {
  const huntKind = ALL_KINDS[kind];
  if (huntKind) {
    const s = huntSet(huntKind, level);
    const cells = s.cells.slice(0, 12);
    const targets = cells.filter((c) => s.targetIds.includes(c.id)).map((c) => c.id);
    return {
      prompt: L(`Pop every bubble with ${s.label}!`, `¡Revienta cada burbuja con ${s.label}!`),
      spoken: L(`Pop every bubble with ${s.label}.`, `Revienta cada burbuja con ${s.label}.`),
      bubbles: cells,
      targets,
    };
  }
  const r = roundForKind(kind, level);
  return {
    prompt: r.prompt,
    spoken: r.spoken,
    bubbles: r.options,
    targets: [r.answerId],
    reveal: r.reveal,
  };
}

/**
 * Bubble Pop: gently drifting bubbles; tapping the right one bursts it.
 * "Pop" kinds = find one per round (5 rounds); "Bubbles" kinds = pop all of
 * the named item in one bigger cloud (3 rounds). No timer, no penalty.
 */
export function PopGame({
  kind,
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  kind: string;
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, skill).level;
  const levelRef = useRef(level);
  levelRef.current = level;
  const rounds = ALL_KINDS[kind] ? 3 : 5;

  const [round, setRound] = useState<PopRound | null>(null);
  const [index, setIndex] = useState(0);
  const [popped, setPopped] = useState<string[]>([]);
  const [wobble, setWobble] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const tally = useRef({ right: 0, total: 0 });
  const doneRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (hydrated && !round) setRound(makeRound(kind, level));
  }, [hydrated, round, kind, level]);
  useEffect(() => {
    if (round) say(round.spoken);
  }, [round]);

  if (!round) return <div className="h-64 rounded-3xl felt-panel" />;

  const tap = (b: Option) => {
    if (doneRef.current || popped.includes(b.id)) return;
    const hit = round.targets.includes(b.id);
    tally.current.total += 1;
    update((p) => recordAnswer(p, { skill, correct: hit, responseMs: 2500 }));
    if (!hit) {
      chime("retry", profile.sfx);
      setWobble(b.id);
      const praise = pick(getLang() === "es" ? PRAISE_ES.retry : PRAISE.retry);
      setMessage(praise);
      window.setTimeout(() => setWobble(null), 700);
      return;
    }
    tally.current.right += 1;
    themeChime(theme.motif, profile.sfx);
    const next = [...popped, b.id];
    setPopped(next);
    // Computed "done" for this cloud — no dependency on later state updates.
    if (next.length < round.targets.length) {
      setMessage(
        L(
          `Pop! ${next.length} of ${round.targets.length}.`,
          `¡Pum! ${next.length} de ${round.targets.length}.`,
        ),
      );
      return;
    }
    doneRef.current = true;
    const praise = pick(getLang() === "es" ? PRAISE_ES.correct : PRAISE.correct);
    setMessage(`${praise} ${round.reveal ?? ""}`.trim());
    sayParts([praise, round.reveal ?? ""]);
    timer.current = advanceAfter(() => {
      if (index + 1 >= rounds) {
        const accuracy = tally.current.right / Math.max(1, tally.current.total);
        const stars = accuracy > 0.9 ? 3 : accuracy > 0.6 ? 2 : 1;
        update((p) => recordGameComplete(p, skill, stars, 1));
        onFinishRef.current(stars, accuracy);
        return;
      }
      setIndex((i) => i + 1);
      setPopped([]);
      setMessage("");
      doneRef.current = false;
      setRound(makeRound(kind, levelRef.current));
    }, 1800);
  };

  const size = round.bubbles.length > 6 ? 68 : 92;

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(round.spoken)}
        className="w-full rounded-3xl felt-panel px-4 py-3 text-left"
      >
        <p className="font-ui text-[22px] font-semibold leading-tight text-ink">
          {round.prompt} <span aria-hidden>🔊</span>
        </p>
      </button>

      <div className="bubble-sky mt-4 flex flex-wrap items-center justify-center gap-3 rounded-3xl p-4">
        {round.bubbles.map((b, i) => {
          const gone = popped.includes(b.id);
          return (
            <button
              key={`${index}-${b.id}`}
              type="button"
              disabled={gone}
              onClick={() => tap(b)}
              aria-label={b.label ?? b.id}
              className={`bubble grid place-items-center ${gone ? "bubble--popped" : ""} ${wobble === b.id ? "anim-wiggle" : ""}`}
              style={{
                width: size,
                height: size,
                animationDelay: `${(i % 5) * -0.9}s`,
                animationDuration: `${4 + (i % 3)}s`,
              }}
            >
              {b.swatch ? (
                <span
                  className="rounded-full"
                  style={{ width: size * 0.55, height: size * 0.55, background: b.swatch }}
                />
              ) : b.clip ? (
                <span
                  className="bg-clay"
                  style={{ width: size * 0.55, height: size * 0.55, clipPath: b.clip }}
                />
              ) : b.emoji ? (
                <span style={{ fontSize: size * 0.5 }}>{b.emoji}</span>
              ) : (
                <span className="font-ui font-bold text-ink" style={{ fontSize: size * 0.45 }}>
                  {b.label}
                </span>
              )}
              {gone && <span className="bubble__drops" aria-hidden />}
            </button>
          );
        })}
      </div>

      <p className="mt-3 min-h-6 text-center font-ui font-semibold text-ink" role="status">
        {message ||
          L("Tap the right bubble to pop it.", "Toca la burbuja correcta para reventarla.")}
      </p>
      <p className="text-center font-ui text-xs text-inksoft">
        {L(`Round ${index + 1} of ${rounds}`, `Ronda ${index + 1} de ${rounds}`)}
      </p>
    </GameThemeScene>
  );
}
