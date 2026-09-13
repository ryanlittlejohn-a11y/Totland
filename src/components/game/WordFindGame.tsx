import { useEffect, useMemo, useRef, useState } from "react";
import { buildWordFind, type WordFindPuzzle } from "@/lib/wordfind-puzzle";
import { wordEmoji, type WordFindTheme } from "@/lib/wordfinds";
import { chime, say } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { L, title as tTitle } from "@/lib/i18n";

const HIGHLIGHTS = ["bg-moss/50", "bg-amber/50", "bg-sky/50", "bg-plum/40", "bg-clay/40"];

export function WordFindGame({
  theme,
  onFinish,
}: {
  theme: WordFindTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, "wordsearch").level;
  const [seed] = useState(() => Math.floor(Math.random() * 100000) + 1);

  const puzzle: WordFindPuzzle | null = useMemo(
    () => (hydrated ? buildWordFind(theme, level, seed) : null),
    [hydrated, theme, level, seed],
  );

  const [found, setFound] = useState<string[]>([]);
  const [trail, setTrail] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const dragging = useRef(false);
  const startCell = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (puzzle) say(L("Find the words. Slide your finger across each one.", "Encuentra las palabras. Desliza el dedo sobre cada una."));
  }, [puzzle]);

  useEffect(() => {
    if (!puzzle || done.current) return;
    if (found.length === 0 || found.length < puzzle.placed.length) return;
    done.current = true;
    const accuracy = puzzle.placed.length / Math.max(1, tries);
    const stars = accuracy > 0.8 ? 3 : accuracy > 0.5 ? 2 : 1;
    update((p) => ({
      ...recordGameComplete(p, "wordsearch", stars, 2),
      wordFinds: p.wordFinds?.includes(theme.id) ? p.wordFinds : [...(p.wordFinds ?? []), theme.id],
    }));
    chime("reward", profile.sfx);
    say(L("You found them all! Great job!", "¡Las encontraste todas! ¡Buen trabajo!"));
    const t = window.setTimeout(() => onFinish(stars, accuracy), 1000);
    return () => window.clearTimeout(t);
  }, [found, puzzle, tries, update, onFinish, profile.sfx, theme.id]);

  // Measured once when the drag starts, so a swipe never forces the phone to
  // re-measure the page on every tiny movement.
  const box = useRef<DOMRect | null>(null);

  const cellAt = (x: number, y: number, size: number): number | null => {
    const r = box.current;
    if (!r || r.width === 0 || r.height === 0) return null;
    const col = Math.floor(((x - r.left) / r.width) * size);
    const row = Math.floor(((y - r.top) / r.height) * size);
    if (col < 0 || row < 0 || col >= size || row >= size) return null;
    return row * size + col;
  };

  const pathBetween = (a: number, b: number, size: number): number[] => {
    const ar = Math.floor(a / size);
    const ac = a % size;
    const br = Math.floor(b / size);
    const bc = b % size;
    if (ar === br) {
      const step = bc >= ac ? 1 : -1;
      const out: number[] = [];
      for (let c = ac; step > 0 ? c <= bc : c >= bc; c += step) out.push(ar * size + c);
      return out;
    }
    if (ac === bc) {
      const step = br >= ar ? 1 : -1;
      const out: number[] = [];
      for (let r = ar; step > 0 ? r <= br : r >= br; r += step) out.push(r * size + ac);
      return out;
    }
    return [a];
  };

  if (!puzzle) return <div className="h-72 rounded-3xl felt-panel" />;

  const foundCells = new Map<number, number>();
  puzzle.placed.forEach((p, i) => {
    if (found.includes(p.word)) p.cells.forEach((c) => foundCells.set(c, i));
  });

  const finishDrag = () => {
    const path = trail;
    dragging.current = false;
    startCell.current = null;
    setTrail([]);
    if (path.length < 2) return;
    const key = [...path].sort((a, b) => a - b).join(",");
    const match = puzzle.placed.find(
      (p) => !found.includes(p.word) && [...p.cells].sort((a, b) => a - b).join(",") === key,
    );
    setTries((t) => t + 1);
    update((p) =>
      recordAnswer(p, { skill: "wordsearch", correct: !!match, responseMs: 4000, itemId: match?.word ?? theme.id }),
    );
    if (match) {
      setFound((f) => [...f, match.word]);
      chime("correct", profile.sfx);
      if (found.length + 1 < puzzle.placed.length) say(L(`You found ${match.word}!`, `¡Encontraste ${match.word}!`));
    } else {
      chime("retry", profile.sfx);
      say(L("Keep trying!", "¡Sigue intentando!"));
    }
  };

  const onDown = (e: React.PointerEvent) => {
    const i = cellAt(e.clientX, e.clientY);
    if (i === null) return;
    dragging.current = true;
    startCell.current = i;
    setTrail([i]);
    gridRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current || startCell.current === null) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i === null) return;
    setTrail(pathBetween(startCell.current, i, puzzle.size));
  };

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">
        {theme.emoji} {tTitle(theme.title)}
      </p>
      <p className="mt-1 font-ui text-sm text-inksoft">
        {L("Slide your finger across a word to find it", "Desliza el dedo sobre una palabra para encontrarla")}
      </p>

      <div
        ref={gridRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        className="mt-4 grid select-none gap-1 rounded-3xl bg-card/60 p-2"
        style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`, touchAction: "none" }}
      >
        {puzzle.cells.map((c, i) => {
          const fi = foundCells.get(i);
          const tint = fi === undefined ? "" : HIGHLIGHTS[fi % HIGHLIGHTS.length];
          const active = trail.includes(i);
          return (
            <div
              key={i}
              data-cell={i}
              className={`aspect-square grid place-items-center rounded-xl font-ui font-bold text-ink ${
                active ? "bg-clay/60" : tint || "bg-card"
              } ${puzzle.size > 8 ? "text-sm" : "text-lg"}`}
            >
              {c}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {puzzle.placed.map((p) => {
          const got = found.includes(p.word);
          return (
            <button
              key={p.word}
              type="button"
              onClick={() => say(p.word)}
              className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-left font-ui font-semibold wood-block ${
                got ? "bg-moss/40 text-inksoft line-through" : "bg-card text-ink"
              }`}
            >
              <span aria-hidden className="text-xl">
                {wordEmoji(p.word, theme.emoji)}
              </span>
              <span>{p.word}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
