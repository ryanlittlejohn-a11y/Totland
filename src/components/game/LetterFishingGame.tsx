import { useCallback, useEffect, useRef, useState } from "react";
import { PRAISE, pick, type SkillId } from "@/lib/content";
import { L, PRAISE_ES, getLang } from "@/lib/i18n";
import { roundForKind } from "@/lib/rounds";
import type { Round } from "@/lib/games";
import { say, setNarration, stripEmoji, themeChime } from "@/lib/speech";
import { recordAnswer, recordParentMiss, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";
import { GameThemeScene } from "./GameThemeScene";
import { FishingPond } from "./FishingPond";

/**
 * Letter Fishing: drag the hook onto the spoken letter. Wrong catches are
 * never penalised: no miss recorded, no effect on stars or accuracy.
 */
export function LetterFishingGame({
  kind,
  skill,
  rounds: ROUNDS = 5,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  kind: string;
  skill: SkillId;
  rounds?: number;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, skill).level;
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [caughtId, setCaughtId] = useState<string | null>(null);
  const [bouncedId, setBouncedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const stars = useRef(0);
  const tally = useRef({ hits: 0, misses: 0 });
  const started = useRef(Date.now());

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const prompt = (r: Round) => L(`Catch the letter ${r.answerId}!`, `¡Pesca la letra ${r.answerId}!`);

  const nextRound = useCallback(() => {
    const r = roundForKind(kind, level);
    setRound(r);
    setCaughtId(null);
    setBouncedId(null);
    setMessage("");
    started.current = Date.now();
    say(prompt(r));
  }, [kind, level]);

  useEffect(() => {
    if (hydrated && !round) nextRound();
  }, [hydrated, round, nextRound]);

  const onCatch = (id: string) => {
    if (!round || caughtId) return;
    if (id !== round.answerId) {
      // no penalty: letter slips away, try again
      // Parent stats only: invisible to the child, no effect on stars/level.
      tally.current.misses += 1;
      update((p) => recordParentMiss(p, skill));
      setBouncedId(id);
      const m = L("Oops, it slipped away! Try another one.", "¡Uy, se escapó! Prueba otra.");
      setMessage(m);
      say(m);
      window.setTimeout(() => setBouncedId(null), 700);
      return;
    }
    const praise = pick(getLang() === "es" ? PRAISE_ES.correct : PRAISE.correct);
    const text = `${praise} ${round.reveal ?? ""}`.trim();
    setCaughtId(id);
    setMessage(text);
    stars.current += 2;
    tally.current.hits += 1;
    update((p) => recordAnswer(p, { skill, correct: true, responseMs: Date.now() - started.current, itemId: round.answerId }));
    themeChime(theme.motif, profile.sfx);
    say(stripEmoji(text));
    window.setTimeout(() => {
      if (index + 1 >= ROUNDS) {
        const total = stars.current;
        update((p) => recordGameComplete(p, skill, total, 1));
        onFinish(total, tally.current.hits / Math.max(1, tally.current.hits + tally.current.misses));
      } else {
        setIndex((i) => i + 1);
        nextRound();
      }
    }, 2600);
  };

  if (!round) return <div className="h-64 rounded-3xl felt-panel" />;

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(prompt(round))}
        className="relative w-full rounded-3xl rounded-tl-md felt-panel px-4 py-3 text-left"
      >
        <p className="pr-9 font-ui text-[22px] font-semibold leading-tight text-ink">{prompt(round)}</p>
        <span className="absolute bottom-2 right-2 grid size-9 place-items-center text-xl" aria-hidden>🔊</span>
      </button>

      <FishingPond
        letters={round.options.map((o) => ({ id: o.id, label: o.label ?? o.id }))}
        caughtId={caughtId}
        bouncedId={bouncedId}
        disabled={!!caughtId}
        onCatch={onCatch}
      />

      <div
        className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${caughtId ? "bg-moss/20" : bouncedId ? "bg-amber/20" : "bg-card/60"}`}
        role="status"
      >
        <span className="text-xl" aria-hidden>{caughtId ? "🌟" : bouncedId ? "💛" : "🎣"}</span>
        <p className="font-ui font-semibold text-ink">
          {message || L("Drag the hook down to the letter — or tap it.", "Arrastra el anzuelo hasta la letra — o tócala.")}
        </p>
      </div>
    </GameThemeScene>
  );
}
