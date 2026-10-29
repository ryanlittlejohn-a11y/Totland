import { advanceAfter } from "@/lib/calm";
import { useEffect, useRef, useState } from "react";
import { SHAPES, shuffle, type SkillId } from "@/lib/content";
import { L, noun } from "@/lib/i18n";
import { chime, say, setNarration, themeChime } from "@/lib/speech";
import { recordAnswer, recordParentMiss, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";
import { shapeTrainSet, type ShapeTrainSet } from "@/lib/shape-train";
import { GameThemeScene } from "./GameThemeScene";
import { RocketLaunchScene, type RocketTile } from "./RocketLaunchScene";

const clipOf = (name: string) => SHAPES.find((s) => s.name === name)?.clip ?? "circle(50%)";

/**
 * Shape Train: the Rocket drag scene reskinned as a train. The first cars of
 * an AB/ABC shape pattern are already hooked up; the child loads shapes onto
 * the empty cars to continue the pattern. Wrong drops bounce back, no penalty.
 */
export function ShapeTrainGame({
  skill,
  theme = NEUTRAL_GAME_THEME,
  onFinish,
}: {
  skill: SkillId;
  theme?: GameTheme;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const { profile, update, hydrated } = useProfile();
  const [set, setSet] = useState<ShapeTrainSet | null>(null);
  const [tiles, setTiles] = useState<RocketTile[]>([]);
  const [locked, setLocked] = useState<(string | null)[]>([]);
  const [refusedId, setRefusedId] = useState<string | null>(null);
  const [launched, setLaunched] = useState(false);
  const [message, setMessage] = useState("");
  const tally = useRef({ hits: 0, misses: 0 });
  const started = useRef(Date.now());

  useEffect(() => setNarration(profile.narration), [profile.narration]);

  const prompt = L("Finish the shape train! What comes next?", "¡Completa el tren de figuras! ¿Qué sigue?");

  // Frozen for the session so a mid-game level change can't rebuild the train.
  useEffect(() => {
    if (!hydrated || set) return;
    const s = shapeTrainSet(skillOf(profile, skill).level);
    const carTiles = s.cars.map((c) => ({ id: c.id, label: noun(c.shape) }));
    const loose = shuffle([...carTiles.slice(s.given), ...s.decoys.map((d) => ({ id: d.id, label: noun(d.shape) }))]);
    setSet(s);
    setTiles([...carTiles.slice(0, s.given), ...loose]);
    setLocked(s.cars.map((c, i) => (i < s.given ? c.id : null)));
    started.current = Date.now();
    say(prompt);
  }, [hydrated, set, profile, skill, prompt]);

  if (!set) return <div className="h-64 rounded-3xl felt-panel" />;

  const fixed = new Set(set.cars.slice(0, set.given).map((c) => c.id));
  const shapeOfTile = (id: string) =>
    set.cars.find((c) => c.id === id)?.shape ?? set.decoys.find((d) => d.id === id)?.shape ?? "circle";

  const onPlace = (tileId: string, slotIndex: number) => {
    if (launched || locked[slotIndex]) return;
    const want = set.cars[slotIndex]!.shape;
    const got = shapeOfTile(tileId);
    if (got !== want) {
      setRefusedId(tileId);
      // Parent stats only: invisible to the child, no effect on stars/level.
      tally.current.misses += 1;
      update((p) => recordParentMiss(p, skill));
      const retry = L("That car needs a different shape. Look at the pattern!", "Ese vagón necesita otra figura. ¡Mira el patrón!");
      setMessage(retry);
      chime("retry", profile.sfx);
      say(retry);
      window.setTimeout(() => setRefusedId(null), 700);
      return;
    }
    const next = locked.slice();
    next[slotIndex] = tileId;
    setLocked(next);
    tally.current.hits += 1;
    update((p) => recordAnswer(p, { skill, correct: true, responseMs: Date.now() - started.current, itemId: want }));
    started.current = Date.now();
    themeChime(theme.motif, profile.sfx);
    say(noun(want));

    if (next.every(Boolean)) {
      const pattern = set.cars.map((c) => noun(c.shape)).join(", ");
      const text = L(`Choo choo! ${pattern}!`, `¡Chu chu! ¡${pattern}!`);
      setLaunched(true);
      setMessage(text);
      chime("reward", profile.sfx);
      say(text);
      advanceAfter(() => {
        update((p) => recordGameComplete(p, skill, 3, 1));
        onFinish(3, tally.current.hits / Math.max(1, tally.current.hits + tally.current.misses));
      }, 2600);
    } else {
      setMessage(L("Clink! Car hooked up.", "¡Clinc! Vagón enganchado."));
    }
  };

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(prompt)}
        className="relative w-full rounded-3xl rounded-tl-md felt-panel px-4 py-3 text-left"
      >
        <p className="pr-9 font-ui text-[22px] font-semibold leading-tight text-ink">{prompt}</p>
        <span className="absolute bottom-2 right-2 grid size-9 place-items-center text-xl" aria-hidden>🔊</span>
      </button>

      <RocketLaunchScene
        skin="train"
        itemKind="shape"
        tiles={tiles}
        slots={set.cars.map((c) => noun(c.shape))}
        lockedSlots={locked}
        fixedTileIds={fixed}
        refusedTileId={refusedId}
        launched={launched}
        disabled={launched}
        onPlace={onPlace}
        renderTile={(t) => <span className="shape-face" style={{ clipPath: clipOf(shapeOfTile(t.id)) }} aria-hidden />}
      />

      <div
        className={`mt-5 flex min-h-[54px] items-center gap-2 rounded-3xl px-4 py-3 ${
          launched ? "bg-moss/20" : refusedId ? "bg-amber/20" : "bg-card/60"
        }`}
        role="status"
      >
        <span className="text-xl" aria-hidden>{launched ? "🌟" : "🚃"}</span>
        <p className="font-ui font-semibold text-ink">
          {message || L(
            "Drag a shape onto each empty car — or tap a shape, then a car.",
            "Arrastra una figura a cada vagón vacío — o toca una figura y luego un vagón.",
          )}
        </p>
      </div>
    </GameThemeScene>
  );
}
