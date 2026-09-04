import { useEffect, useMemo, useState } from "react";
import { memoryDeck } from "@/lib/games";
import { chime, say } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";

export function MemoryGame({ onFinish }: { onFinish: (stars: number) => void }) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, "memory").level;
  const deck = useMemo(() => (hydrated ? memoryDeck(level) : []), [hydrated, level]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (hydrated) say("Find the matching pairs.");
  }, [hydrated]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const a = deck.find((c) => c.key === flipped[0])!;
    const b = deck.find((c) => c.key === flipped[1])!;
    const match = a.pairId === b.pairId;
    setTries((t) => t + 1);
    update((p) => recordAnswer(p, { skill: "memory", correct: match, responseMs: 2000 }));
    const timer = window.setTimeout(() => {
      if (match) {
        setFound((f) => [...f, a.pairId]);
        chime("correct", profile.sfx);
        say(`${a.pairId}! Great job!`);
      }
      setFlipped([]);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [flipped, deck, update, profile.sfx]);

  useEffect(() => {
    if (!deck.length || found.length !== deck.length / 2) return;
    {
      const stars = tries <= deck.length / 2 + 1 ? 3 : 2;
      update((p) => recordGameComplete(p, "memory", stars, 2));
      const t = window.setTimeout(() => onFinish(stars), 900);
      return () => window.clearTimeout(t);
    }
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
              aria-label={open ? card.pairId : "hidden card"}
              onClick={() => {
                if (open || flipped.length === 2) return;
                setFlipped((f) => [...f, card.key]);
              }}
              className={`aspect-square rounded-3xl grid place-items-center wood-block transition-transform active:translate-y-1 ${
                open ? "bg-card" : "bg-wood"
              }`}
            >
              <span className="text-5xl">{open ? card.emoji : "❔"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
