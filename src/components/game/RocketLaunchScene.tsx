import { useRef, useState, type ReactNode } from "react";
import { useDragToTarget } from "@/hooks/useDragToTarget";
import { L } from "@/lib/i18n";
import { DragTarget } from "./DragTarget";

export interface RocketTile {
  id: string;
  label: string;
}

/**
 * Word Rocket visuals layered over the shared item-to-target drag primitive.
 * Each fuel slot is a drop target that accepts only its own letter; tiles are
 * keyed draggables. Tap a tile to select it, then tap a slot to place it.
 */
export function RocketLaunchScene({
  tiles,
  slots,
  itemKind = "letter",
  skin = "rocket",
  renderTile,
  fixedTileIds,
  lockedSlots,
  refusedTileId,
  launched,
  disabled,
  onPlace,
}: {
  tiles: RocketTile[];
  /** expected label per slot, left to right */
  slots: string[];
  /** names tiles in screen-reader labels */
  itemKind?: "letter" | "number" | "shape";
  /** "train" reskins the rocket as an engine pulling cars (Shape Train) */
  skin?: "rocket" | "train";
  /** custom tile face (e.g. a shape); label stays the accessible name */
  renderTile?: (tile: RocketTile) => ReactNode;
  /** tiles pre-placed in slots that never appear in the tile field */
  fixedTileIds?: Set<string>;
  /** tile id locked into each slot index, or null */
  lockedSlots: (string | null)[];
  refusedTileId: string | null;
  launched: boolean;
  disabled: boolean;
  onPlace: (tileId: string, slotIndex: number) => void;
}) {
  const lastDrop = useRef({ id: "", at: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const train = skin === "train";
  const kindEs = itemKind === "number" ? "número" : itemKind === "shape" ? "figura" : "letra";
  const slotWord = (i: number) => train
    ? L(`Train car ${i + 1} of ${slots.length}`, `Vagón ${i + 1} de ${slots.length}`)
    : L(`Fuel slot ${i + 1} of ${slots.length}`, `Tanque ${i + 1} de ${slots.length}`);
  const lockedIds = new Set(lockedSlots.filter(Boolean) as string[]);

  const slotEnabled = (targetId: string) => {
    const index = Number(targetId.replace("slot-", ""));
    return !lockedSlots[index];
  };

  const drag = useDragToTarget({
    disabled,
    hitSlop: 24,
    isTargetEnabled: (targetId) => slotEnabled(targetId),
    onDrop: (targetId, tileId) => {
      if (targetId && tileId && slotEnabled(targetId)) {
        lastDrop.current = { id: tileId, at: Date.now() };
        setSelectedId(null);
        onPlace(tileId, Number(targetId.replace("slot-", "")));
      }
    },
  });

  const tapTile = (id: string) => {
    if (disabled || lockedIds.has(id)) return;
    if (lastDrop.current.id === id && Date.now() - lastDrop.current.at < 500) return;
    setSelectedId((current) => (current === id ? null : id));
  };

  const tapSlot = (index: number) => {
    if (disabled || !selectedId || lockedSlots[index]) return;
    if (lastDrop.current.id === selectedId && Date.now() - lastDrop.current.at < 500) return;
    const id = selectedId;
    setSelectedId(null);
    onPlace(id, index);
  };

  return (
    <div data-skin={skin} className="rocket-launch-scene relative mt-5 select-none overflow-hidden rounded-3xl" data-testid="rocket-launch-scene">
      <span className="sr-only">
        {train
          ? L(
              "Drag each shape onto its empty train car, or tap a shape and then tap a car.",
              "Arrastra cada figura a su vagón vacío, o toca una figura y luego toca un vagón.",
            )
          : L(
              "Drag each letter into its fuel slot, or tap a letter and then tap a slot.",
              "Arrastra cada letra a su tanque, o toca una letra y luego toca un tanque.",
            )}
      </span>

      <div className={`rocket-body ${launched ? "is-launched" : ""}`} aria-hidden>
        <span className="rocket-ship">{train ? "🚂" : "🚀"}</span>
        <div className="rocket-slots">
          {slots.map((label, index) => {
            const lockedId = lockedSlots[index];
            const tile = lockedId ? tiles.find((t) => t.id === lockedId) : null;
            return (
              <DragTarget
                key={index}
                register={drag.registerTarget(`slot-${index}`)}
                onClick={() => tapSlot(index)}
                disabled={disabled || !!lockedId}
                aria-label={
                  tile
                    ? `${slotWord(index)}, ${L(itemKind, kindEs)} ${tile.label}`
                    : `${slotWord(index)}, ${L("empty", "vacío")}`
                }
                data-rocket-slot={index}
                className={`rocket-slot ${drag.hoverId === `slot-${index}` ? "is-hover" : ""} ${tile ? "is-filled" : ""}`}
              >
                {tile ? (renderTile ? renderTile(tile) : tile.label) : ""}
              </DragTarget>
            );
          })}
        </div>
        {launched && !train && <span className="rocket-flames">🔥</span>}
      </div>

      <div className="rocket-tile-field grid grid-cols-3 gap-4 px-4 pb-6 pt-5 sm:grid-cols-5">
        {tiles.map((tile, index) => {
          const active = drag.activeHandleId === tile.id;
          const locked = lockedIds.has(tile.id);
          const refused = refusedTileId === tile.id;
          const selected = selectedId === tile.id;
          if (fixedTileIds?.has(tile.id)) return null;
          if (locked) return <span key={tile.id} className="rocket-tile-spacer" aria-hidden />;
          return (
            <button
              key={tile.id}
              type="button"
              {...drag.getHandleProps(tile.id)}
              onClick={() => tapTile(tile.id)}
              disabled={disabled}
              aria-label={
                selected
                  ? L(
                      `${itemKind === "number" ? "Number" : itemKind === "shape" ? "Shape" : "Letter"} ${tile.label}, selected. Tap ${train ? "a train car" : "a fuel slot"} to place it.`,
                      `${kindEs.charAt(0).toUpperCase() + kindEs.slice(1)} ${tile.label}, elegid${itemKind === "number" ? "o" : "a"}. Toca ${train ? "un vagón" : "un tanque"} para colocarl${itemKind === "number" ? "o" : "a"}.`,
                    )
                  : L(`${itemKind === "number" ? "Number" : itemKind === "shape" ? "Shape" : "Letter"} ${tile.label}`, `${kindEs.charAt(0).toUpperCase() + kindEs.slice(1)} ${tile.label}`)
              }
              aria-pressed={selected}
              data-rocket-tile={tile.id}
              className={`rocket-tile game-theme__option relative z-10 mx-auto grid size-20 cursor-grab place-items-center rounded-2xl font-ui text-5xl font-bold text-ink ${
                active ? "is-dragging" : ""
              } ${refused ? "is-refused" : ""} ${selected ? "is-selected" : ""}`}
              style={{
                ...(active ? { transform: `translate(${drag.offset.x}px, ${drag.offset.y}px)` } : {}),
                animationDelay: `${index * 160}ms`,
              }}
            >
              {renderTile ? renderTile(tile) : tile.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
