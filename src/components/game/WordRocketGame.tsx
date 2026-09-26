import { useCallback, useEffect, useRef, useState } from "react";
import { orderSet } from "@/lib/rounds";
import { shuffle, type SkillId } from "@/lib/content";
import { L, getLang } from "@/lib/i18n";
import { chime, say, setNarration, stripEmoji, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";
import { GameThemeScene } from "./GameThemeScene";
import { RocketLaunchScene } from "./RocketLaunchScene";

/**
 * Word Rocket: drag letter tiles into the rocket's fuel slots to spell a word.
 * Flexible slots — each slot accepts only its own letter, in any order.
 * Wrong drops and wrong taps are playful retries, never misses.
 */
export function WordRocketGame({
  kind,
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  kind: string;
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const level = skillOf(profile, skill).level;
  const [set, setSet] = useState<ReturnType<typeof orderSet> | null>(null);
  const [tiles, setTiles] = useState<{ id: string; label: string }[]>([]);
  const [lockedSlots, setLockedSlots] = useState<(string | null)[]>([]);
  const [refusedTileId, setRefusedTileId] = useState<string | null>(null);
  const [launched, setLaunched] = useState(false);
  const [message, setMessage] = useState("");
  const started = useRef(Date.now());

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const word = set ? set.seq.map((s) => s.label).join("") : "";

  const prompt = useCallback(
    (w: string) => L(`Spell ${w} to launch the rocket!`, `¡Escribe ${w} para lanzar el cohete!`),
    [],
  );

  useEffect(() => {
    if (!hydrated || set) return;
    const generated = orderSet(kind, level);
    setSet(generated);
    setTiles(shuffle(generated.seq.map((s) => ({ id: s.id, label: s.label }))));
    setLockedSlots(generated.seq.map(() => null));
    started.current = Date.now();
    const w = generated.seq.map((s) => s.label).join("");
    say(prompt(w));
  }, [hydrated, set, kind, level, prompt]);

  const onPlace = (tileId: string, slotIndex: number) => {
    if (!set || launched || lockedSlots[slotIndex]) return;
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) return;

    if (tile.label !== set.seq[slotIndex]!.label) {
      // Wrong slot: gentle bounce back, no answer recorded, no penalty.
      setRefusedTileId(tileId);
      const retry = L(
        `That slot needs a different letter. Try again!`,
        `Ese tanque necesita otra letra. ¡Inténtalo de nuevo!`,
      );
      setMessage(retry);
      chime("retry", profile.sfx);
      say(retry);
      window.setTimeout(() => setRefusedTileId(null), 700);
      return;
    }

    const next = lockedSlots.slice();
    next[slotIndex] = tileId;
    setLockedSlots(next);
    update((p) =>
      recordAnswer(p, {
        skill,
        correct: true,
        responseMs: Date.now() - started.current,
        itemId: tile.label,
      }),
    );
    themeChime(theme.motif, profile.sfx);
    say(tile.label);

    if (next.every(Boolean)) {
      const reveal = getLang() === "es"
        ? `¡${word.split("").join("-")} forma ${word.toLowerCase()}!`
        : `${word.split("").join("-")} spells ${word.toLowerCase()}!`;
      const praise = L("Blast off! ", "¡Despegue! ");
      const text = `${praise}${reveal}`;
      setLaunched(true);
      setMessage(text);
      chime("reward", profile.sfx);
      say(stripEmoji(text));
      window.setTimeout(() => {
        update((p) => recordGameComplete(p, skill, 3, 1));
        onFinish(3, 1);
      }, 2600);
    } else {
      setMessage(L("Clunk! Fuel loaded.", "¡Clonc! Combustible listo."));
    }
  };

  if (!set) return <div className="h-64 rounded-3xl felt-panel" />;

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(prompt(word))}
        className="relative w-full rounded-3xl rounded-tl-md felt-panel px-4 py-3 text-left"
      >
        <p className="pr-9 font-ui text-[22px] font-semibold leading-tight text-ink">{prompt(word)}</p>
        <span className="absolute bottom-2 right-2 grid size-9 place-items-center text-xl" aria-hidden>🔊</span>
      </button>

      <RocketLaunchScene
        tiles={tiles}
        slots={set.seq.map((s) => s.label)}
        lockedSlots={lockedSlots}
        refusedTileId={refusedTileId}
        launched={launched}
        disabled={launched}
        onPlace={onPlace}
      />

      <div
        className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${
          launched ? "bg-moss/20" : refusedTileId ? "bg-amber/20" : "bg-card/60"
        }`}
        role="status"
      >
        <span className="text-xl" aria-hidden>{launched ? "🌟" : refusedTileId ? "🛢️" : "🚀"}</span>
        <p className="font-ui font-semibold text-ink">
          {message || L(
            "Drag each letter into its fuel slot — or tap a letter, then a slot.",
            "Arrastra cada letra a su tanque — o toca una letra y luego un tanque.",
          )}
        </p>
      </div>
    </GameThemeScene>
  );
}
