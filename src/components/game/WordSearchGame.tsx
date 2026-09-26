import { WordFindGame } from "./WordFindGame";
import { themeById, WORD_FIND_THEMES } from "@/lib/wordfinds";
import { wordSearchThemeFor } from "@/lib/wordsearch-map";

/** Catalog word-search games now use the same swipe-to-find engine. */
export function WordSearchGame({
  kind = "animals",
  onFinish,
}: {
  kind?: string;
  skill?: string;
  onFinish: (stars: number, accuracy: number) => void;
}) {
  const theme = themeById(wordSearchThemeFor(kind)) ?? WORD_FIND_THEMES[0]!;
  return <WordFindGame theme={theme} onFinish={onFinish} />;
}
