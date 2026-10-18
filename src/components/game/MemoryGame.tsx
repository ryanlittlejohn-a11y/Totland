import { useEffect, useRef, useState } from "react";
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
  // Freeze the deck once dealt: a level-up from recordAnswer mid-game used to
  // re-deal it, cancelling the pending match and stranding the finished game.
  const [deck, setDeck] = useState<ReturnType<typeof memorySet>>([]);
  useEffect(() => {
    if (hydrated && deck.length === 0) setDeck(shuffle(memorySet(kind, level)));
  }, [hydrated, deck.length, kind, level]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [, setTries] = useState(0);

  useEffect(() => {
    if (hydrated) say(L("Find the matching pairs.", "Encuentra las parejas."));
  }, [hydrated]);

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const doneRef = useRef(false);
  const finishTimer = useRef<number | undefined>(undefined);
  const triesRef = useRef(0);
  useEffect(() => () => window.clearTimeout(finishTimer.current), []);

  useEffect(() => {
    if (flipped.length !== 2) return undefined;
    const a = deck.find((c) => c.key === flipped[0])!;
    const b = deck.find((c) => c.key === flipped[1])!;
    const match = a.pairId === b.pairId;
    triesRef.current += 1;
    setTries(triesRef.current);
    update((p) =>
      recordAnswer(p, { skill: "memory", correct: match, responseMs: 2000, itemId: a.pairId }),
    );
    const timer = window.setTimeout(() => {
      if (match) {
        setFound((f) => [...f, a.pairId]);
        themeChime(theme.motif, profile.sfx);
        say(L(`${a.label}! Great job!`, `¡${a.label}! ¡Muy bien!`));
      }
      setFlipped([]);
    }, 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  useEffect(() => {
    if (doneRef.current || !deck.length || found.length !== deck.length / 2) return;
    doneRef.current = true;
    const pairs = deck.length / 2;
    const accuracy = pairs / Math.max(1, triesRef.current);
    const stars = triesRef.current <= pairs + 1 ? 3 : 2;
    update((p) => recordGameComplete(p, "memory", stars, 2));
    finishTimer.current = window.setTimeout(() => onFinishRef.current(stars, accuracy), 900);
  }, [found, deck.length, update]);

  return (
    <GameThemeScene theme={theme}>
      <p className="font-ui text-[22px] font-semibold text-ink">
        {L("Find the matching pairs!", "¡Encuentra las parejas!")}
      </p>
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
              <span
                className={
                  card.emoji.length > 2 ? "font-ui text-2xl font-bold text-ink" : "text-5xl"
                }
              >
                {open ? card.emoji : "❔"}
              </span>
            </button>
          );
        })}
      </div>
    </GameThemeScene>
  );
}
