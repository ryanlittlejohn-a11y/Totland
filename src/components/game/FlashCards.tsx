import { useEffect, useMemo, useState } from "react";
import { WORDS, shuffle } from "@/lib/content";
import { chime, say } from "@/lib/speech";
import { recordGameComplete, useProfile } from "@/lib/profile";
import { L, noun } from "@/lib/i18n";

export function FlashCards({ onFinish }: { onFinish: (stars: number) => void }) {
  const { profile, update, hydrated } = useProfile();
  const cards = useMemo(() => (hydrated ? shuffle(WORDS).slice(0, 8) : []), [hydrated]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (cards.length) say(noun(cards[i]!.word));
  }, [i, cards]);

  if (!cards.length) return <div className="h-72 rounded-3xl felt-panel" />;
  const card = cards[i]!;

  const next = () => {
    if (i + 1 >= cards.length) {
      update((p) => recordGameComplete(p, "flashcards", 3, 2));
      chime("reward", profile.sfx);
      onFinish(3);
    } else {
      setFlipped(false);
      setI(i + 1);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setFlipped((f) => !f);
          say(flipped ? noun(card.word) : L(`${card.word}. ${card.letter} is for ${card.word}.`, `${noun(card.word)}. ${card.letter} es de ${noun(card.word)}.`));
        }}
        className="grid aspect-[4/5] w-full place-items-center rounded-[2rem] bg-card wood-block active:translate-y-1"
      >
        <div className="text-center">
          <span className="block text-[6rem] leading-none">{card.emoji}</span>
          <span className="mt-4 block font-ui text-4xl font-bold text-ink">
            {flipped ? noun(card.word).toUpperCase() : card.letter}
          </span>
          <span className="mt-2 block font-ui text-sm text-inksoft">{L("tap the card", "toca la tarjeta")}</span>
        </div>
      </button>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => say(noun(card.word))}
          className="grid size-16 place-items-center rounded-2xl bg-card text-2xl wood-block"
          aria-label={L("Hear the word", "Escuchar la palabra")}
        >
          🔊
        </button>
        <button
          type="button"
          onClick={next}
          className="flex-1 rounded-2xl bg-clay py-4 font-ui text-xl font-bold text-primary-foreground wood-block"
        >
          {L("Next card", "Siguiente tarjeta")}
        </button>
      </div>
      <p className="mt-3 text-center font-ui text-sm text-inksoft">
        {L(`${i + 1} of ${cards.length}`, `${i + 1} de ${cards.length}`)}
      </p>
    </div>
  );
}
