import { WordFindGame } from "./WordFindGame";
import { themeById, WORD_FIND_THEMES } from "@/lib/wordfinds";

const KIND_THEME: Record<string, string> = {
  animals: "farm-animals",
  colors: "rainbow-colors",
  numbers: "number-words",
  food: "snack-time",
  letters: "letters-a-e",
};

/** Catalog word-search games now use the same swipe-to-find engine. */
export function WordSearchGame({
  kind = "animals",
  onFinish,
}: {
  kind?: string;
  skill?: string;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const theme = themeById(KIND_THEME[kind] ?? "farm-animals") ?? WORD_FIND_THEMES[0]!;
  return <WordFindGame theme={theme} onFinish={onFinish} />;
}
