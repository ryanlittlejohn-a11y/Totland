import { advanceAfter } from "@/lib/calm";
import { useEffect, useRef, useState } from "react";
import type { SkillId } from "@/lib/content";
import { chime, say, themeChime } from "@/lib/speech";
import { recordAnswer, recordGameComplete, skillOf, useProfile } from "@/lib/profile";
import { L } from "@/lib/i18n";
import {
  fits,
  isDecoy,
  neededCount,
  placeSet,
  type Piece,
  type PlaceSet,
  type Slot,
} from "@/lib/scenes";
import { useDragToTarget } from "@/hooks/useDragToTarget";
import { GameThemeScene } from "./GameThemeScene";
import { DragTarget } from "./DragTarget";
import { TileView, VisualView } from "./SceneVisual";
import { NEUTRAL_GAME_THEME, type GameTheme } from "@/lib/game-themes";

const ROUNDS = 3;
const CELL = 72;

/**
 * Shared "put the pieces where they belong" engine: sorting baskets,
 * assembled puzzles, shape builds, pattern rows and loading a train.
 * Drag a piece onto its place, or tap a piece then tap its place.
 */
export function PlaceGame({
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
  const levelRef = useRef(level);
  levelRef.current = level;

  // Frozen per round: a mid-round level-up must never re-deal the pieces.
  const [set, setSet] = useState<PlaceSet | null>(null);
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string>>({}); // pieceId -> slotId
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const tally = useRef({ right: 0, total: 0 });
  const doneRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (hydrated && !set) setSet(placeSet(kind, level));
  }, [hydrated, set, kind, level]);
  useEffect(() => {
    if (set) say(set.prompt);
  }, [set]);

  const place = (piece: Piece, slot: Slot) => {
    if (!set || doneRef.current || placed[piece.id]) return;
    const used = Object.values(placed).filter((s) => s === slot.id).length;
    const ok = fits(slot, piece) && used < slot.capacity;
    tally.current.total += 1;
    update((p) => recordAnswer(p, { skill, correct: ok, responseMs: 2500 }));
    setSelected(null);
    if (!ok) {
      setWrong(piece.id);
      chime("retry", profile.sfx);
      setMessage(L("Nearly! Try another place.", "¡Casi! Prueba otro sitio."));
      window.setTimeout(() => setWrong(null), 700);
      return;
    }
    tally.current.right += 1;
    themeChime(theme.motif, profile.sfx);
    const next = { ...placed, [piece.id]: slot.id };
    setPlaced(next);
    setMessage(L("Yes! That fits.", "¡Sí! Encaja."));
    // Computed "done": every non-decoy piece has a home.
    if (Object.keys(next).length !== neededCount(set)) return;
    doneRef.current = true;
    chime("reward", profile.sfx);
    say(L("You did it!", "¡Lo lograste!"));
    timer.current = advanceAfter(() => {
      if (round + 1 >= ROUNDS) {
        const accuracy = tally.current.right / Math.max(1, tally.current.total);
        const stars = accuracy > 0.9 ? 3 : accuracy > 0.6 ? 2 : 1;
        update((p) => recordGameComplete(p, skill, stars, 1));
        onFinishRef.current(stars, accuracy);
        return;
      }
      setRound((r) => r + 1);
      setPlaced({});
      setMessage("");
      doneRef.current = false;
      setSet(placeSet(kind, levelRef.current));
    }, 1400);
  };

  const drag = useDragToTarget({
    onDrop: (slotId, pieceId) => {
      if (!set || !pieceId) return;
      const piece = set.pieces.find((p) => p.id === pieceId);
      if (!piece) return;
      const slot = slotId ? set.slots.find((s) => s.id === slotId) : null;
      if (slot) place(piece, slot);
      else setSelected((cur) => (cur === pieceId ? null : pieceId));
    },
  });

  if (!set) return <div className="h-64 rounded-3xl felt-panel" />;

  const tapSlot = (slot: Slot) => {
    const piece = set.pieces.find((p) => p.id === selected);
    if (piece) place(piece, slot);
    else
      setMessage(
        L("Pick a piece first, then its place.", "Elige primero una pieza y luego su sitio."),
      );
  };

  const pieceBody = (p: Piece) =>
    p.tile ? (
      <TileView tile={p.tile} cell={CELL - 8} />
    ) : p.visual ? (
      <VisualView v={p.visual} size={CELL - 22} />
    ) : null;

  const slotFill = (slot: Slot) =>
    set.pieces
      .filter((p) => placed[p.id] === slot.id)
      .map((p) => (
        <span key={p.id} className="anim-pop">
          {pieceBody(p)}
        </span>
      ));

  const slotButton = (slot: Slot, extra = "") => (
    <DragTarget
      key={slot.id}
      register={drag.registerTarget(slot.id)}
      onClick={() => tapSlot(slot)}
      aria-label={slot.name}
      className={`place-slot grid place-items-center ${drag.hoverId === slot.id ? "place-slot--hover" : ""} ${extra}`}
    >
      {slotFill(slot).length ? (
        <span className="flex flex-wrap items-center justify-center gap-1">{slotFill(slot)}</span>
      ) : slot.tile ? (
        <span className="opacity-20">
          <TileView tile={slot.tile} cell={CELL - 8} />
        </span>
      ) : slot.ghost && slot.shadow ? (
        <span className="place-shadow" aria-hidden>
          <VisualView v={slot.ghost} size={CELL - 18} />
        </span>
      ) : slot.ghost ? (
        <VisualView v={slot.ghost} size={CELL - 26} faint={!slot.ghost.swatch} />
      ) : (
        <span className="text-2xl text-inksoft" aria-hidden>
          ＋
        </span>
      )}
    </DragTarget>
  );

  const board = () => {
    if (set.scene === "assemble") {
      const cols = set.slots[0]?.tile?.cols ?? 2;
      return (
        <div
          className="mx-auto grid w-fit gap-1 rounded-3xl felt-panel p-3"
          style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)` }}
        >
          {set.slots.map((s) => slotButton(s, "place-slot--tile"))}
        </div>
      );
    }
    if (set.scene === "baskets") {
      return (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${set.slots.length}, minmax(0,1fr))` }}
        >
          {set.slots.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              {slotButton(s, "place-slot--basket")}
              <span className="font-ui text-sm font-semibold capitalize text-ink">{s.name}</span>
            </div>
          ))}
        </div>
      );
    }
    if (set.scene === "pattern") {
      return (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-3xl felt-panel p-3">
          {set.given?.map((v, i) => (
            <span
              key={i}
              className="grid size-14 place-items-center rounded-2xl bg-card"
              aria-label={v.label}
            >
              <VisualView v={v.clip ? { clip: v.clip } : v} size={38} />
            </span>
          ))}
          {set.slots.map((s) => slotButton(s, "place-slot--small"))}
        </div>
      );
    }
    if (set.scene === "train") {
      return (
        <div className="train-track flex items-end justify-center gap-1 overflow-x-auto pb-3">
          <span
            className="train-engine grid place-items-center"
            aria-label={L(
              `Engine: letter ${set.header?.label}`,
              `Locomotora: letra ${set.header?.label}`,
            )}
          >
            <span className="text-3xl" aria-hidden>
              🚂
            </span>
            <span className="font-ui text-3xl font-bold text-ink">{set.header?.label}</span>
          </span>
          {set.slots.map((s) => slotButton(s, "place-slot--car"))}
        </div>
      );
    }
    if (set.scene === "sizes") {
      return (
        <div className="flex items-end justify-center gap-4">
          {set.slots.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              {slotButton(s, s.id === "big" ? "place-slot--bigbox" : "place-slot--smallbox")}
              <span className="font-ui text-sm font-semibold text-ink">{s.name}</span>
            </div>
          ))}
        </div>
      );
    }
    if (set.scene === "ruler") {
      return (
        <div className="ruler-board flex flex-col gap-2 rounded-3xl p-3">
          {set.slots.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="w-6 text-center font-ui text-sm font-bold text-inksoft" aria-hidden>
                {i + 1}
              </span>
              {slotButton(s, "place-slot--lane")}
            </div>
          ))}
          <p className="text-center font-ui text-xs text-inksoft" aria-hidden>
            {L("shortest ↓ longest", "más corta ↓ más larga")}
          </p>
        </div>
      );
    }
    if (set.scene === "sorter") {
      return (
        <div className="sorter-box mx-auto flex w-fit flex-wrap justify-center gap-3 p-4">
          {set.slots.map((s) => slotButton(s, "place-slot--hole"))}
        </div>
      );
    }
    if (set.scene === "shadow") {
      return (
        <div className="flex flex-wrap justify-center gap-3 rounded-3xl felt-panel p-3">
          {set.slots.map((s) => slotButton(s, "place-slot--shadow"))}
        </div>
      );
    }
    // house: stacked build
    return (
      <div className="flex flex-col items-center gap-1 rounded-3xl felt-panel p-3">
        {set.slots.map((s) => slotButton(s))}
      </div>
    );
  };

  const tray = set.pieces.filter((p) => !placed[p.id]);

  return (
    <GameThemeScene theme={theme}>
      <button
        type="button"
        onClick={() => say(set.prompt)}
        className="w-full rounded-3xl felt-panel px-4 py-3 text-left"
      >
        <p className="font-ui text-[20px] font-semibold leading-tight text-ink">
          {set.prompt} <span aria-hidden>🔊</span>
        </p>
      </button>
      <p className="mt-1 text-center font-ui text-xs text-inksoft">
        {L(`Puzzle ${round + 1} of ${ROUNDS}`, `Reto ${round + 1} de ${ROUNDS}`)}
      </p>

      {set.scene === "assemble" && set.header && (
        <div className="mt-2 flex justify-center opacity-70" aria-hidden>
          <VisualView v={set.header} size={40} />
        </div>
      )}

      <div className="mt-3">{board()}</div>

      <div className="mt-4 flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-3xl bg-card/60 p-3">
        {tray.map((p) => {
          const active = drag.activeHandleId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-label={p.name}
              aria-pressed={selected === p.id}
              {...drag.getHandleProps(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setSelected((c) => (c === p.id ? null : p.id));
              }}
              style={{
                touchAction: "none",
                transform: active
                  ? `translate(${drag.offset.x}px, ${drag.offset.y}px) scale(1.08)`
                  : undefined,
                zIndex: active ? 20 : undefined,
              }}
              className={`game-theme__option relative grid place-items-center bg-card wood-block ${
                selected === p.id ? "ring-4 ring-amber" : ""
              } ${wrong === p.id ? "anim-wiggle" : ""}`}
            >
              <span
                className="grid place-items-center"
                style={{ width: p.visual?.bar !== undefined ? 160 : CELL, height: CELL }}
              >
                {pieceBody(p)}
              </span>
            </button>
          );
        })}
        {tray.length > 0 && tray.every((p) => isDecoy(set, p)) && (
          <span className="font-ui text-sm text-inksoft">
            {L("These ones don't belong.", "Estas no van aquí.")}
          </span>
        )}
      </div>

      <p className="mt-3 min-h-6 text-center font-ui font-semibold text-ink" role="status">
        {message ||
          L(
            "Drag a piece to its place — or tap the piece, then the place.",
            "Arrastra una pieza a su sitio, o toca la pieza y luego el sitio.",
          )}
      </p>
    </GameThemeScene>
  );
}
