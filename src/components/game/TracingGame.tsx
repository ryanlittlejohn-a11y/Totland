import { useEffect, useState } from "react";
import { LETTERS, SHAPES } from "@/lib/content";
import { chime, say } from "@/lib/speech";
import {
  recordAnswer,
  recordGameComplete,
  recordTracedLetter,
  tracingProgressOf,
  useProfile,
} from "@/lib/profile";
import { L } from "@/lib/i18n";
import { TracingCanvas } from "./TracingCanvas";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function letterTracingQueue(uppercase: string[], lowercase: string[], recent: string[]): string[] {
  const forms = LETTERS.flatMap((letter) => [letter, letter.toLowerCase()]);
  const uncovered = forms.filter((glyph) =>
    glyph === glyph.toUpperCase() ? !uppercase.includes(glyph) : !lowercase.includes(glyph.toUpperCase()),
  );
  const available = uncovered.length >= 3 ? uncovered : forms.filter((glyph) => !recent.includes(glyph));
  const pool = available.length >= 3 ? available : forms;
  return shuffle(pool).slice(0, 3);
}

const nonLetterGlyphs = (kind: string) =>
  kind === "numbers" ? Array.from({ length: 10 }, (_, index) => String(index)) : SHAPES.map((shape) => shape.name);

/** Existing tracing canvas with systematic uppercase/lowercase coverage around it. */
export function TracingGame({ kind = "letters", onFinish }: { kind?: string; onFinish: (stars: number, accuracy: number) => void }) {
  const { profile, update, hydrated } = useProfile();
  const [queue, setQueue] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const glyph = queue[index] ?? "A";
  const isLetters = kind === "letters";

  useEffect(() => {
    if (!hydrated || queue.length) return;
    const progress = tracingProgressOf(profile);
    const nextQueue = isLetters
      ? letterTracingQueue(progress.uppercase, progress.lowercase, progress.recentLetters)
      : shuffle(nonLetterGlyphs(kind)).slice(0, 3);
    setQueue(nextQueue);
    const first = nextQueue[0];
    if (first) say(L(`Let's trace ${first}. Follow the line with your finger.`, `Vamos a trazar la ${first}. Sigue la línea con tu dedo.`));
  }, [hydrated, isLetters, kind, profile, queue.length]);

  if (!hydrated || !queue.length) return null;

  const finishGlyph = (good: boolean) => {
    update((current) => {
      const scored = recordAnswer(current, { skill: "tracing", correct: good, responseMs: 4000, itemId: glyph });
      return good && isLetters ? recordTracedLetter(scored, glyph) : scored;
    });
    chime(good ? "correct" : "retry", profile.sfx);
    say(good ? L(`Beautiful ${glyph}! Great job!`, `¡Qué bonita ${glyph}! ¡Muy bien!`) : L("Great try! Let's trace it again.", "¡Buen intento! Vamos a trazarla otra vez."));
    if (!good) {
      setAttempt((value) => value + 1);
      return;
    }
    const next = index + 1;
    if (next >= 3) {
      update((current) => recordGameComplete(current, "tracing", 3, 2));
      onFinish(3, 1);
      return;
    }
    setIndex(next);
    setAttempt(0);
    const nextGlyph = queue[next];
    if (nextGlyph) say(L(`Now trace ${nextGlyph}.`, `Ahora traza la ${nextGlyph}.`));
  };

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">
        {isLetters ? L(`Trace the letter ${glyph}`, `Traza la letra ${glyph}`) : L(`Trace ${glyph}`, `Traza ${glyph}`)}
      </p>
      <p className="mt-1 font-ui text-sm text-inksoft">{index + 1} / 3</p>
      <TracingCanvas key={`${glyph}-${attempt}`} glyph={glyph} onDone={finishGlyph} />
    </div>
  );
}