# Word Rocket plan

## Slot design: your choice (A or B)

Word Rocket uses the existing `buildWord` round data. It picks a short CVC word such as CAT or SUN and makes one tile per letter.

**A) Strict order (only the next empty slot accepts a tile)**
- Pros: keeps today's lesson of spelling left to right, which is also the order kids read in. There is only ever one active slot, so it is simple to highlight ("put the next letter here"). Tap fallback is very simple: tap a tile and it goes to the next slot if it is correct.
- Cons: a correct letter dropped on a later slot still bounces back, which can feel unfair to a 4-year-old ("but T *is* the last one!"). Most of the empty slots are just decoration. It feels less like a real drag game and more like tapping in order.

**B) Flexible slots (each slot accepts only its own letter, in any order)**
- Pros: kids can drop letters where they look right, which feels natural when dragging. It teaches where each letter sits in the word, and every slot is a real target. A correct drop never bounces, so there is less frustration.
- Cons: kids might fill the word from the ends and skip the left-to-right sounding-out. It needs two-step taps for the fallback (tap a tile, then tap a slot), which adds one more step for VoiceOver users. It needs a rule for repeated letters (see the technical section).

**Recommendation: B.** It makes the most of real drag and fits "put the fuel where it goes". It also keeps the lesson in place: when the rocket launches, the whole word is read aloud left to right, and each correct letter is spoken as it locks in. If you want the sequencing lesson kept exactly, A is a clean, lower-risk choice.

**Tap / VoiceOver fallback, matched to your choice**
- A: tap a tile and it goes into the next slot if correct, or bounces back with a gentle retry if not. It is one step.
- B: tap a tile to select it (it lifts up and gets outlined, and VoiceOver announces "C selected"), then tap a slot to place it. Tapping the same tile again deselects it. Slots are real buttons labeled "Fuel slot 1 of 3, empty".

## Behavior (either design)

- Rocket scene: the rocket sits in the middle and the fuel slots run up its body, one per letter. Jumbled letter tiles float in a row below it. All touch targets are at least 64px.
- Spoken instruction each round, with a replay button: "Spell CAT to launch the rocket!" / "¡Escribe GATO... " built from the existing round word, e.g. "¡Escribe CAT para lanzar el cohete!"
- Wrong drop, a dropped tile that misses every slot, or a wrong tap: the tile bounces back to its spot and a friendly retry line plays. No answer is recorded, and there is no effect on stars or accuracy. This is the same rule as Fishing and Monster.
- Correct fill: the tile locks in with a clunk/lock animation and the theme's "launch" chime, and the letter is spoken.
- All slots filled: rocket launch animation, praise, and the full-word reveal ("C-A-T spells cat!"). The game records one correct answer per letter, then recordGameComplete, then onFinish with the full 3 stars and accuracy 1. This is the same completion path OrderGame uses. Because wrong tries are penalty-free, every finished round earns full reward, matching the other bespoke games.
- No timers. Reduced motion turns off floating, the lock bounce, and the launch flight (the rocket just shows "launched" in place), and the game stays playable. High contrast adds 4px outlines to tiles and slots and a strong outline on the highlighted slot.

## Engine and routing

- New engine `rocket`. It is separate from `order` because it has different feedback and scoring rules (penalty-free instead of accuracy-based), just as `monster` was kept separate from `fishing`. Using the name `rocket` rather than something generic leaves room for other future rocket-style games.
- Only catalog row 30 (Word Rocket) changes from `order` to `rocket`. It stays Premium and keeps its skill, kind, and copy. `rocket` maps to drag interaction.
- `game.$gameId.tsx` gets a `rocket` branch. `OrderGame.tsx` and every other order game (Word Builder, Word Puzzle, Word Train, First Word Builder, Alphabet Train, Letter Garden, Alphabet Bridge, Alphabet Race, Number Train, Number Maze, Number Rain, Picture Path) stay untouched.

## Technical details

**Drag hook generalization.** `useDragToTarget` already registers many targets through `registerTarget(id)`, hit-tests all of them, returns the closest match within the hit slop, and passes `(targetId, handleId)` to `onDrop`. Monster added keyed handles. So multiple simultaneous targets need almost no change. Planned additive changes:
- Optional `isTargetEnabled?: (targetId, handleId) => boolean`. Filled slots (and, in design A, every slot except the next one) are skipped during hover and hit testing. This way a drop never gets taken by a slot that is already full. It defaults to all enabled, so Fishing and Monster behave identically.
- Hit slop stays 24px, but the closest-center tiebreak already handles slots that sit next to each other. The slot gap will be larger than 2 times the hit slop so there is no double-hit ambiguity.
- No change to the single-pointer lock, pointer capture, cancellation, `touch-action: none`, or the anonymous `handleProps` API.

**Repeated letters (design B).** Slots accept by letter label, not tile id. So in a word like "DAD", either D tile can go in either D slot. This avoids an unfair bounce.

**Files**
- `src/hooks/useDragToTarget.ts` (additive option only)
- `src/components/game/WordRocketGame.tsx` (new: round, narration, lock/penalty-free logic, completion)
- `src/components/game/RocketLaunchScene.tsx` (new: tiles via `getHandleProps`, slots via `DragTarget`, tap-select fallback, launch)
- `src/lib/catalog.ts` (`rocket` engine type + interaction mapping + row 30)
- `src/routes/game.$gameId.tsx` (rocket branch)
- `src/styles.css` (rocket scene, lock, launch, reduced-motion, high-contrast)
- `roadmap.md`, and `AGENTS.md` only if the drag rule needs a note on multi-target support

No narration audio will be generated. Spoken lines use the existing cached voice, live voice, or device voice.

## Verification (phone-sized browser)

- Word Rocket: complete 5 rounds by drag and get the full reward. Run wrong-slot drops, off-target drops, and wrong taps, and confirm the tile bounces back, there is no recorded answer, and stars and accuracy are unchanged. Check the repeated-letter case (B), or the next-slot-only rule (A). Check that full slots reject drops.
- Tap/keyboard fallback completes a round with no dragging.
- Put a second pointer down during a drag and confirm it is ignored. Confirm there is no page scroll or text selection.
- Reduced motion and high contrast visibly change the scene, and the game stays playable.
- Fishing regression: drag, tap fallback, ignored second pointer, penalty-free wrong catch.
- Monster regression: drag feed, tap feed, ignored second pointer, penalty-free wrong feed and bounce.
- Open Word Puzzle, Word Train, First Word Builder, Word Builder, Alphabet Train, and Number Maze, and confirm the tap-in-order game is unchanged.
- The build and type check are clean, and there are no runtime errors.
