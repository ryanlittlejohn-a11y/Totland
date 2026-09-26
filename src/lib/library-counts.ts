/**
 * Live content counts for every number the app shows to parents. Everything
 * here is derived from the real catalog/content, so adding content updates
 * the copy automatically — never hardcode these numbers in UI text.
 */
import { GAMES } from "./catalog";
import { AREAS, STORIES, WORDS, type Area } from "./content";
import { FREE_WORD_FINDS, WORD_FIND_THEMES } from "./wordfinds";

export const GAME_COUNT = GAMES.length;
export const WORD_FIND_COUNT = WORD_FIND_THEMES.length;
export const FREE_WORD_FIND_COUNT = Math.min(FREE_WORD_FINDS, WORD_FIND_COUNT);
export const PREMIUM_WORD_FIND_COUNT = WORD_FIND_COUNT - FREE_WORD_FIND_COUNT;
export const STORY_COUNT = STORIES.length;
export const FLASH_CARD_COUNT = WORDS.length;
export const PREMIUM_GAME_COUNT = GAMES.filter((g) => g.premium).length;

export const gamesForArea = (area: Area["id"]) => GAMES.filter((g) => g.skill === area);

/** Areas with no catalog games (Flash Cards) are gated as a whole area. */
export const areaWholeLocked = (a: Area) => !a.free && gamesForArea(a.id).length === 0;

export interface Benefit {
  key: string;
  emoji: string;
  text: string;
}

/** What Premium honestly unlocks, computed live. */
export function premiumBenefits(): Benefit[] {
  const perArea: Benefit[] = AREAS.flatMap((a) => {
    const n = gamesForArea(a.id).filter((g) => g.premium).length;
    if (areaWholeLocked(a)) {
      const count = a.id === "flashcards" ? FLASH_CARD_COUNT : 0;
      return [{ key: a.id, emoji: a.emoji, text: `${a.title} — ${count} picture cards` }];
    }
    return n > 0 ? [{ key: a.id, emoji: a.emoji, text: `${a.title} — ${n} more ${n === 1 ? "game" : "games"}` }] : [];
  });
  return [
    ...perArea,
    {
      key: "wordfinds",
      emoji: "🔎",
      text: `Word Finds — ${PREMIUM_WORD_FIND_COUNT} more puzzles (all ${WORD_FIND_COUNT})`,
    },
  ];
}
