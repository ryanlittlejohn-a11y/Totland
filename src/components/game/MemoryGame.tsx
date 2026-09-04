import { useEffect, useMemo, useState } from "react";
import { memorySet } from "@/lib/rounds";
import { shuffle } from "@/lib/content";
import { chime, say } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";

export function MemoryGame({
  kind = "animals",
  onFinish,
}: {
  kind?: string;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, "memory").level;
  const deck = useMemo(() => (hydrated ? shuffle(memorySet(kind, level)) : []), [hydrated, kind, level]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (hydrated) say("Find the matching pairs.");
  }, [hydrated]);

  useEffect(() => {
    if (flipped.length !== 2) return undefined;
    const a = deck.find((c) => c.key === flipped[0])!;
    const b = deck.find((c) => c.key === flipped[1])!;
    const match = a.pairId === b.pairId;
    setTries((t) => t + 1);
    update((p) => recordAnswer(p, { skill: "memory", correct: match, responseMs: 2000, itemId: a.pairId }));
    const timer = window.setTimeout(() => {
      if (match) {
        setFound((f) => [...f, a.pairId]);
        chime("correct", profile.sfx);
        say(`${a.label}! Great job!`);
      }
      setFlipped([]);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [flipped, deck, update, profile.sfx]);

  useEffect(() => {
    if (!deck.length || found.length !== deck.length / 2) return undefined;
    const pairs = deck.length / 2;
    const accuracy = pairs / Math.max(1, tries);
    const stars = tries <= pairs + 1 ? 3 : 2;
    update((p) => recordGameComplete(p, "memory", stars, 2));
    const t = window.setTimeout(() => onFinish(stars, accuracy), 900);
    return () => window.clearTimeout(t);
  }, [found, deck.length, tries, onFinish, update]);

  return (
    <div>
      <p className="font-ui text-[22px] font-semibold text-ink">Find the matching pairs!</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {deck.map((card) => {
          const open = flipped.includes(card.key) || found.includes(card.pairId);
          return (
            <button
              key={card.key}
              type="button"
              aria-label={open ? card.label : "hidden card"}
              onClick={() => {
                if (open || flipped.length === 2) return;
                setFlipped((f) => [...f, card.key]);
              }}
              className={`aspect-square rounded-3xl grid place-items-center wood-block transition-transform active:translate-y-1 ${
                open ? "bg-card" : "bg-wood"
              }`}
            >
              <span className={card.emoji.length > 2 ? "font-ui text-2xl font-bold text-ink" : "text-5xl"}>
                {open ? card.emoji : "❔"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
