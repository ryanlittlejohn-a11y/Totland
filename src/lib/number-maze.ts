import type { TracePoint } from "@/hooks/usePathTrace";

export type MazeTier = { points: number; rounds: number };

/** Numbers skill level (1-5) -> points per maze and mazes per session. */
export function mazeTier(level: number): MazeTier {
  if (level <= 1) return { points: 3, rounds: 4 };
  if (level === 2) return { points: 5, rounds: 3 };
  if (level === 3) return { points: 7, rounds: 3 };
  if (level === 4) return { points: 8, rounds: 2 };
  return { points: 10, rounds: 2 };
}

/** Hand-designed layouts (0-100 board units), spacing >= 24 units. */
const LAYOUTS: Record<number, TracePoint[][]> = {
  3: [
    [{ x: 18, y: 72 }, { x: 50, y: 30 }, { x: 82, y: 72 }],
    [{ x: 20, y: 25 }, { x: 55, y: 50 }, { x: 80, y: 80 }],
    [{ x: 15, y: 50 }, { x: 50, y: 78 }, { x: 85, y: 40 }],
  ],
  5: [
    [{ x: 15, y: 20 }, { x: 50, y: 18 }, { x: 82, y: 40 }, { x: 50, y: 62 }, { x: 20, y: 84 }],
    [{ x: 15, y: 80 }, { x: 25, y: 45 }, { x: 50, y: 18 }, { x: 75, y: 45 }, { x: 85, y: 80 }],
    [{ x: 18, y: 18 }, { x: 18, y: 55 }, { x: 50, y: 82 }, { x: 82, y: 55 }, { x: 82, y: 18 }],
  ],
  7: [
    [{ x: 15, y: 16 }, { x: 50, y: 16 }, { x: 85, y: 22 }, { x: 62, y: 48 }, { x: 30, y: 52 }, { x: 22, y: 82 }, { x: 60, y: 84 }],
    [{ x: 15, y: 84 }, { x: 15, y: 52 }, { x: 22, y: 18 }, { x: 50, y: 40 }, { x: 78, y: 18 }, { x: 85, y: 52 }, { x: 85, y: 84 }],
    [{ x: 50, y: 50 }, { x: 74, y: 40 }, { x: 70, y: 76 }, { x: 38, y: 82 }, { x: 18, y: 55 }, { x: 28, y: 22 }, { x: 64, y: 14 }],
  ],
  8: [
    [{ x: 14, y: 28 }, { x: 38, y: 28 }, { x: 62, y: 28 }, { x: 86, y: 28 }, { x: 86, y: 72 }, { x: 62, y: 72 }, { x: 38, y: 72 }, { x: 14, y: 72 }],
    [{ x: 14, y: 16 }, { x: 14, y: 50 }, { x: 14, y: 84 }, { x: 40, y: 70 }, { x: 60, y: 30 }, { x: 86, y: 16 }, { x: 86, y: 50 }, { x: 86, y: 84 }],
    [{ x: 14, y: 84 }, { x: 34, y: 58 }, { x: 14, y: 32 }, { x: 40, y: 12 }, { x: 62, y: 36 }, { x: 86, y: 14 }, { x: 86, y: 50 }, { x: 64, y: 82 }],
  ],
  10: [
    [{ x: 14, y: 16 }, { x: 38, y: 16 }, { x: 62, y: 16 }, { x: 86, y: 16 }, { x: 86, y: 50 }, { x: 62, y: 50 }, { x: 38, y: 50 }, { x: 14, y: 50 }, { x: 14, y: 84 }, { x: 38, y: 84 }],
    [{ x: 14, y: 84 }, { x: 14, y: 50 }, { x: 14, y: 16 }, { x: 40, y: 16 }, { x: 40, y: 50 }, { x: 40, y: 84 }, { x: 64, y: 84 }, { x: 64, y: 50 }, { x: 86, y: 30 }, { x: 86, y: 70 }],
    [{ x: 50, y: 52 }, { x: 74, y: 44 }, { x: 72, y: 74 }, { x: 46, y: 84 }, { x: 22, y: 70 }, { x: 16, y: 42 }, { x: 30, y: 16 }, { x: 58, y: 14 }, { x: 86, y: 18 }, { x: 88, y: 84 }],
  ],
};

export type MazeReveal = { emoji: string; en: string; es: string };
export const MAZE_REVEALS: MazeReveal[] = [
  { emoji: "⭐", en: "a star", es: "una estrella" },
  { emoji: "🐟", en: "a fish", es: "un pez" },
  { emoji: "❤️", en: "a heart", es: "un corazón" },
  { emoji: "🏠", en: "a house", es: "una casa" },
  { emoji: "🌈", en: "a rainbow", es: "un arcoíris" },
  { emoji: "🦋", en: "a butterfly", es: "una mariposa" },
];

export function makeMaze(count: number): TracePoint[] {
  const options = LAYOUTS[count] ?? LAYOUTS[3];
  const base = options[Math.floor(Math.random() * options.length)];
  const fx = Math.random() < 0.5;
  const fy = Math.random() < 0.5;
  return base.map((p) => ({ x: fx ? 100 - p.x : p.x, y: fy ? 100 - p.y : p.y }));
}
