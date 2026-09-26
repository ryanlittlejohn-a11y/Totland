import { useRef, useState } from "react";
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
  lockedSlots,
  refusedTileId,
  launched,
  disabled,
  onPlace,
}: {
  tiles: RocketTile[];
  /** expected label per slot, left to right */
  slots: string[];
  /** tile id locked into each slot index, or null */
  lockedSlots: (string | null)[];
  refusedTileId: string | null;
  launched: boolean;
  disabled: boolean;
  onPlace: (tileId: string, slotIndex: number) => void;
}) {
  const lastDrop = useRef({ id: "", at: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    <div className="rocket-launch-scene relative mt-5 select-none overflow-hidden rounded-3xl" data-testid="rocket-launch-scene">
      <span className="sr-only">
        {L(
          "Drag each letter into its fuel slot, or tap a letter and then tap a slot.",
          "Arrastra cada letra a su tanque, o toca una letra y luego toca un tanque.",
        )}
      </span>

      <div className={`rocket-body ${launched ? "is-launched" : ""}`} aria-hidden>
        <span className="rocket-ship">🚀</span>
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
                    ? L(`Fuel slot ${index + 1} of ${slots.length}, letter ${tile.label}`, `Tanque ${index + 1} de ${slots.length}, letra ${tile.label}`)
                    : L(`Fuel slot ${index + 1} of ${slots.length}, empty`, `Tanque ${index + 1} de ${slots.length}, vacío`)
                }
                data-rocket-slot={index}
                className={`rocket-slot ${drag.hoverId === `slot-${index}` ? "is-hover" : ""} ${tile ? "is-filled" : ""}`}
              >
                {tile ? tile.label : ""}
              </DragTarget>
            );
          })}
        </div>
        {launched && <span className="rocket-flames">🔥</span>}
      </div>

      <div className="rocket-tile-field grid grid-cols-3 gap-4 px-4 pb-6 pt-5 sm:grid-cols-5">
        {tiles.map((tile, index) => {
          const active = drag.activeHandleId === tile.id;
          const locked = lockedIds.has(tile.id);
          const refused = refusedTileId === tile.id;
          const selected = selectedId === tile.id;
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
                  ? L(`Letter ${tile.label}, selected. Tap a fuel slot to place it.`, `Letra ${tile.label}, elegida. Toca un tanque para colocarla.`)
                  : L(`Letter ${tile.label}`, `Letra ${tile.label}`)
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
              {tile.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
