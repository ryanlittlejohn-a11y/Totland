import { useEffect, useRef, useState } from "react";
import { TRACING_WORDS, type TracingWord } from "@/lib/content";
import { L } from "@/lib/i18n";
import {
  recordAnswer,
  recordGameComplete,
  recordTracedLetter,
  recordTracedWord,
  tracingProgressOf,
  useProfile,
  wordTracingUnlocked,
} from "@/lib/profile";
import { chime, say } from "@/lib/speech";
import { unlockLetter, wordLetters } from "@/lib/word-trace";
import { WordTraceFrame } from "./WordTraceFrame";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function wordTracingQueue(words: TracingWord[], covered: string[]): TracingWord[] {
  const uncovered = words.filter((item) => !covered.includes(item.word));
  return shuffle(uncovered.length >= 3 ? uncovered : words).slice(0, 3);
}

export function WordTracingGame({ length, onFinish }: { length: 2 | 3 | 4 | 5; onFinish: (stars: number, accuracy: number) => void }) {
  const { profile, update, hydrated } = useProfile();
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [words, setWords] = useState<TracingWord[]>([]);
  const finished = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  // Round is dealt once and frozen for the game's lifetime.
  useEffect(() => {
    if (!hydrated || words.length) return;
    const progress = tracingProgressOf(profile);
    setWords(wordTracingQueue(TRACING_WORDS[profile.language][length], progress.words[String(length) as "2" | "3" | "4" | "5"] ?? []));
  }, [hydrated, length, profile, words.length]);
  const item = words[wordIndex];
  const letters = item ? wordLetters(item.word) : [];
  const glyph = letters[letterIndex] ?? "";

  useEffect(() => {
    if (!item || !letters[0]) return;
    say(L(`Trace the word ${item.word}. Start with ${letters[0]}.`, `Traza la palabra ${item.word}. Empieza con ${letters[0]}.`));
  }, [item?.word]);

  if (!hydrated || !item || !glyph) return null;

  if (!wordTracingUnlocked(profile, length)) {
    const needed = { 2: 10, 3: 14, 4: 18, 5: 22 }[length];
    const done = tracingProgressOf(profile);
    const big = Math.min(done.uppercase.length, needed);
    const small = Math.min(done.lowercase.length, needed);
    return (
      <div className="rounded-3xl bg-card p-6 text-center wood-block">
        <p className="text-5xl" aria-hidden>✏️</p>
        <p className="mt-3 font-ui text-xl font-bold text-ink">{L("Keep tracing letters", "Sigue trazando letras")}</p>
        <p className="mt-2 font-ui text-sm text-inksoft">
          {L(`Trace ${needed} different big and ${needed} different small letters to open these words.`, `Traza ${needed} letras grandes y ${needed} pequeñas diferentes para abrir estas palabras.`)}
        </p>
        <p className="mt-3 font-ui text-base font-semibold text-ink">
          {L(`Big: ${big} of ${needed} · Small: ${small} of ${needed}`, `Grandes: ${big} de ${needed} · Pequeñas: ${small} de ${needed}`)}
        </p>
      </div>
    );
  }

  const letterDone = (index: number, traced: string) => {
    update((current) => recordTracedLetter(
      recordAnswer(current, { skill: "tracing", correct: true, responseMs: 4000, itemId: `${length}:${item.word}:${index}` }),
      unlockLetter(traced),
    ));
    chime("correct", profile.sfx);
    const next = letters[index + 1];
    if (next) {
      setLetterIndex(index + 1);
      say(L(`Now trace ${next}.`, `Ahora traza la ${next}.`));
    }
  };

  const wordDone = () => {
    update((current) => recordTracedWord(current, item.word));
    say(L(`You traced ${item.word}!`, `¡Trazaste ${item.word}!`));
    const nextWord = wordIndex + 1;
    if (nextWord >= words.length) {
      if (finished.current) return;
      finished.current = true;
      update((current) => recordGameComplete(current, "tracing", 3, 2));
      finishRef.current(3, 1);
      return;
    }
    window.setTimeout(() => {
      setWordIndex(nextWord);
      setLetterIndex(0);
    }, profile.reducedMotion ? 300 : 900);
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
      <WordTraceFrame key={`${wordIndex}-${item.word}`} letters={letters} reducedMotion={profile.reducedMotion} onLetter={letterDone} onWord={wordDone} />
    </div>
  );
}
