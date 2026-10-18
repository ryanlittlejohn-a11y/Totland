# Flat tap-a-card games: full sweep (Premium included) and fix plan

All 121 games checked from the game list itself, so locked Premium games count the same as free ones. **30 games** still use the plain tap-a-card screen. Everything else already has its own scene (pop, sort, fishing, monster, rain, trace, maze, memory, jigsaw, train and others).

## Biggest problem: exact duplicates

Several games are not just similar. They run the **same round with the same content** under different names:

| Same round | Games | Free/Premium |
|---|---|---|
| Find the identical shape | Shape Match (#62), Twin Shapes (#111) | both Free |
| Shape silhouette | Shape Shadow (#65), Match the Shadows (#93) | Free / Premium |
| Same colour | Color Match (#57), Paint Match (#107) | both Free |
| Count and pick the number | Count the Animals (#36), Count the Stars (#42), Count the Fruit (#53) | Free / Prem / Prem |

Big or Small (#79) and Long or Short (#80) are a near-pair too: "compare two things, tap one."

## Findings by area

**Shapes and colours (Ryan's screenshots).** Shape Match, Shape Shadow, Twin Shapes, Big or Small, Color Match and Paint Match all play as "look at cards, tap one." This area is the flattest. What's Missing? (#70) and Pattern Parade (#112) are fine as quick-check rounds.

**Numbers.** The three Count games are interchangeable. Number Match (#41), More or Less (#48) and Bigger Number (#49) are fine quick checks. Missing Number (#46) is fine.

**Puzzles.** What's Different? (#76) and Which Comes Next? (#77) are fine as quick logic checks. Big or Small and Long or Short are flat. Complete the Picture (#94) is fine.

**Letters, phonics, words.** Missing Letter, Upper→Lower, Lower→Upper, Letter Shadow, What Starts With B?, Sound Match, Picture Word Match, Missing Letter Word, Rhyming Pairs and Same Sound. Each one checks a different skill, and this area already has many bespoke scenes (fishing, monster, rain, pop, train, tracing, word finds). **Leave them all as they are.** They give the area a calm pace.

## Proposal: 9 games get a real interaction, 21 stay simple

1. **Shape Match → "Shape Sorter box" (drag).** Drag the shape into the matching hole in a toy sorter box. It drops in with a thunk; the wrong hole bounces it back. Uses the existing drag helper and place-pieces engine.
2. **Twin Shapes → flip-to-find-twins (memory engine).** A shape-pair memory deck, using the memory engine that was just fixed. It is no longer a copy of Shape Match.
3. **Shape Shadow → "Fit the shadow" (drag).** Drag a coloured shape onto its matching dark outline. It snaps in and fills with colour.
4. **Match the Shadows → object shadows.** Same drag scene, but with everyday objects (animals, toys) instead of geometric shapes, which is what the title says. This ends the duplicate.
5. **Color Match → "Paint the picture" (tap paint pot, then tap shape).** A picture outline (fish, balloon) shows one tinted area. The child picks the matching paint pot and the colour pours in.
6. **Paint Match → colour-mixing-free "dip the brush" drag.** Drag the brush to the pot that matches the swatch; the brush stroke paints across the canvas. Different motion from Color Match.
7. **Count the Animals → "Tap to count" (tap-many).** Tap each animal, which hops and shows its number (1, 2, 3...), then pick the total. Real counting, one by one.
8. **Count the Stars / Count the Fruit → "Fill the basket / jar" (count-build engine).** The basket shows a number; drag or tap that many fruit or stars in. Reuses the Number Garden and Counting Train engine. Stars and Fruit get different containers so they don't match each other.
9. **Big or Small + Long or Short → "Seesaw / measuring stick" (drag).** Big or Small: drop the named item (big/small) into the right-sized box. Long or Short: drag a ribbon or snake next to the ruler and pick. They stay two games with two different motions.

**Staying simple (21):** all 10 letter, phonics and word games above, plus Number Match, Missing Number, More or Less, Bigger Number, What's Missing?, Pattern Parade, What's Different?, Which Comes Next?, Complete the Picture, Letter Shadow, Missing Letter Word. Each is a distinct skill check, not a reskin.

## What I would build first (small and safe)

- **#2 Twin Shapes → memory deck.** Only the game list and a shape-card set change; the engine is already tested.
- **#8 Count the Stars / Fruit → count-build.** The engine already exists and only needs a container option.
- **#1 and #3/#4 shape drag scenes.** These reuse the place-pieces engine (from Sort/Assemble) with new visuals.

**Bigger (new visuals):** #5 Paint the picture, #6 dip the brush, #7 tap-to-count, #9 size/length scenes.

## Guardrails (unchanged)

Game names, numbers, emojis, free/Premium flags (46/75), parental gate, pricing, subscriptions and the Spanish word banks all stay the same. Spanish uses the existing colour and shape names. After building, I'll run a narration catalog (English and Spanish, check only, no audio generated) with missing-line counts and credit cost. Nothing gets recorded until you approve and the balance is checked.

## Technical details

- Catalog rows #36, 42, 53, 57, 62, 65, 79, 80, 93, 107, 111 are re-pointed: `memory` (kind `shapes`), `garden`/count-build with a `container` option, and new `place` sets in `scenes.ts` (`shapeSorter`, `shadowFit`, `objectShadow`, `sizeBox`, `lengthRuler`, `brushPot`). Two small new scenes: `PaintPictureGame` (tap-pot-then-region) and a tap-to-count mode in `HuntGame`.
- Every scene follows the project rules: `useDragToTarget` plus `DragTarget` tap fallback, frozen rounds, a ref-guarded finish, and CSS-only motion with a reduced-motion path.
- Tests are added to `misnamed-games.test.ts`: no two games share the same engine and content; each re-pointed game opens its new scene; the free/Premium count stays 46/75; the total stays 121; pure generators are checked for correct answers.
- Browser check of each rebuilt game in English and Spanish before reporting.
