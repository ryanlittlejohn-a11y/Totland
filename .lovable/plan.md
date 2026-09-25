# Named game lists for every skill area

## Findings: every link into /play/$area

| Caller | Link | Needs a direct jump? |
|---|---|---|
| Home: top 8-icon grid | `/play/$area` | No, a list works fine |
| Home: "Learning worlds" list | `/play/$area`, or `/parent` when locked | No. The locked path stays the same |
| Parent dashboard: "Recommended next" → Open | `/play/$area` | No. A list filtered to that skill is better |
| Parent guide page (letters, phonics, tracing) | `/play/$area` | No. These are SEO landing links, and a list is better |
| Today's Adventure | Does not link to /play. It embeds its own game steps | Not affected |

Nothing needs /play/$area to launch a game immediately, so no caller has to be changed to use a direct `/game/$gameId` link.

Games per skill in the catalog: letters 17, numbers 18, puzzles 18, memory 11, words 10, shapes 8, tracing 6, phonics 5, wordsearch 5, colors 4, stories 2, **flashcards 0**.

## Approach

Turn `/play/$area` into a list of named games that matches `/world/$worldId`:
- Header: a back button (to Home), plus the area's emoji and title.
- Games are filtered by `g.skill === area` and by the child's age mode (same rule as the world page). A small "Show all ages" link shows the ones hidden by age.
- Cards are a 2-column grid. Each shows the game's emoji and name (a lock appears when it's Premium), plus play count, stars, or minutes. Tapping a card opens `/game/$gameId`, which already handles gating.
- The route URL, SEO titles, descriptions and canonical links stay the same, so no public URLs change.
- Flash Cards has no catalog games. Its page shows one card, "Flash Cards", that plays the existing flash-card activity. To support this, the current quick-play body moves to a `/play/$area/quick` child route (`play.$area.quick.tsx`), and `play.$area.tsx` becomes a layout with an index leaf. The empty-list fallback uses the same "quick play" card for any skill that has no games.
- Locked areas on the home list still go to `/parent` as they do today.

## Two category systems

WORLDS are themes and AREAS are skills. Every game has exactly one of each, so a game such as Letter Fishing appears once in its world and once in the "ABC & Phonics" area. That overlap is intentional, not a bug: they are two ways into the same game, and both lead to the same `/game/$gameId` page with shared stats. I don't propose merging them. The only label worth flagging is "Learning worlds" on the home screen, which lists skill areas, not worlds. I suggest renaming it to "Skills to practice" / "Habilidades" (text only).

## Out of scope

This does not touch game logic, scoring, premium gating, `catalog.ts`, Today's Adventure, or payments.

## Technical details

- Files: `src/routes/play.$area.tsx` (becomes a layout with `<Outlet/>` and keeps its head), new `src/routes/play.$area.index.tsx` (the list), new `src/routes/play.$area.quick.tsx` (the current PlayPage body, moved unchanged), and a one-line label change in `src/routes/index.tsx`.
- The list uses `GAMES`, `AREAS` and `useProfile`, with EN/ES text through `L`/`title`.
- Verification: build, then Playwright at phone size. Check that Home → ABC & Phonics shows Letter Fishing, that tapping it opens the fishing game, that Flash Cards quick play works, that the parent "Open" link shows the filtered list, and that locked areas still route to `/parent`.
