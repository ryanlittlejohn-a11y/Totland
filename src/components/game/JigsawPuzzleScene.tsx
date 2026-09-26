import { useRef, useState } from "react";
import { useDragToTarget } from "@/hooks/useDragToTarget";
import { L } from "@/lib/i18n";
import type { JigsawAnimal, JigsawTier } from "@/lib/jigsaw-animals";
import { DragTarget } from "./DragTarget";

export interface JigsawPiece {
  id: string;
  /** cell index this piece belongs to */
  slot: number;
}

const SLOT_NAMES_EN = ["top left", "top middle", "top right", "middle left", "center", "middle right", "bottom left", "bottom middle", "bottom right"];
const SLOT_NAMES_ES = ["arriba a la izquierda", "arriba en el medio", "arriba a la derecha", "en medio a la izquierda", "en el centro", "en medio a la derecha", "abajo a la izquierda", "abajo en el medio", "abajo a la derecha"];

function slotName(index: number, tier: JigsawTier): string {
  // For non-3x3 grids, map the cell onto the 3x3 naming grid.
  const col = index % tier.cols;
  const row = Math.floor(index / tier.cols);
  const c = tier.cols === 1 ? 1 : Math.round((col / (tier.cols - 1)) * 2);
  const r = tier.rows === 1 ? 1 : Math.round((row / (tier.rows - 1)) * 2);
  const i = r * 3 + c;
  return L(SLOT_NAMES_EN[i]!, SLOT_NAMES_ES[i]!);
}

/** CSS background cropping that shows one grid cell of the picture. */
function cellBackground(image: string, index: number, tier: JigsawTier) {
  const col = index % tier.cols;
  const row = Math.floor(index / tier.cols);
  return {
    backgroundImage: `url(${image})`,
    backgroundSize: `${tier.cols * 100}% ${tier.rows * 100}%`,
    backgroundPosition: `${tier.cols === 1 ? 0 : (col / (tier.cols - 1)) * 100}% ${tier.rows === 1 ? 0 : (row / (tier.rows - 1)) * 100}%`,
  };
}

/**
 * Animal Jigsaw visuals over the shared item-to-target drag primitive.
 * Each silhouette slot accepts only its own piece; pieces are keyed
 * draggables. Tap a piece to select it, then tap a slot to place it.
 */
export function JigsawPuzzleScene({
  animal,
  tier,
  pieces,
  placed,
  refusedPieceId,
  done,
  disabled,
  onPlace,
}: {
  animal: JigsawAnimal;
  tier: JigsawTier;
  pieces: JigsawPiece[];
  /** piece id placed in each cell, or null */
  placed: (string | null)[];
  refusedPieceId: string | null;
  done: boolean;
  disabled: boolean;
  onPlace: (pieceId: string, slotIndex: number) => void;
}) {
  const lastDrop = useRef({ id: "", at: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const placedIds = new Set(placed.filter(Boolean) as string[]);
  const total = tier.cols * tier.rows;

  const slotEnabled = (targetId: string) => !placed[Number(targetId.replace("slot-", ""))];

  const drag = useDragToTarget({
    disabled,
    hitSlop: 24,
    isTargetEnabled: (targetId) => slotEnabled(targetId),
    onDrop: (targetId, pieceId) => {
      if (targetId && pieceId && slotEnabled(targetId)) {
        lastDrop.current = { id: pieceId, at: Date.now() };
        setSelectedId(null);
        onPlace(pieceId, Number(targetId.replace("slot-", "")));
      }
    },
  });

  const tapPiece = (id: string) => {
    if (disabled || placedIds.has(id)) return;
    if (lastDrop.current.id === id && Date.now() - lastDrop.current.at < 500) return;
    setSelectedId((current) => (current === id ? null : id));
  };

  const tapSlot = (index: number) => {
    if (disabled || !selectedId || placed[index]) return;
    if (lastDrop.current.id === selectedId && Date.now() - lastDrop.current.at < 500) return;
    const id = selectedId;
    setSelectedId(null);
    onPlace(id, index);
  };

  const pieceSize = tier.cols === 3 ? "size-24" : tier.cols === 2 ? "size-28" : "size-32";

  return (
    <div className="jigsaw-scene relative mt-5 select-none overflow-hidden rounded-3xl" data-testid="jigsaw-scene">
      <span className="sr-only">
        {L(
          "Drag each piece into the picture, or tap a piece and then tap its spot.",
          "Arrastra cada pieza a la imagen, o toca una pieza y luego toca su lugar.",
        )}
      </span>

      <div
        className={`jigsaw-board relative mx-auto aspect-square w-full max-w-[340px] ${done ? "is-done" : ""}`}
        data-testid="jigsaw-board"
      >
        {/* Silhouette: the same picture as a faint dark shape, always aligned. */}
        <img
          src={animal.image}
          alt=""
          aria-hidden
          width={816}
          height={816}
          className="jigsaw-silhouette absolute inset-0 h-full w-full"
          draggable={false}
        />
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${tier.cols}, 1fr)`, gridTemplateRows: `repeat(${tier.rows}, 1fr)` }}
        >
          {Array.from({ length: total }, (_, index) => {
            const placedId = placed[index];
            const piece = placedId ? pieces.find((p) => p.id === placedId) : null;
            return (
              <DragTarget
                key={index}
                register={drag.registerTarget(`slot-${index}`)}
                onClick={() => tapSlot(index)}
                disabled={disabled || !!placedId}
                aria-label={
                  piece
                    ? L(`${slotName(index, tier)} spot, filled`, `Lugar ${slotName(index, tier)}, listo`)
                    : L(`${slotName(index, tier)} spot, empty`, `Lugar ${slotName(index, tier)}, vacío`)
                }
                data-jigsaw-slot={index}
                className={`jigsaw-slot ${drag.hoverId === `slot-${index}` ? "is-hover" : ""} ${piece ? "is-filled" : ""} ${tier.tabs ? "has-tabs" : ""}`}
              >
                {piece ? (
                  <span
                    className={`jigsaw-placed block h-full w-full ${tier.tabs ? "has-tabs" : ""}`}
                    style={cellBackground(animal.image, piece.slot, tier)}
                    aria-hidden
                  />
                ) : null}
              </DragTarget>
            );
          })}
        </div>
        {done && (
          <img
            src={animal.image}
            alt={L(`A completed ${animal.en}`, `Un ${animal.es} completo`)}
            width={816}
            height={816}
            className="jigsaw-complete absolute inset-0 h-full w-full"
            draggable={false}
          />
        )}
      </div>

      <div className="jigsaw-tray mt-4 flex flex-wrap items-center justify-center gap-3 px-3 pb-5">
        {pieces.map((piece, index) => {
          const active = drag.activeHandleId === piece.id;
          const isPlaced = placedIds.has(piece.id);
          const refused = refusedPieceId === piece.id;
          const selected = selectedId === piece.id;
          if (isPlaced) return <span key={piece.id} className={`${pieceSize} jigsaw-piece-spacer`} aria-hidden />;
          return (
            <button
              key={piece.id}
              type="button"
              {...drag.getHandleProps(piece.id)}
              onClick={() => tapPiece(piece.id)}
              disabled={disabled}
              aria-label={
                selected
                  ? L(`Piece ${index + 1}, selected. Tap a spot in the picture.`, `Pieza ${index + 1}, elegida. Toca un lugar en la imagen.`)
                  : L(`Piece ${index + 1} of ${total}`, `Pieza ${index + 1} de ${total}`)
              }
              aria-pressed={selected}
              data-jigsaw-piece={piece.id}
              className={`jigsaw-piece ${pieceSize} relative z-10 cursor-grab rounded-xl ${
                active ? "is-dragging" : ""
              } ${refused ? "is-refused" : ""} ${selected ? "is-selected" : ""} ${tier.tabs ? "has-tabs" : ""}`}
              style={{
                ...cellBackground(animal.image, piece.slot, tier),
                ...(active ? { transform: `translate(${drag.offset.x}px, ${drag.offset.y}px)` } : {}),
                animationDelay: `${index * 140}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
