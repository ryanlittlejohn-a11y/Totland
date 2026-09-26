import { useCallback, useEffect, useRef, useState } from "react";
import { shuffle, type SkillId } from "@/lib/content";
import { L, getLang } from "@/lib/i18n";
import { chime, say, setNarration, stripEmoji, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { JIGSAW_ANIMALS, jigsawTier, type JigsawAnimal } from "@/lib/jigsaw-animals";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";
import { GameThemeScene } from "./GameThemeScene";
import { JigsawPuzzleScene, type JigsawPiece } from "./JigsawPuzzleScene";

/**
 * Animal Jigsaw: drag picture pieces into the animal's silhouette to put it
 * back together. Piece count follows the puzzles skill level (2/4/6/9).
 * Wrong drops and wrong taps are playful retries, never misses.
 */
export function AnimalJigsawGame({
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  // Tier is fixed for the whole session: placing pieces levels the puzzles
  // skill up, and re-reading the level mid-game would reset the board.
  const [tier, setTier] = useState(() => jigsawTier(1));
  const tierSet = useRef(false);
  if (hydrated && !tierSet.current) {
    tierSet.current = true;
    setTier(jigsawTier(skillOf(profile, skill).level));
  }
  const total = tier.cols * tier.rows;

  const [animals, setAnimals] = useState<JigsawAnimal[]>([]);
  const [round, setRound] = useState(0);
  const [pieces, setPieces] = useState<JigsawPiece[]>([]);
  const [placed, setPlaced] = useState<(string | null)[]>([]);
  const [refusedPieceId, setRefusedPieceId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const started = useRef(Date.now());

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const animal = animals[round] ?? null;

  const prompt = useCallback(
    (a: JigsawAnimal) =>
      getLang() === "es" ? `¡Arma el ${a.es}!` : `Put the ${a.en} back together!`,
    [],
  );

  useEffect(() => {
    if (!hydrated || animals.length) return;
    setAnimals(shuffle(JIGSAW_ANIMALS).slice(0, tier.rounds));
  }, [hydrated, animals.length, tier.rounds]);

  useEffect(() => {
    if (!animal) return;
    const ids = shuffle(Array.from({ length: total }, (_, i) => i));
    setPieces(ids.map((slot, i) => ({ id: `p${i}`, slot })));
    setPlaced(Array.from({ length: total }, () => null));
    setDone(false);
    setMessage("");
    started.current = Date.now();
    say(prompt(animal));
  }, [animal, total, prompt]);

  const onPlace = (pieceId: string, slotIndex: number) => {
    if (!animal || done || placed[slotIndex]) return;
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece) return;

    if (piece.slot !== slotIndex) {
      // Wrong spot: gentle bounce back, no answer recorded, no penalty.
      setRefusedPieceId(pieceId);
      const retry = L("Hmm, try another spot!", "¡Mmm, prueba en otro lugar!");
      setMessage(retry);
      chime("retry", profile.sfx);
      say(retry);
      window.setTimeout(() => setRefusedPieceId(null), 700);
      return;
    }

    const next = placed.slice();
    next[slotIndex] = pieceId;
    setPlaced(next);
    update((p) =>
      recordAnswer(p, {
        skill,
        correct: true,
        responseMs: Date.now() - started.current,
        itemId: animal.id,
      }),
    );
    themeChime(theme.motif, profile.sfx);

    if (next.every(Boolean)) {
      const praise = getLang() === "es" ? `¡Hiciste un ${animal.es}! ` : `You made a ${animal.en}! `;
      const text = `${praise}${animal.emoji}`;
      setDone(true);
      setMessage(text);
      chime("reward", profile.sfx);
      say(stripEmoji(text));
      window.setTimeout(() => {
        if (round + 1 < animals.length) {
          setRound(round + 1);
        } else {
          update((p) => recordGameComplete(p, skill, 3, 1));
          onFinish(3, 1);
        }
      }, 2600);
    } else {
      setMessage(L("Click! It fits.", "¡Clic! Encajó."));
    }
  };

  if (!animal || !pieces.length) return <div className="h-64 rounded-3xl felt-panel" />;

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(prompt(animal))}
        className="relative w-full rounded-3xl rounded-tl-md felt-panel px-4 py-3 text-left"
      >
        <p className="pr-9 font-ui text-[22px] font-semibold leading-tight text-ink">{prompt(animal)}</p>
        <span className="absolute bottom-2 right-2 grid size-9 place-items-center text-xl" aria-hidden>🔊</span>
      </button>

      <JigsawPuzzleScene
        animal={animal}
        tier={tier}
        pieces={pieces}
        placed={placed}
        refusedPieceId={refusedPieceId}
        done={done}
        disabled={done}
        onPlace={onPlace}
      />

      <div
        className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${
          done ? "bg-moss/20" : refusedPieceId ? "bg-amber/20" : "bg-card/60"
        }`}
        role="status"
      >
        <span className="text-xl" aria-hidden>{done ? "🌟" : refusedPieceId ? "🧩" : animal.emoji}</span>
        <p className="font-ui font-semibold text-ink">
          {message || L(
            "Drag each piece into the picture — or tap a piece, then its spot.",
            "Arrastra cada pieza a la imagen — o toca una pieza y luego su lugar.",
          )}
        </p>
      </div>
    </GameThemeScene>
  );
}
