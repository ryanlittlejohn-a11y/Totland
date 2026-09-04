import { useEffect, useMemo, useState } from "react";
import { LETTERS, SEARCH_BANKS, pick } from "@/lib/content";
import { chime, say } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";

/** Age-adaptive word search: 3×3 for Explorer up to 7×7 for Reader. */
function buildGrid(bank: string[], level: number) {
  const size = level <= 1 ? 3 : level <= 2 ? 4 : level <= 4 ? 5 : 6;
  const candidates = bank.filter((w) => w.length <= size);
  const word = (candidates.length ? pick(candidates) : pick(bank)).slice(0, size).toUpperCase();
  const cells: string[] = Array.from({ length: size * size }, () => pick(LETTERS));
  const vertical = level >= 3 && Math.random() < 0.4;
  const path: number[] = [];
  if (vertical) {
    const col = Math.floor(Math.random() * size);
    const startRow = Math.floor(Math.random() * (size - word.length + 1));
    for (let i = 0; i < word.length; i++) path.push((startRow + i) * size + col);
  } else {
    const row = Math.floor(Math.random() * size);
    const startCol = Math.floor(Math.random() * (size - word.length + 1));
    for (let i = 0; i < word.length; i++) path.push(row * size + startCol + i);
  }
  path.forEach((idx, i) => (cells[idx] = word[i]!));
  return { size, word, cells, path };
}

export function WordSearchGame({
  kind = "animals",
  onFinish,
}: {
  kind?: string;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, "wordsearch").level;
  const bank = SEARCH_BANKS[kind] ?? SEARCH_BANKS["animals"]!;
  const puzzle = useMemo(() => (hydrated ? buildGrid(bank, level) : null), [hydrated, bank, level]);

  const [hit, setHit] = useState<number[]>([]);
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    if (puzzle) say(`Find the word ${puzzle.word.split("").join(" ")}. ${puzzle.word}.`);
  }, [puzzle]);

  useEffect(() => {
    if (!puzzle || hit.length !== puzzle.path.length || hit.length === 0) return undefined;
    const accuracy = puzzle.path.length / Math.max(1, taps);
    const stars = accuracy > 0.9 ? 3 : accuracy > 0.6 ? 2 : 1;
    update((p) => recordGameComplete(p, "wordsearch", stars, 2));
    chime("reward", profile.sfx);
    say(`You found ${puzzle.word}!`);
    const t = window.setTimeout(() => onFinish(stars, accuracy), 900);
    return () => window.clearTimeout(t);
  }, [hit, puzzle, taps, update, onFinish, profile.sfx]);

  if (!puzzle) return <div className="h-64 rounded-3xl felt-panel" />;

  const tap = (i: number) => {
    if (hit.includes(i)) return;
    const expected = puzzle.path[hit.length];
    const correct = i === expected;
    setTaps((t) => t + 1);
    update((p) => recordAnswer(p, { skill: "wordsearch", correct, responseMs: 3000, itemId: puzzle.word }));
    if (correct) {
      setHit((h) => [...h, i]);
      chime("correct", profile.sfx);
    } else {
      chime("retry", profile.sfx);
      say(`Keep looking. The next letter is ${puzzle.word[hit.length]}.`);
    }
  };

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">
        Find the word <span className="text-clay">{puzzle.word}</span>
      </p>
      <p className="mt-1 font-ui text-sm text-inksoft">Tap the letters in order</p>
      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
      >
        {puzzle.cells.map((c, i) => (
          <button
            key={i}
            type="button"
            aria-label={`letter ${c}`}
            onClick={() => tap(i)}
            className={`aspect-square grid place-items-center rounded-2xl font-ui text-2xl font-bold wood-block active:translate-y-1 ${
              hit.includes(i) ? "bg-moss/40 text-ink" : "bg-card text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {puzzle.word.split("").map((c, i) => (
          <span
            key={i}
            className={`grid size-10 place-items-center rounded-xl font-ui text-lg font-bold ${
              i < hit.length ? "bg-amber/50 text-ink" : "bg-felt text-inksoft"
            }`}
          >
            {c}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => say(`The word is ${puzzle.word}.`)}
        className="mt-5 w-full rounded-2xl bg-card py-3 font-ui font-semibold text-ink wood-block"
      >
        🔊 Say it again
      </button>
    </div>
  );
}
