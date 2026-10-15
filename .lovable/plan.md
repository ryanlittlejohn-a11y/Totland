# Game Inventory and Next-Candidates (read-only findings)

No changes proposed yet. This is the inventory to choose from. Approving this plan only adds one measured step: a line-by-line narration coverage count (no audio generated, no credits spent).

## 1. How the 121 games are built (from the catalog)

| Type | Games | Notes |
|---|---|---|
| Bespoke interaction | **15** | Fishing 4, Monster 4, Rain 4, Word Rocket 1, Animal Jigsaw 1, Number Maze 1 |
| Generic engines (theme skin only) | **79** | Choice 59, Order 11, Hunt 9 |
| Dedicated but older mechanics | **27** | Memory 13, Tracing 6, Word Search 5, Read With Me, Story Builder, Daily Adventure |

So about two thirds of the catalog (79 of 121) is still the tap-the-right-card, tap-in-order, or tap-all-of-them engine with a different skin.

## 2. Weakest generic games — ranked next candidates

Picked the way the first six were: the name promises an action the game doesn't deliver, or several games are the same round with a new title.

1. **Names that promise a bespoke game but aren't one** (cheapest win — reuse an existing scene):
   - Number Rain (#55) runs the *Order* engine — nothing falls. Should use the Rain scene.
   - Letter Rocket (#7), Number Rocket (#45) are plain Choice — could use the Rocket scene.
   - Word Fishing (#29), Number Fishing (#39) are Choice — Fishing pond exists. (Note: "Catch the Number" #115 already does Number Fishing properly, so #39 is a near-duplicate.)
   - Number Monster (#43) is Choice — Monster scene exists.
   - Letter Maze (#15) is Hunt — Number Maze path engine exists.
   - Alphabet Jigsaw (#83), Number Jigsaw (#84), Simple Jigsaw (#81) are Choice — Animal Jigsaw drag engine exists.
   - Shape Train (#69) is Choice on a pattern round, not a train.
2. **Counting cluster** — Count the Animals, Count the Stars, Counting Train, Count the Fruit, Number Monster: five games, same "how many?" card round. Best fit for a new bespoke "tap each one to count it out loud" interaction.
3. **Find-the-letter / find-the-number clones** — Letter Pop, Letter Bubbles, Letter Rocket (all same round); Number Pop, Number Bubbles, Number Fishing, Number Rocket (all same round). A real "pop the bubble" interaction would give Pop/Bubbles their own identity.
4. **Order engine trains/bridges/races** — Alphabet Train, Letter Garden, Alphabet Bridge, Alphabet Race, Number Train, Picture Path: six identical tap-in-order rows. One drag-cars-onto-the-track interaction would cover the trains.
5. **Big or Small / Long or Short / More or Less** — comparison concepts that suit a drag-to-sort or scale, currently two-card taps.

My recommendation for the next batch: group 1 first (11 games, mostly re-pointing to scenes already built and tested), then a new counting interaction (group 2).

## 3. Known rough edges not yet circled back to

- Order engine wrong-tap message is English-only and unnatural: "Try the one that comes after the start." Not translated for Spanish.
- Number Rain using the Order engine (above) — looks like a catalog mistake rather than a design choice.
- Near-duplicate titles confusing for parents: Color Twins vs Color Memory, Shape Twins vs Twin Shapes vs Shape Match, Number Fishing vs Catch the Number.
- Never confirmed on a real device: drag/tracing feel, pinch-zoom blocking, tall-screen scrolling (17–128px overflow on iPhone), Premium storybook unlock with a real Premium account.
- Pending builds: voice reply fix and narration timeout need publish + new Codemagic build and an on-device diagnostics-log check.

## 4. Narration coverage gaps (what's known)

- **Recorded:** English Tier 1 (prompts) and Tier 2 (prompts, Word Finds); Spanish Tier 1, Tier 3 (clean lines) and Tier 2.
- **On hold, falls back to device voice:**
  - English Tier 3 — reveals and hints (e.g. "C is for cat!", "Point and count…").
  - Spanish phonics, spelling, missing-letter and Word Finds lines (~1,190) — waiting on a Spanish word bank.
  - Spanish library refresh in Lucy's voice (~3,100 credits) — waiting on credit approval.
- **Unmeasured:** lines for the 17 games and 5 storybooks added by the other contributor were never checked against the voice library. The new Fishing/Monster/Rain color and shape prompts are generated text, so many are likely unrecorded.

## If approved: the one measurement step

- Generate every spoken line the 121 games and 10 storybooks can produce (English and Spanish), check each against the shared voice library without generating anything, and report recorded vs missing per game and per area, with a credit estimate to fill the gaps.
- No code, catalog, audio, or credit changes.

## Technical details

- Counts from `engine` field of the 121 rows in `src/lib/catalog.ts`.
- Coverage check: enumerate lines via the round generators in `src/lib/rounds.ts` / `games.ts` / `i18n.ts` plus story text, hash as the speech layer does, and read-only lookup with `allowGenerate:false`.
