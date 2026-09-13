# Word Finds: a 100-puzzle section with swipe-to-find

A new Word Finds section with 100 original themed puzzles, all written fresh for Totland (nothing copied from the magazine photos). Children drag a finger across the letters to find a word, hear a friendly sound for right and wrong tries, and get a spoken "Great job!" or "Keep trying".

## What the child sees

- A **Word Finds** page listing 100 themed puzzles (Farm Animals, Rainbow Colors, Bedtime, Snack Time, Jungle, Space, Weather, Things That Go, and so on), each with an emoji, a puzzle number, and a tick once completed.
- Opening one shows a letter grid and the word list underneath, with a picture beside each word for pre-readers.
- **Swipe to find:** press on the first letter, drag across the word, lift. The trail highlights as the finger moves. A correct word locks in with a colored highlight and crosses off the list; a wrong swipe fades away.
- Correct: happy chime plus spoken praise. Wrong: soft "try again" sound plus a spoken "Keep trying" (English and Spanish, same voice system as the rest of the app).
- Finishing all words plays the reward screen with stars, exactly like other games.

## Difficulty that grows with the child

Same three age modes already in the app, using the child's word-search level:

| Level | Grid | Words | Directions |
| --- | --- | --- | --- |
| Explorer | 6x6 | 3 short words | across, down |
| Learner | 8x8 | 5 words | across, down |
| Reader | 10x10 | 7-8 words | across, down |

Words always run left-to-right or top-to-bottom (no diagonals, no backwards), so small fingers can succeed. Any theme word too long for the grid is skipped at that level.

## Technical notes

- **Content:** `src/lib/wordfinds.ts` — 100 `WordFindTheme` records `{ id, title, emoji, words: {word, emoji}[] }`, each with 8-12 candidate words (3-8 letters, drawn from and extending the existing `WORDS`/`CATEGORIES` vocabulary). Spanish titles go through the existing `i18n` title helper.
- **Generator:** a seeded placer that lays words across/down without conflicting overlaps, fills the rest from `LETTERS`, and retries a bounded number of times before dropping a word. Seeded by theme id + play count so a replay reshuffles.
- **Component:** rewrite `src/components/game/WordSearchGame.tsx` as a swipe grid using pointer events on a single grid container with `touch-action: none`; track start cell and current cell via `elementFromPoint`/cell index, constrain the path to one straight row or column, and match the traced letters against remaining words (forward only). Keeps the existing `useProfile` / `recordAnswer` / `recordGameComplete` / `chime` / `say` wiring and the `onFinish(stars, accuracy)` contract, so `/play/wordsearch` and the catalog games keep working.
- **Sounds:** reuse `chime("correct" | "retry" | "reward")` from `src/lib/speech.ts` — already generic, no new audio files.
- **Routes:** new `src/routes/wordfinds.tsx` (themed index, own `head()` metadata) and `src/routes/wordfind.$themeId.tsx` (single puzzle in `PlayFrame`). Linked from the home screen and the Word Search area card. Existing catalog word-search games keep pointing at the same engine with a theme picked from their `kind`.
- **Progress:** completed theme ids stored on the local profile (`wordFinds: string[]`) alongside existing progress, so ticks survive restarts and sync with the active child.
- **Premium:** Word Search is already a premium area; the first 5 puzzles stay free as a taster, the rest use the existing lock treatment.
- **Verification:** `bunx tsgo --noEmit`, `bun run build`, plus a Playwright pass that opens a puzzle, drags across a known word with mouse-down/move/up, and asserts the word crosses off with no console errors.
