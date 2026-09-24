import { useEffect, useState } from "react";
import { TRACING_WORDS, type TracingWord } from "@/lib/content";
import { L } from "@/lib/i18n";
import {
  recordAnswer,
  recordGameComplete,
  recordTracedWord,
  tracingProgressOf,
  useProfile,
  wordTracingUnlocked,
} from "@/lib/profile";
import { chime, say } from "@/lib/speech";
import { TracingCanvas } from "./TracingCanvas";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function wordTracingQueue(words: TracingWord[], covered: string[]): TracingWord[] {
  const uncovered = words.filter((item) => !covered.includes(item.word));
  return shuffle(uncovered.length >= 3 ? uncovered : words).slice(0, 3);
}

export function WordTracingGame({ length, onFinish }: { length: 2 | 3 | 4 | 5; onFinish: (stars: number, accuracy: number) => void }) {
  const { profile, update, hydrated } = useProfile();
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [words, setWords] = useState<TracingWord[]>([]);
  useEffect(() => {
    if (!hydrated || words.length) return;
    const progress = tracingProgressOf(profile);
    setWords(wordTracingQueue(TRACING_WORDS[profile.language][length], progress.words[String(length) as "2" | "3" | "4" | "5"] ?? []));
  }, [hydrated, length, profile, words.length]);
  const item = words[wordIndex];
  const letters = item ? Array.from(item.word) : [];
  const glyph = letters[letterIndex] ?? "";

  useEffect(() => {
    if (!item || !glyph) return;
    say(L(`Trace the word ${item.word}. Start with ${glyph}.`, `Traza la palabra ${item.word}. Empieza con ${glyph}.`));
  }, [item?.word]);

  if (!hydrated || !item || !glyph) return null;

  if (!wordTracingUnlocked(profile, length)) {
    const needed = { 2: 10, 3: 14, 4: 18, 5: 22 }[length];
    return (
      <div className="rounded-3xl bg-card p-6 text-center wood-block">
        <p className="text-5xl" aria-hidden>✏️</p>
        <p className="mt-3 font-ui text-xl font-bold text-ink">{L("Keep tracing letters", "Sigue trazando letras")}</p>
        <p className="mt-2 font-ui text-sm text-inksoft">
          {L(`Trace ${needed} big and ${needed} small letters to open these words.`, `Traza ${needed} letras grandes y ${needed} pequeñas para abrir estas palabras.`)}
        </p>
      </div>
    );
  }

  const finishGlyph = (good: boolean) => {
    update((current) => recordAnswer(current, { skill: "tracing", correct: good, responseMs: 4000, itemId: `${length}:${item.word}:${letterIndex}` }));
    chime(good ? "correct" : "retry", profile.sfx);
    if (!good) {
      say(L("Great try! Let's trace it again.", "¡Buen intento! Vamos a trazarla otra vez."));
      setAttempt((value) => value + 1);
      return;
    }
    const nextLetter = letterIndex + 1;
    if (nextLetter < letters.length) {
      const nextGlyph = letters[nextLetter];
      setLetterIndex(nextLetter);
      setAttempt(0);
      if (nextGlyph) say(L(`Now trace ${nextGlyph}.`, `Ahora traza la ${nextGlyph}.`));
      return;
    }
    update((current) => recordTracedWord(current, item.word));
    say(L(`You traced ${item.word}!`, `¡Trazaste ${item.word}!`));
    const nextWord = wordIndex + 1;
    if (nextWord >= 3) {
      update((current) => recordGameComplete(current, "tracing", 3, 2));
      onFinish(3, 1);
      return;
    }
    setWordIndex(nextWord);
    setLetterIndex(0);
    setAttempt(0);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-ui text-[22px] font-semibold text-ink">{L(`Trace ${item.word}`, `Traza ${item.word}`)}</p>
        <span className="text-4xl" aria-hidden>{item.emoji}</span>
      </div>
      <div className="mt-2 flex justify-center gap-2" aria-label={L("Word progress", "Progreso de la palabra")}>
        {letters.map((letter, index) => (
          <span key={`${letter}-${index}`} className={`grid size-10 place-items-center rounded-xl font-ui text-xl font-bold ${index < letterIndex ? "bg-moss text-primary-foreground" : index === letterIndex ? "bg-clay text-primary-foreground" : "bg-felt text-inksoft"}`}>
            {letter}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center font-ui text-sm text-inksoft">{L(`Word ${wordIndex + 1} of 3`, `Palabra ${wordIndex + 1} de 3`)}</p>
      <TracingCanvas key={`${item.word}-${letterIndex}-${attempt}`} glyph={glyph} onDone={finishGlyph} />
    </div>
  );
}