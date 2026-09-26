import { FREE_WORD_FINDS, themeIndex } from "./wordfinds";

/**
 * Which Word Finds puzzle each catalog "Word Search" game plays. The catalog
 * game's Premium lock is derived from this puzzle's tier, so the catalog and
 * the Word Finds section can never disagree about what is free.
 */
export const WORDSEARCH_KIND_THEME: Record<string, string> = {
  letters: "at-school", // free puzzle
  animals: "baby-animals", // premium puzzle
  colors: "rainbow-colors", // free puzzle
  numbers: "number-words", // premium puzzle
  food: "bakery", // premium puzzle
};

export const DEFAULT_WORDSEARCH_THEME = "farm-animals";

export function wordSearchThemeFor(kind: string): string {
  return WORDSEARCH_KIND_THEME[kind] ?? DEFAULT_WORDSEARCH_THEME;
}

export function wordSearchIsPremium(kind: string): boolean {
  return themeIndex(wordSearchThemeFor(kind)) >= FREE_WORD_FINDS;
}
