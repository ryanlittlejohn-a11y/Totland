import { useCallback, useEffect, useRef, useState } from "react";
import { PRAISE, pick, type SkillId } from "@/lib/content";
import { L, PRAISE_ES, getLang } from "@/lib/i18n";
import { roundForKind } from "@/lib/rounds";
import type { Round } from "@/lib/games";
import { chime, say, setNarration, stripEmoji, themeChime } from "@/lib/speech";
import { recordAnswer, recordParentMiss, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";
import { GameThemeScene } from "./GameThemeScene";
import { LetterRainScene } from "./LetterRainScene";

/** Letter Rain: slow, endlessly returning letters with no deadline or misses. */
export function LetterRainGame({
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
  const [splashedId, setSplashedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const stars = useRef(0);
  const tally = useRef({ hits: 0, misses: 0 });
  const started = useRef(Date.now());
  const lastRetrySpeech = useRef(0);

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const prompt = (value: Round) => L(
    `Catch the letter ${value.answerId}! Take your time — it will come back.`,
    `¡Atrapa la letra ${value.answerId}! Tómate tu tiempo — volverá.`,
  );

  const nextRound = useCallback(() => {
    const generated = roundForKind(kind, level);
    setRound(generated);
    setCaughtId(null);
    setSplashedId(null);
    setMessage("");
    started.current = Date.now();
    say(prompt(generated));
  }, [kind, level]);

  useEffect(() => {
    if (hydrated && !round) nextRound();
  }, [hydrated, round, nextRound]);

  const onCatch = (id: string) => {
    if (!round || caughtId) return;
    if (id !== round.answerId) {
      setSplashedId(id);
      // Parent stats only: invisible to the child, no effect on stars/level.
      tally.current.misses += 1;
      update((p) => recordParentMiss(p, skill));
      const retry = L(
        "Splash! Try another letter — take your time.",
        "¡Splash! Prueba otra letra — tómate tu tiempo.",
      );
      setMessage(retry);
      chime("retry", profile.sfx);
      const now = Date.now();
      if (now - lastRetrySpeech.current > 1800) {
        lastRetrySpeech.current = now;
        say(retry);
      }
      window.setTimeout(() => setSplashedId(null), 650);
      return;
    }

    const praise = pick(getLang() === "es" ? PRAISE_ES.correct : PRAISE.correct);
    const text = `${praise} ${round.reveal ?? ""}`.trim();
    setCaughtId(id);
    setMessage(text);
    stars.current += 2;
    tally.current.hits += 1;
    update((current) => recordAnswer(current, {
      skill,
      correct: true,
      responseMs: Date.now() - started.current,
      itemId: round.answerId,
    }));
    themeChime(theme.motif, profile.sfx);
    say(stripEmoji(text));
    window.setTimeout(() => {
      if (index + 1 >= ROUNDS) {
        const total = stars.current;
        update((current) => recordGameComplete(current, skill, total, 1));
        // Let this component persist its completion before the host records the
        // session from its own profile subscriber, avoiding a stale overwrite.
        window.setTimeout(() => onFinish(total, tally.current.hits / Math.max(1, tally.current.hits + tally.current.misses)), 80);
      } else {
        setIndex((current) => current + 1);
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

      <LetterRainScene
        letters={round.options.map((option) => ({ id: option.id, label: option.label ?? option.id }))}
        caughtId={caughtId}
        splashedId={splashedId}
        disabled={!!caughtId}
        onCatch={onCatch}
      />

      <div
        className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${
          caughtId ? "bg-moss/20" : splashedId ? "bg-amber/20" : "bg-card/60"
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="text-xl" aria-hidden>{caughtId ? "🌟" : splashedId ? "💧" : "☂️"}</span>
        <p className="font-ui font-semibold text-ink" data-rain-status>
          {message || L(
            "Tap the rainy letter — it always comes back.",
            "Toca la letra de lluvia — siempre vuelve.",
          )}
        </p>
      </div>
    </GameThemeScene>
  );
}