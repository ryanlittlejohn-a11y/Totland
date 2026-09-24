import { useEffect, useMemo, useState } from "react";
import { memorySet } from "@/lib/rounds";
import { shuffle } from "@/lib/content";
import { say, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";
import { GameThemeScene } from "./GameThemeScene";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";

export function MemoryGame({
  kind = "animals",
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  kind?: string;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, "memory").level;
  const deck = useMemo(() => (hydrated ? shuffle(memorySet(kind, level)) : []), [hydrated, kind, level]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (hydrated) say(L("Find the matching pairs.", "Encuentra las parejas."));
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
        themeChime(theme.motif, profile.sfx);
        say(L(`${a.label}! Great job!`, `¡${a.label}! ¡Muy bien!`));
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
    <GameThemeScene theme={theme}>
      <p className="font-ui text-[22px] font-semibold text-ink">{L("Find the matching pairs!", "¡Encuentra las parejas!")}</p>
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
              className={`game-theme__option aspect-square grid place-items-center wood-block transition-transform active:translate-y-1 ${
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
    </GameThemeScene>
  );
}
