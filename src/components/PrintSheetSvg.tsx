import type { Op } from "@/lib/printables";

/** Draws printable ops as SVG (thumbnails and page preview) — same data as the PDF. */
export function PrintSheetSvg({ ops, w, h, className, label }: { ops: Op[]; w: number; h: number; className?: string; label: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label={label}>
      <rect x={0} y={0} width={w} height={h} className="fill-cream" />
      {ops.map((op, i) => {
        if (op.t === "path")
          return (
            <polyline
              key={i}
              points={op.pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth={op.width}
              strokeDasharray={op.dash?.join(" ")}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        if (op.t === "dot")
          return <circle key={i} cx={op.x} cy={op.y} r={op.r} fill={op.fill ? "currentColor" : "none"} stroke={op.fill ? "none" : "currentColor"} strokeWidth={op.width ?? 2} />;
        if (op.t === "rrect")
          return <rect key={i} x={op.x} y={op.y} width={op.w} height={op.h} rx={op.r} fill="none" stroke="currentColor" strokeWidth={op.width} />;
        return (
          <text key={i} x={op.x} y={op.y} fontSize={op.size} fontWeight={op.bold ? 700 : 400} textAnchor={op.align === "center" ? "middle" : op.align === "right" ? "end" : "start"} fill="currentColor" fontFamily="Helvetica, Arial, sans-serif">
            {op.text}
          </text>
        );
      })}
    </svg>
  );
}
