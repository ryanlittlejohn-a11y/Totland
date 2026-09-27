# Fix: Alphabet Train (and every ordering game) crashes mid-round

## What's actually happening (reproduced)
Reproduced in a test browser by playing Alphabet Train correctly. Real error:

```text
TypeError: Cannot read properties of undefined (reading 'label')
  at OrderGame.tsx (the "placed tiles" row: set.seq.find(...)!.label)
```

Root cause:
- Each round's letters are picked at random and then re-picked whenever the child's skill level changes.
- Every tap records an answer. On 3 right answers in a row, the child levels up. On 2 wrong answers in a row, the child levels down.
- When the level changes, the game quietly picks a new random set of letters in the middle of the round. The letters already placed in the child's line aren't in the new set, so the screen crashes and the app shows the "This page didn't load" screen.
- Why it can happen on the very first tap: the streak is shared across the whole Letters skill. A child who just got 2 right in another letters game levels up on their first right tap here and crashes right away. That matches what you saw on TestFlight.

## Scope
Affects all 11 ordering games: Alphabet Train, Letter Garden, Alphabet Bridge, Alphabet Race, Word Builder, Word Puzzle, Word Train, First Word Builder, Number Train, Number Rain, Picture Path. Word Puzzle and Word Train are Premium. Number Maze uses its own engine and isn't affected.

## Is it new?
No. It's an old bug. The random pick has depended on the level since the ordering game was first written (Sep 4–5). The only recent change to this file (Sep 24) added the themed backdrop and a sound. It didn't touch how rounds are picked. The Pop and Hunt fixes changed other files. This is the same kind of bug we already fixed in Hunt.

The phone's crash reporter never logged it. It only catches errors that escape the app, and this one is caught by the error screen first. The only phone report in the last hour is an unrelated, harmless warning on Home.

## Fix (small, safe, game file only)
In `src/components/game/OrderGame.tsx`:
1. Pick the round only once, when the game becomes ready. Keep it fixed for the whole round, even if the level changes partway through. Same pattern as the Hunt fix. The new level applies from the next game.
2. Safety guard: if a placed tile can't be found, skip it instead of crashing.

What stays the same: scoring, stars, level-up rules, spoken lines, visuals, sign-in, payments, parental gate.

## Checks
- Re-run the automated check that crashed today. Play each of the 11 ordering games to the end in English and Spanish, including starting with a letters streak already at 2 so the level-up lands on the first tap. Expect no error screen and the reward screen at the end.
- Level-down case: two wrong taps after placing a tile, then finish the round.
- Build is clean.

After the fix, a new Codemagic build and TestFlight check are needed. If Apple's review is still pending, consider replacing the build under review.
