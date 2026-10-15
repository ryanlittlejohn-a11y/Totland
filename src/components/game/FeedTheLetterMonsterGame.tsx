import { useCallback, useEffect, useRef, useState } from "react";
import { COLORS, PRAISE, SHAPES, alphabet, pick, shuffle, type SkillId } from "@/lib/content";
import { L, PRAISE_ES, getLang, enginePrompt } from "@/lib/i18n";
import { roundForKind } from "@/lib/rounds";
import type { Round } from "@/lib/games";
import { say, sayParts, setNarration, themeChime } from "@/lib/speech";
import { recordAnswer, recordParentMiss, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";
import { GameThemeScene } from "./GameThemeScene";
import { RoundClue, needsClue } from "./RoundClue";
import { MonsterFeedingScene } from "./MonsterFeedingScene";

/** Feed the Letter Monster: wrong feeds are playful retries, never misses. */
export function FeedTheLetterMonsterGame({
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
  const [eatenId, setEatenId] = useState<string | null>(null);
  const [refusedId, setRefusedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const stars = useRef(0);
  const tally = useRef({ hits: 0, misses: 0 });
  const started = useRef(Date.now());

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const prompt = (r: Round) =>
    needsClue(kind) ? r.spoken : enginePrompt("feedMonster", skill, r.answerId);
  const answerName = L(
    skill === "colors" ? "color" : skill === "shapes" ? "shape" : skill === "numbers" ? "number" : "letter",
    skill === "colors" ? "color" : skill === "shapes" ? "figura" : skill === "numbers" ? "número" : "letra",
  );

  const nextRound = useCallback(() => {
    const generated = roundForKind(kind, level);
    const optionIds = new Set(generated.options.map((option) => option.id));
    const needed = Math.max(0, 3 - generated.options.length);
    const pool = skill === "colors"
      ? COLORS.map((color) => ({ id: color.name, swatch: color.swatch }))
      : skill === "shapes"
        ? SHAPES.map((shape) => ({ id: shape.name, clip: shape.clip }))
        : skill === "numbers"
          ? Array.from({ length: level <= 1 ? 5 : level <= 2 ? 10 : level <= 4 ? 15 : 20 }, (_, index) => ({
              id: String(index + 1),
              label: String(index + 1),
              big: true,
            }))
          : alphabet().map((letter) => ({ id: letter, label: letter, big: true }));
    const extras = shuffle(pool.filter((option) => !optionIds.has(option.id))).slice(0, needed);
    const r = { ...generated, options: shuffle([...generated.options, ...extras]) };
    setRound(r);
    setEatenId(null);
    setRefusedId(null);
    setMessage("");
    started.current = Date.now();
    say(prompt(r));
  }, [kind, level, skill]);

  useEffect(() => {
    if (hydrated && !round) nextRound();
  }, [hydrated, round, nextRound]);

  const onFeed = (id: string) => {
    if (!round || eatenId) return;
    if (id !== round.answerId) {
      setRefusedId(id);
      // Parent stats only: invisible to the child, no effect on stars/level.
      tally.current.misses += 1;
      update((p) => recordParentMiss(p, skill));
      const retry = L(
        `Sniff, sniff! Try another ${answerName}.`,
        `¡Snif, snif! Prueba ${answerName === "figura" ? "otra" : answerName === "letra" ? "otra" : "otro"} ${answerName}.`,
      );
      setMessage(retry);
      say(retry);
      window.setTimeout(() => setRefusedId(null), 700);
      return;
    }

    const praise = pick(getLang() === "es" ? PRAISE_ES.correct : PRAISE.correct);
    const text = `${praise} ${round.reveal ?? ""}`.trim();
    setEatenId(id);
    setMessage(text);
    stars.current += 2;
    tally.current.hits += 1;
    update((p) => recordAnswer(p, {
      skill,
      correct: true,
      responseMs: Date.now() - started.current,
      itemId: round.answerId,
    }));
    themeChime(theme.motif, profile.sfx);
    sayParts([praise, round.reveal ?? ""]);
    window.setTimeout(() => {
      if (index + 1 >= ROUNDS) {
        const total = stars.current;
        update((p) => recordGameComplete(p, skill, total, 1));
        onFinish(total, tally.current.hits / Math.max(1, tally.current.hits + tally.current.misses));
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

      {needsClue(kind) ? <RoundClue round={round} /> : null}

      <MonsterFeedingScene
        options={round.options}
        skill={skill}
        eatenId={eatenId}
        refusedId={refusedId}
        disabled={!!eatenId}
        onFeed={onFeed}
      />

      <div
        className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${
          eatenId ? "bg-moss/20" : refusedId ? "bg-amber/20" : "bg-card/60"
        }`}
        role="status"
      >
        <span className="text-xl" aria-hidden>{eatenId ? "🌟" : refusedId ? "👃" : "👾"}</span>
        <p className="font-ui font-semibold text-ink">
          {message || L(
            `Drag a ${answerName} to the monster's mouth — or tap it.`,
            `Arrastra ${answerName === "figura" || answerName === "letra" ? "una" : "un"} ${answerName} a la boca del monstruo — o tócalo.`,
          )}
        </p>
      </div>
    </GameThemeScene>
  );
}