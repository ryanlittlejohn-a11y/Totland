import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRAISE, pick, type SkillId } from "@/lib/content";
import { generateRound, type Option, type Round } from "@/lib/games";
import { chime, say, setNarration } from "@/lib/speech";
import { recordAnswer, recordGameComplete, recordSession, skillOf, useProfile } from "@/lib/profile";

export function ChoiceGame({
  skill,
  onFinish,
  mascot = "🦊",
  generator,
  rounds = 5,
  gameId,
}: {
  skill: SkillId;
  onFinish: (stars: number) => void;
  mascot?: string;
  /** optional catalog-driven round generator; defaults to the skill engine */
  generator?: (level: number) => Round;
  rounds?: number;
  gameId?: string;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, skill).level;

  const [index, setIndex] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [state, setState] = useState<"asking" | "correct" | "retry">("asking");
  const [misses, setMisses] = useState(0);
  const [stars, setStars] = useState(0);
  const [message, setMessage] = useState("");
  const started = useRef(Date.now());
  const attempts = useRef({ tries: 0, correct: 0 });

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const nextRound = useCallback(() => {
    const r = generator ? generator(level) : generateRound(skill, level);
    setRound(r);
    setState("asking");
    setMisses(0);
    started.current = Date.now();
    say(r.spoken);
  }, [skill, level, generator]);

  useEffect(() => {
    if (hydrated && !round) nextRound();
  }, [hydrated, round, nextRound]);

  const answer = (opt: Option) => {
    if (!round || state === "correct") return;
    const correct = opt.id === round.answerId;
    const responseMs = Date.now() - started.current;
    attempts.current.tries += 1;
    if (correct) attempts.current.correct += 1;
    update((p) => recordAnswer(p, { skill, correct, responseMs, itemId: round.answerId }));

    if (correct) {
      const praise = pick(PRAISE.correct);
      setState("correct");
      setStars((s) => s + (misses === 0 ? 2 : 1));
      setMessage(`${praise} ${round.reveal ?? ""}`.trim());
      chime("correct", profile.sfx);
      say(`${praise} ${round.reveal ?? ""}`);
      window.setTimeout(() => {
        if (index + 1 >= rounds) {
          const total = stars + (misses === 0 ? 2 : 1);
          const acc = (attempts.current.correct / Math.max(1, attempts.current.tries)) * 100;
          update((p) => recordSession(recordGameComplete(p, skill, total, 1, gameId), skill, acc));
          onFinish(total);
        } else {
          setIndex((i) => i + 1);
          nextRound();
        }
      }, 1800);
    } else {
      const praise = pick(PRAISE.retry);
      setMisses((m) => m + 1);
      setState("retry");
      setMessage(misses >= 1 ? `${praise} ${round.hint}` : praise);
      chime("retry", profile.sfx);
      say(misses >= 1 ? `${praise} ${round.hint}` : praise);
      window.setTimeout(() => setState("asking"), 1200);
    }
  };

  const gridCols = useMemo(() => (round?.columns === 2 ? "grid-cols-2" : "grid-cols-3"), [round]);

  if (!round) return <div className="h-64 rounded-3xl felt-panel" />;

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-wood text-3xl anim-floaty wood-block">
          {mascot}
        </div>
        <button
          type="button"
          onClick={() => say(round.spoken)}
          aria-label="Hear the instruction again"
          className="relative flex-1 rounded-3xl rounded-tl-md felt-panel px-4 py-3 text-left"
        >
          <p className="font-ui text-[22px] font-semibold leading-tight text-ink">{round.prompt}</p>
          <span className="absolute bottom-2 right-3 text-lg text-sky" aria-hidden>
            🔊
          </span>
        </button>
      </div>

      <div className={`mt-5 grid ${gridCols} gap-3`}>
        {round.options.map((opt) => {
          const isAnswer = opt.id === round.answerId;
          const highlight = state === "correct" && isAnswer;
          const emojiSize = opt.size === "lg" ? "text-7xl" : opt.size === "sm" ? "text-3xl" : "text-5xl";
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => answer(opt)}
              aria-label={opt.label ?? opt.id}
              className={`min-h-[92px] rounded-3xl bg-card grid place-items-center p-2 wood-block transition-transform active:translate-y-1 ${
                opt.size ? "aspect-auto" : "aspect-square"
              } ${highlight ? "scale-[1.04] bg-amber" : ""} ${state === "retry" ? "anim-wiggle" : ""}`}
            >
              {opt.swatch ? (
                <span
                  className="size-16 rounded-full"
                  style={{ background: opt.shadow ? "var(--color-night)" : opt.swatch }}
                />
              ) : opt.clip ? (
                <span
                  className={`size-16 ${opt.shadow ? "bg-night" : "bg-clay"}`}
                  style={{ clipPath: opt.clip }}
                />
              ) : opt.emoji ? (
                <span
                  className={emojiSize}
                  style={opt.shadow ? { filter: "brightness(0) opacity(0.8)" } : undefined}
                >
                  {opt.emoji}
                </span>
              ) : (
                <span
                  className={`font-ui font-bold text-ink ${opt.big ? "text-5xl" : "text-2xl"} break-words text-center leading-tight`}
                  style={opt.shadow ? { color: "var(--color-night)", opacity: 0.85 } : undefined}
                >
                  {opt.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${
          state === "correct" ? "bg-moss/20" : state === "retry" ? "bg-amber/20" : "bg-card/60"
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="text-xl" aria-hidden>
          {state === "correct" ? "🌟" : state === "retry" ? "💛" : "👆"}
        </span>
        <p className="font-ui font-semibold text-ink">{message || "Tap your answer — take your time."}</p>
      </div>
    </div>
  );
}
