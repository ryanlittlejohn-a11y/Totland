import type { Tile, Visual } from "@/lib/scenes";

/** Draws a letter/number, picture, colour swatch or shape at a given size. */
export function VisualView({
  v,
  size = 56,
  faint = false,
}: {
  v: Visual;
  size?: number;
  faint?: boolean;
}) {
  const op = faint ? 0.22 : 1;
  if (v.swatch)
    return (
      <span
        className="block rounded-full"
        style={{ width: size, height: size, background: v.swatch, opacity: op }}
      />
    );
  if (v.clip)
    return (
      <span
        className="block bg-clay"
        style={{ width: size, height: size, clipPath: v.clip, opacity: op }}
      />
    );
  if (v.emoji)
    return <span style={{ fontSize: size * 0.85, lineHeight: 1, opacity: op }}>{v.emoji}</span>;
  return (
    <span
      className="font-ui font-bold text-ink"
      style={{ fontSize: size * 0.9, lineHeight: 1, opacity: op }}
    >
      {v.label}
    </span>
  );
}

/** One window of a picture cut into cols × rows tiles. */
export function TileView({ tile, cell }: { tile: Tile; cell: number }) {
  const w = cell * tile.cols;
  const h = cell * tile.rows;
  const size = Math.min(w, h) * 0.95;
  return (
    <span
      className="relative block overflow-hidden"
      style={{ width: cell, height: cell }}
      aria-hidden
    >
      <span
        className="absolute grid place-items-center"
        style={{ width: w, height: h, left: -tile.col * cell, top: -tile.row * cell }}
      >
        <VisualView v={tile.whole} size={size} />
      </span>
    </span>
  );
}
