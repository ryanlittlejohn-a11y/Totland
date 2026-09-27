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

const SPANISH_SHAPES: Record<string, { article: "el" | "la"; label: string; adjective: "bonito" | "bonita" }> = {
  circle: { article: "el", label: "círculo", adjective: "bonito" },
  square: { article: "el", label: "cuadrado", adjective: "bonito" },
  triangle: { article: "el", label: "triángulo", adjective: "bonito" },
  star: { article: "la", label: "estrella", adjective: "bonita" },
  heart: { article: "el", label: "corazón", adjective: "bonito" },
  diamond: { article: "el", label: "rombo", adjective: "bonito" },
};

function spanishNonLetterGlyph(kind: string, glyph: string) {
  if (kind === "numbers") return { article: "el" as const, label: glyph, adjective: "bonito" as const };
  return SPANISH_SHAPES[glyph] ?? { article: "la" as const, label: glyph, adjective: "bonita" as const };
}

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
    if (first) {
      const spanish = spanishNonLetterGlyph(kind, first);
      say(isLetters
        ? L(`Let's trace ${first}. Follow the line with your finger.`, `Vamos a trazar la ${first}. Sigue la línea con tu dedo.`)
        : L(`Let's trace ${first}. Follow the line with your finger.`, `Vamos a trazar ${spanish.article} ${spanish.label}. Sigue la línea con tu dedo.`));
    }
  }, [hydrated, isLetters, kind, profile, queue.length]);

  if (!hydrated || !queue.length) return null;

  const finishGlyph = (good: boolean) => {
    update((current) => {
      const scored = recordAnswer(current, { skill: "tracing", correct: good, responseMs: 4000, itemId: glyph });
      return good && isLetters ? recordTracedLetter(scored, glyph) : scored;
    });
    chime(good ? "correct" : "retry", profile.sfx);
    const spanish = spanishNonLetterGlyph(kind, glyph);
    say(good
      ? isLetters
        ? L(`Beautiful ${glyph}! Great job!`, `¡Qué bonita ${glyph}! ¡Muy bien!`)
        : L(`Beautiful ${glyph}! Great job!`, `¡Qué ${spanish.adjective} ${spanish.article} ${spanish.label}! ¡Muy bien!`)
      : isLetters
        ? L("Great try! Let's trace it again.", "¡Buen intento! Vamos a trazarla otra vez.")
        : L("Great try! Let's trace it again.", "¡Buen intento! Vamos a intentarlo otra vez."));
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
    if (nextGlyph) {
      const nextSpanish = spanishNonLetterGlyph(kind, nextGlyph);
      say(isLetters
        ? L(`Now trace ${nextGlyph}.`, `Ahora traza la ${nextGlyph}.`)
        : L(`Now trace ${nextGlyph}.`, `Ahora traza ${nextSpanish.article} ${nextSpanish.label}.`));
    }
  };

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">
        {isLetters
          ? L(`Trace the letter ${glyph}`, `Traza la letra ${glyph}`)
          : L(`Trace ${glyph}`, `Traza ${spanishNonLetterGlyph(kind, glyph).article} ${spanishNonLetterGlyph(kind, glyph).label}`)}
      </p>
      <p className="mt-1 font-ui text-sm text-inksoft">{index + 1} / 3</p>
      <TracingCanvas key={`${glyph}-${attempt}`} glyph={glyph} onDone={finishGlyph} />
    </div>
  );
}