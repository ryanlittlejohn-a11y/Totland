import elephant from "@/assets/jigsaw/elephant.jpg";
import fox from "@/assets/jigsaw/fox.jpg";
import koala from "@/assets/jigsaw/koala.jpg";
import lion from "@/assets/jigsaw/lion.jpg";
import owl from "@/assets/jigsaw/owl.jpg";
import turtle from "@/assets/jigsaw/turtle.jpg";

export interface JigsawAnimal {
  id: string;
  emoji: string;
  en: string;
  es: string;
  image: string;
}

/** Bundled illustrations, reused at every difficulty tier — only the cut changes. */
export const JIGSAW_ANIMALS: JigsawAnimal[] = [
  { id: "lion", emoji: "🦁", en: "lion", es: "león", image: lion },
  { id: "elephant", emoji: "🐘", en: "elephant", es: "elefante", image: elephant },
  { id: "koala", emoji: "🐨", en: "koala", es: "koala", image: koala },
  { id: "turtle", emoji: "🐢", en: "turtle", es: "tortuga", image: turtle },
  { id: "fox", emoji: "🦊", en: "fox", es: "zorro", image: fox },
  { id: "owl", emoji: "🦉", en: "owl", es: "búho", image: owl },
];

export interface JigsawTier {
  cols: number;
  rows: number;
  /** rounded interlocking tabs only where pieces are big enough to grab */
  tabs: boolean;
  /** animals per session at this tier */
  rounds: number;
}

/** Piece count follows the shared 1–5 skill level. */
export function jigsawTier(level: number): JigsawTier {
  if (level <= 2) return { cols: 2, rows: 1, tabs: false, rounds: 4 };
  if (level === 3) return { cols: 2, rows: 2, tabs: false, rounds: 3 };
  if (level === 4) return { cols: 3, rows: 2, tabs: true, rounds: 3 };
  return { cols: 3, rows: 3, tabs: false, rounds: 2 };
}
