# Pre-resubmission audit: activity logging and displayed numbers

Investigation only. Nothing has been changed. Each fix below is a proposal for you to approve or reject.

## Verdict in one paragraph

Play counts, stars, "games explored", "Browse all X games", the traced-letters grid and the Word Finds counter all come from live data and are correct. There are three real problems: (1) the per-area "activities" numbers, including every Premium benefit count on the subscription page, are typed-in numbers that don't match anything in the app; (2) the free/Premium split doesn't line up between Home, the catalog games and Word Finds; (3) six game types always save 100% accuracy, which makes the parent's accuracy and mastery numbers look better than they are.

## Part A: Activity logging

**A1. Every engine saves progress the same way.** All 16 engines hand their result back to the game page, and that page does the saving (play count, stars, best accuracy, last played, recent list, badges). Each engine also records its own game completion (stars, daily minutes, favourites). None of them is missing either step. That includes the six bespoke games, Letter Tracing, Number Tracing and the four Word Tracing rows. The six bespoke games replaced existing catalog rows; they weren't added on top. So they keep the same game IDs and past play history.

What does differ is accuracy, which is shown as 100% no matter what:
- Letter Fishing, Feed the Letter Monster, Word Rocket, Animal Jigsaw, Number Maze and Letter Rain only save correct answers and always report 100% accuracy. Wrong taps and drops are never saved. This comes from the penalty-free design, but it means the parent's "overall accuracy" and per-area mastery for letters, words, numbers and puzzles only count right answers from these games.
- Flash Cards and Read With Me also report 100%. They have no right or wrong answers, so this is expected.
- ChoiceGame, OrderGame, MemoryGame, HuntGame, word search and tracing save both right and wrong answers and report real accuracy.

**A2. "X of Y games explored" on Home is correct.** The counts come live from the catalog, so all 104 games are included, bespoke and tracing ones too. Current totals per area: Letters 17, Numbers 18, Colors 4, Shapes 8, First Words 10, Beginning Sounds 5, Matching and Memory 11, Puzzles 18, Tracing 6, Word Search 5, Storybooks 2. Flash Cards has no catalog games, so it shows "Ready to play" as designed.

**A3. Parent dashboard**
- "Letters traced" grid: correct. It fills from Letter Tracing only, which is the only game that traces single letters. Number Tracing and Word Tracing rightly don't count here. Word Tracing progress is kept separately and not shown on this page, which is fine.
- Word Finds completed (X / 100): live and correct. One side effect: the five catalog "Word Search" games run a Word Finds puzzle behind the scenes, so finishing one also ticks that puzzle in the counter. You can argue this is correct, since the child did finish that puzzle, but I'm flagging it.
- Per-area mastery: live from saved answers, but shaped by the issues above. Flash Cards and Storybooks never save answers, so they will always read "not started" or empty however much they're used. The four areas that include bespoke games look better than they should (see A1).

## Part B: Displayed numbers

| Where | What it says | Live or typed in | Correct? |
|---|---|---|---|
| Home "Browse all X games" | 104 | Live | Yes (100 original + 4 Word Tracing rows) |
| Home area cards "X of Y games explored" | per area | Live | Yes |
| Area page "N games for … mode" | per area | Live | Yes |
| Home "927 activities offline" | 927 | Adds up the typed-in area numbers | No, see below |
| Parent page "927 activities are stored on this device" | 927 | Same | No |
| Home Word Finds card "100 puzzles — first 30 free" | 100 / 30 | Typed in | Right today (100 puzzles, 30 free), but won't update if puzzles are added |
| Word Finds page and puzzle lock "100", "first 30" | 100 / 30 | 100 typed in, 30 live | Right today |
| Terms "all 100 Word Find puzzles" | 100 | Typed in | Right today |
| First Words card "200+ picture words" | 200+ | Typed in | **Wrong**: the word list has 93 words |
| Subscription "New content every month" | — | Claim | Not backed by anything in the app; worth checking before review |

**Per-area "activities" numbers.** These are typed into the content file and don't match anything that exists:

| Area | Shown | Catalog games | Other real content |
|---|---|---|---|
| Letters | 104 | 17 | 26 letters |
| Numbers | 100 | 18 | numbers 1 to 20 |
| Colors | 48 | 4 | — |
| Shapes | 40 | 8 | — |
| First Words (Premium) | 120 | 10 | 93 picture words |
| Beginning Sounds (Premium) | 78 | 5 | — |
| Matching and Memory | 60 | 11 | — |
| Puzzles (Premium) | 100 | 18 | — |
| Letter Tracing | 52 | 6 | 52 letter shapes (26 upper and 26 lower). Only this one has a clear basis |
| Flash Cards (Premium) | 100 | 0 | 93 words |
| Word Search (Premium) | 100 | 5 | 100 Word Finds puzzles, but those are a separate section, and 30 of them are free |
| Storybooks (Premium) | 25 | 2 | **5 stories** |

You could defend some of these as "generated rounds" (the games make endless random rounds). But Storybooks at 25 against 5 real stories, and "200+ picture words" against 93, can't be defended.

## Part C: Premium numbers and free/Premium consistency

**C1. Premium benefit counts on the subscription page** (from the list above): First Words 120, Beginning Sounds 78, Puzzles 100, Flash Cards 100, Word Search 100, Storybooks 25. None of them is computed, and none matches the real number of items. The website subscription page and the in-app purchase screen both use this list.

**C2. Free/Premium split doesn't match across screens:**
- Home locks whole areas by area (First Words, Beginning Sounds, Puzzles, Flash Cards, Word Search, Storybooks are "Premium world"). But inside those areas, most catalog games are free and playable through the Worlds pages: First Words 5 of 10 free, Beginning Sounds 4 of 5, Puzzles 15 of 18, Word Search 1 of 5, Storybooks 1 of 2. Two free areas also contain Premium games: Matching and Memory (2) and Tracing (2). The subscription page lists whole areas as Premium, so it promises more locked content than there really is.
- The catalog Word Search games and Word Finds disagree. "Word Search: Animals" (Premium) plays "Farm Animals" (free puzzle #1). "Colors" (Premium) plays free #6. "Food" (Premium) plays free #8. The other way round, "Word Search: Letters" (free) plays "Letters A–E", which is Premium puzzle #51. So a free user can play a Premium puzzle through the catalog. Only the lock decides what's playable, and the catalog lock doesn't know about Word Finds.
- Overall: 18 of 104 catalog games are Premium, and 70 of 100 Word Finds are Premium. No percentage appears anywhere, so nothing contradicts that directly.

## Proposed fixes (need your approval; none touch payments, sign-in or the parental gate)

1. **Replace the typed-in activity numbers with live counts.** Show "N games" per area from the catalog on the subscription list, and base the "activities offline" and "stored on this device" totals on real content: 104 games + 100 Word Finds + 5 stories + 93 flash cards. Or simply "104 games and 100 word finds". Your choice of wording.
2. **Fix "200+ picture words"** to a live count (currently 93).
3. **Make the Premium list on the subscription page honest.** List what Premium actually unlocks: the 18 Premium games, 70 extra Word Finds and offline play. This changes marketing copy only, not pricing or purchase logic. Also decide whether to keep "New content every month".
4. **Line up the free/Premium split.** Either (a) stop locking whole areas on Home and lock individual games, as the catalog already does, or (b) mark every game in a Premium area as Premium. Option (a) keeps what free users can play today. Option (b) takes free games away from them. I recommend (a). Also make the catalog Word Search games follow their puzzle's lock, or point them at matching puzzles.
5. **Accuracy (optional; your call, because it touches the penalty-free design).** Save wrong taps in the six bespoke games for the parent's stats only, with no effect on stars, level or what the child sees. Or leave them out, and I'll add a note on the parent page that some games only count successes.
6. **Flash Cards and Storybooks mastery:** show "Ready to play" or the number of sessions instead of an empty mastery bar.

## Technical notes

- Typed-in numbers live in the area list in the content file (`activities`, `LIBRARY_SIZE`) and in literal strings on the Home Word Finds card, the Word Finds pages and Terms.
- Home locks areas with `a.free`; the game page locks with `game.premium`; Word Finds locks with `themeIndex >= FREE_WORD_FINDS`. These are three separate rules.
- Catalog Word Search games map to puzzles by name in the word search component (farm-animals, rainbow-colors, number-words, snack-time, letters-a-e).
- Bespoke engines call `recordAnswer` only on success and `onFinish(total, 1)`.
- Verification after fixes: a Playwright check of Home, the parent page and the subscription list against a script that counts the real content. The in-app purchase screen can only be checked in code plus a TestFlight build.
