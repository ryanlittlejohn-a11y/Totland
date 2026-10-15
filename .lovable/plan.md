# Group 1 rebuild: 11 misnamed games — findings and proposal

Investigation only. Nothing has been changed.

## Key finding

Changing the engine setting alone isn't enough for any of the 11 except one. There are two reasons:

1. **The real scenes skip a game's picture clue.** Fishing, Rain and Monster only show the answer choices and speak the question. They never show the extra picture some games depend on: the objects to count, the word with a missing letter, or the shape pattern. If Number Monster, Word Fishing or Shape Train were moved over unchanged, they would have nothing to look at.
2. **Rocket, Maze and Jigsaw are fixed to one kind of content.** Rocket only spells words, Maze only does numbers 1–10, and Jigsaw only uses the 6 animal pictures. The letter and number versions need their own content.

## Per-game breakdown

| # | Game | Today | Real scene | What it needs | Effort |
|---|---|---|---|---|---|
| 55 | Number Rain | Tap-in-order engine | Rain | Rain only does "tap the number you hear." That would make it a copy of Falling Numbers (#121). It needs an "in order" mode in Rain: catch 1, then 2, then 3… | Medium |
| 7 | Letter Rocket | Tap-the-letter | Rocket | Rocket builds a sequence. Rocket can already put letters in alphabet order (the order game has this), so it needs a small change to let Rocket use that set | Small |
| 45 | Number Rocket | Tap-the-number | Rocket | Same as above, using the existing "numbers in order" set | Small |
| 29 | Word Fishing | Missing-letter word | Fishing | Fishing must show the word with the gap and its picture (e.g. 🐱 C_T) above the pond | Medium |
| 39 | Number Fishing | Tap-the-number | Fishing | Changing the engine setting alone would be enough, **but then it's a true copy of #115** (see below) | Small (but a copy) |
| 43 | Number Monster | Count the objects | Monster | Monster must show the objects to count (e.g. 🍎🍎🍎) and accept the matching number. Otherwise it's a copy of Hungry for Numbers (#118) | Medium |
| 15 | Letter Maze | Find-the-letters scene | Maze | Maze is numbers only. It needs a letter version (A→B→C…, English 26 / Spanish 27 with Ñ) plus letter rewards | Medium |
| 83 | Alphabet Jigsaw | Tap-the-letter | Jigsaw | Jigsaw is fixed to the animal pictures. It needs a letter picture set, e.g. big letter + matching picture (A 🍎). In Spanish it must use the Spanish word list | Large (new pictures) |
| 84 | Number Jigsaw | Tap-the-number | Jigsaw | Same, using a number picture set (e.g. "3" with three ducks) | Large (new pictures) |
| 81 | Simple Jigsaw | Tap the right picture | Jigsaw | **Two-piece mode already exists** (level 1–2). Option: keep the 6 animals and always cut 2–4 pieces, or give it its own set (vehicles/fruit) so it doesn't repeat Animal Jigsaw | Small (fixed easy cut) / Large (new set) |
| 69 | Shape Train | Pick the next shape in the pattern | Rocket/Order? | **There's no train scene.** Nearest real option: the Rocket sequence scene recolored as train cars, showing the pattern so far. In effect a new scene | Large |

## Number Fishing (#39) vs Catch the Number (#115)

Both use "findNumber", both are in Number Valley, both are Premium. On the same Fishing engine they would be **exact copies**, differing only in title. Two options:
- **A (recommended): Change Number Fishing's content** to "catch the number that comes next" (pond shows 4, 5, _ → catch 6) or "catch the bigger number." This keeps the game count at 121 and adds a new skill.
- B: Remove #39. This drops the catalog to 120 games and changes the free/Premium counts on the subscription page, sitemap text and store copy.

The same copy risk applies to Number Rain vs Falling Numbers (#121) and Number Monster vs Hungry for Numbers (#118). The plan above avoids both by giving each one a different task.

## Free vs Premium

- Free: Simple Jigsaw (#81) only.
- Premium: the other 10.
- Moving games to their real scenes doesn't change the 46/75 split.

## Difficulty and levels

- Generic engines: answer choices grow with level (count(level)), numbers go up to maxNumber(level), and the order engine's sequence gets longer (3/5/7 numbers, 3/4/6 letters). Rounds are fixed at 5.
- Fishing/Rain/Monster: same round content and level settings, 5 rounds, plus extra choices added so there are always at least 3. Difficulty stays about the same.
- Rocket: sequence length follows the same order-engine tiers, so it stays the same.
- Maze: 3/5/7/8/10 dots, 4–2 mazes per session. A letter maze would reuse these tiers.
- Jigsaw: 2/4/6/9 pieces, 4–2 puzzles per session. This is a bigger change than the current 1-tap choice. Easier at levels 1–2, harder at 4–5. Level and session length lock when a session starts, the same protection as the animal jigsaw.
- One thing that changes: these games go from tap to drag/trace. That raises the effort needed for the youngest Explorer mode (ages 2–3). Letter/Number Rocket and Number Fishing currently allow Explorer, so drag targets need the existing tap fallback (already built in).

## Proposed batches

**Batch 1 (small, low risk):** Letter Rocket, Number Rocket, Simple Jigsaw (fixed easy cut, animal set), Number Fishing changed to "what comes next."

**Batch 2 (medium, one shared change):** add a picture-clue area to Fishing/Monster/Rain. This unlocks Word Fishing and Number Monster (counting). Also in this batch: Number Rain "in order" mode and Letter Maze. The clue area also covers the counting interaction planned next.

**Batch 3 (new pictures):** Alphabet Jigsaw and Number Jigsaw picture sets (generated, bundled, offline). Shape Train as a train skin on the sequence scene.

## Applies to all batches

- Spanish: new prompts use the authored Spanish word list and agreement templates. No translated letter words.
- New spoken lines are added to the narration gap list. No audio is generated without approval.
- Tests: each moved game opens its expected scene, and no two games share the same engine and content.
- No changes to the gate, subscriptions, pricing or the free/Premium flags.

## Questions for you

1. Number Fishing: change its content (A) or remove it (B)?
2. Simple Jigsaw: reuse the animal pictures, or a new picture set?
3. Start with Batch 1 only, or Batches 1 and 2 together?
