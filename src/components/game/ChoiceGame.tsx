import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRAISE, pick, type SkillId } from "@/lib/content";
import { generateRound, type Option, type Round } from "@/lib/games";
import { roundForKind } from "@/lib/rounds";
import { chime, say, setNarration, stripEmoji } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";

export function ChoiceGame({
  skill,
  kind,
  rounds: ROUNDS = 5,
  onFinish,
  mascot = "🦊",
}: {
  skill: SkillId;
  kind?: string;
  rounds?: number;
  onFinish: (stars: number, accuracy: number) => void;
  mascot?: string;
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
  const tally = useRef({ right: 0, total: 0 });

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const nextRound = useCallback(() => {
    const r = kind ? roundForKind(kind, level) : generateRound(skill, level);
    setRound(r);
    setState("asking");
    setMisses(0);
    started.current = Date.now();
    say(r.spoken);
  }, [skill, kind, level]);

  useEffect(() => {
    if (hydrated && !round) nextRound();
  }, [hydrated, round, nextRound]);


  const answer = (opt: Option) => {
    if (!round || state === "correct") return;
    const correct = opt.id === round.answerId;
    const responseMs = Date.now() - started.current;
    tally.current.total += 1;
    if (correct) tally.current.right += 1;
    update((p) => recordAnswer(p, { skill, correct, responseMs, itemId: round.answerId }));

    if (correct) {
      const praise = pick(PRAISE.correct);
      setState("correct");
      setStars((s) => s + (misses === 0 ? 2 : 1));
      setMessage(`${praise} ${round.reveal ?? ""}`.trim());
      chime("correct", profile.sfx);
      say(`${praise} ${round.reveal ?? ""}`);
      window.setTimeout(() => {
        if (index + 1 >= ROUNDS) {
          const total = stars + (misses === 0 ? 2 : 1);
          update((p) => recordGameComplete(p, skill, total, 1));
          onFinish(total, tally.current.right / Math.max(1, tally.current.total));
        } else {
          setIndex((i) => i + 1);
          nextRound();
        }
      }, 3000);
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


  const gridCols = useMemo(
    () => (round?.skill === "wordsearch" ? "grid-cols-3" : round?.options.length === 2 ? "grid-cols-2" : "grid-cols-3"),
    [round],
  );

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
          className="relative flex-1 rounded-3xl rounded-tl-md felt-panel px-4 py-3 text-left"
        >
          <p className="whitespace-pre-line font-ui text-[22px] font-semibold leading-tight text-ink">{round.prompt}</p>
          <span className="absolute bottom-2 right-3 text-lg text-sky" aria-hidden>
            🔊
          </span>
        </button>
      </div>

      {round.visual ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 rounded-3xl felt-panel px-4 py-4">
          {Array.from(round.visual).map((ch, i) => (
            <span key={i} className="text-4xl anim-floaty" style={{ animationDelay: `${i * 120}ms` }} aria-hidden>
              {ch}
            </span>
          ))}
          <span className="sr-only">{round.visual.length} items</span>
        </div>
      ) : null}

      <div className={`mt-5 grid ${gridCols} gap-3`}>
        {round.options.map((opt) => {
          const isAnswer = opt.id === round.answerId;
          const highlight = state === "correct" && isAnswer;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => answer(opt)}
              aria-label={opt.label ?? opt.id}
              className={`aspect-square rounded-3xl bg-card grid place-items-center wood-block transition-transform active:translate-y-1 ${
                highlight ? "scale-[1.04] bg-amber" : ""
              } ${state === "retry" ? "anim-wiggle" : ""}`}
            >
              {opt.swatch ? (
                <span className="size-16 rounded-full" style={{ background: opt.swatch }} />
              ) : opt.clip ? (
                <span className="size-16 bg-clay" style={{ clipPath: opt.clip }} />
              ) : opt.emoji ? (
                <span className="text-5xl">{opt.emoji}</span>
              ) : (
                <span className={`font-ui font-bold text-ink ${opt.big ? "text-6xl" : "text-3xl"}`}>{opt.label}</span>
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
      >
        <span className="text-xl" aria-hidden>
          {state === "correct" ? "🌟" : state === "retry" ? "💛" : "👆"}
        </span>
        <p className="font-ui font-semibold text-ink">
          {message || "Tap your answer — take your time."}
        </p>
      </div>
    </div>
  );
}
