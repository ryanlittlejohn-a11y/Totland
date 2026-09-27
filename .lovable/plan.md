# Rebalance free vs Premium games (40 free / 64 Premium)

Heads-up: this changes what Premium unlocks, so it falls under the "subscriptions" area you asked me to flag. Nothing is changed until you approve this list.

## Where things stand now
104 games: 87 free, 17 Premium. Two of the six showcase games are **currently Premium**: Word Rocket (#30) and Animal Jigsaw (#82). The plan makes them free, as you asked.

## Result: exactly 40 free / 64 Premium
49 games move from free to Premium. 2 move from Premium to free (Word Rocket, Animal Jigsaw). I used your exact target because it gives every area a sensible number of free games.

| Area | Now free / total | Proposed free | Free games kept |
|---|---|---|---|
| ABC & Letters | 17 / 17 | 6 | Letter Pop, Alphabet Safari, Feed the Letter Monster, Letter Fishing, Letter Rain, Alphabet Train |
| Beginning Sounds | 4 / 5 | 2 | What Starts With B?, Sound Match |
| First Words | 5 / 10 | 4 | Picture Word Match, First Word Builder, **Word Rocket**, Daily Adventure |
| Numbers | 18 / 18 | 6 | Count the Animals, Number Pop, Number Train, Number Match, Number Maze, Number Hunt |
| Colors | 4 / 4 | 4 | Color Pop, Color Match, Rainbow Sort, Color Detective |
| Shapes | 8 / 8 | 4 | Shape Pop, Shape Match, Shape Sort, Shape Shadow |
| Matching & Memory | 9 / 11 | 3 | Uppercase Match, Color Memory, Animal Memory |
| Puzzles | 15 / 18 | 5 | Simple Jigsaw, **Animal Jigsaw**, What's Different?, Big or Small, Hidden Objects |
| Word Search | 2 / 5 | 2 | Letters, Colors (unchanged, follows Word Finds) |
| Tracing | 4 / 6 | 3 | Letter Tracing, Number Tracing, Word Tracing: 2 Letters |
| Storybooks | 1 / 2 | 1 | Read With Me |
| **Total** | **87 / 104** | **40** | |

## Games that move from free to Premium (49)
- **Letters (11):** Letter Bubbles, Letter Rocket, Letter Garden, Missing Letter, Alphabet Bridge, Upper to Lowercase, Lower to Uppercase, Letter Shadow, Letter Maze, Letter Detective, Alphabet Race
- **Beginning Sounds (2):** Beginning Sound Train, Sound Detective
- **First Words (2):** Word Builder, Missing Letter Word
- **Numbers (12):** Number Bubbles, Number Fishing, Count the Stars, Number Monster, Number Garden, Number Rocket, Missing Number, More or Less, Bigger Number, Counting Train, Count the Fruit, Number Rain
- **Shapes (4):** Shape Builder, Shape Hunt, Shape Train, What's Missing?
- **Memory (6):** Letter Memory, Number Memory, Shape Memory, Letter Memory Park, Number Memory Park, Picture Memory
- **Puzzles (11):** Letter Puzzle, Number Puzzle, Shape Puzzle, Which Comes Next?, Sort the Toys, Long or Short, Alphabet Jigsaw, Number Jigsaw, Picture Path, Match the Shadows, Pattern Builder
- **Tracing (1):** Word Tracing: 3 Letters

## Why these choices
- **Every area keeps 1 to 6 free games.** The biggest areas (Letters, Numbers) keep 6 each because they're what parents look for first. Small areas keep most of their games, so a free user never finds an area with only one option.
- **Easiest games stay free.** Most games kept free are playable in Explorer mode (ages 2–3), so a first-time child can play right away. The ones moving to Premium are mostly Learner/Reader games (sequences, comparing, missing items, spelling) plus near-duplicates (Bubbles/Rocket/Fishing variants of Pop; several extra memory boards).
- **One game of each type stays free.** Pick-one, drag, ordering, hunt, memory, tracing, maze and story games all stay free, so a free user tries every kind of play.
- **Colors stays fully free:** it's only 4 games, all toddler-level.

## Keep free — a bad idea to lock
- Everything in the App Store screenshots: Letter Fishing, Letter Pop, Letter Tracing, Alphabet Safari, Word Finds #1–30. Locking them would make the screenshots show locked content as free.
- The six showcase games.
- Daily Adventure and Read With Me: these are the "first session" experiences.
- Alphabet Train: the simplest ordering game, and it was just fixed.

## Word Finds and Flash Cards
- **Word Finds: I recommend no change.** 30 free / 70 Premium is already 30/70, stricter than 40/60.
- **Flash Cards: I recommend no change.** All 93 cards are already Premium-only. The free games already use the same picture words, so free users still see that content.

## Side effects you should know about
- **Children playing now will lose 49 games** they could play before. Their stars and progress stay, but those games will show the Premium lock.
- **Your App Review note and listing need new numbers**: "40 free + 64 Premium" instead of "87 + 17". The build now under review describes the old split. I'll update APP-STORE-LISTING-UPDATE.txt and the Premium benefits list will update itself.
- The Premium benefits screen and parent numbers update automatically from the catalog.

## Technical details
- Only change: the premium flag on the affected rows in `src/lib/catalog.ts` (add `1` to 49 rows, remove it from #30 and #82). No change to Word Search mapping, Word Finds, Flash Cards, the purchase flow, or the parental gate.
- While building, check that Home, the Worlds pages, Quick Play and Daily Adventure only pick unlocked games for free users, and still pick something in every area.
- Verify: counts read 104 / 40 / 64, `premiumBenefits()` output, and that a free profile can open each kept game but sees the lock on a sample of moved ones. Also confirm a Premium profile still opens everything, and the build is clean.
- Update roadmap.md and the reviewer-note file with the new numbers.
