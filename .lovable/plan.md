# Option 1 investigation: bespoke game interactions

## Recommendation

Build a first wave of **five** bespoke games, then decide whether to add the next three. This gives the catalog visibly different play patterns without replacing the stable shared engines or changing scoring, difficulty, access, or catalog metadata.

The existing theme layer is effective for memory and hunt games, whose shared mechanics already match their titles. The biggest gap is where a title promises motion or object manipulation but the game still presents a static tap grid.

## Ranking of all 22 repeated families

Ranked by likely improvement from bespoke interaction, balanced against how convincing the current theme treatment already is:

| Rank | Shared family | Games | Bespoke value | Current themes | Recommendation |
|---:|---|---:|---|---|---|
| 1 | `choice/findUpper` | 6 | Very high | Weak mechanically | Bespoke the strongest title-led variants |
| 2 | `order/buildWord` | 5 | Very high | Weak mechanically | Add one or two manipulation-based variants |
| 3 | `order/numbers` | 4 | High | Moderate | Number Rain and Number Maze strongly promise motion |
| 4 | `choice/countObjects` | 5 | High | Moderate | Turn selected titles into collecting/grouping play |
| 5 | `choice/jigsawPiece` | 3 | High | Weak mechanically | A real piece-placement interaction would match the names |
| 6 | `order/letters` | 4 | High | Moderate | Trains, bridges, gardens, and races suggest spatial sequencing |
| 7 | `choice/findNumber` | 4 | High | Weak mechanically | Reuse proven bespoke patterns from letters after validation |
| 8 | `choice/missingLetterWord` | 2 | High | Moderate | Word Fishing especially promises a different interaction |
| 9 | `choice/letterPuzzle` | 2 | Medium-high | Moderate | Good future fit for piece assembly |
| 10 | `choice/completePicture` | 2 | Medium-high | Moderate | A true picture assembly mechanic would add value |
| 11 | `choice/shapeMissing` | 2 | Medium | Good | Dragging a missing shape into place could improve one title |
| 12 | `choice/patternNext` | 2 | Medium | Good | Existing choose-the-next-piece interaction is already appropriate |
| 13 | `choice/startsWith` | 2 | Medium | Good | Train loading could differentiate one title, but the learning task is already clear |
| 14 | `choice/letterSound` | 2 | Medium | Good | Audio is already the main differentiator; avoid timing pressure |
| 15 | `choice/numberPuzzle` | 2 | Medium | Good | Could share a later jigsaw framework |
| 16 | `choice/shapeShadow` | 2 | Medium-low | Good | Matching a shape to a shadow naturally works as a choice game |
| 17 | `choice/numberQuantity` | 2 | Medium-low | Good | Current number-to-quantity matching already fits the objective |
| 18 | `hunt/letters` | 3 | Low | Strong | Safari, maze, and detective themes suit the existing find-many play |
| 19 | `memory/letters` | 3 | Low | Strong | Card matching is an expected, complete mechanic |
| 20 | `memory/wordPicture` | 2 | Low | Strong | The shared memory mechanic fits both titles |
| 21 | `memory/numbers` | 2 | Low | Strong | The park theme is sufficient variation for a familiar memory game |
| 22 | `memory/animals` | 2 | Low | Strong | Bespoke work would add little compared with its cost |

## Top eight candidates

### First wave

1. **Letter Fishing — Medium**
   - Drag a large hook along a short line and release over a floating target letter.
   - Wrong letters bob away gently; the target remains available with another spoken clue.
   - **Reuse:** existing letter rounds, narration, scoring, theme shell, and the proven pointer-capture approach from Word Find.
   - **New work:** drag surface and target collision; light water/hook animation; no new educational content generator.

2. **Feed the Letter Monster — Medium**
   - Drag the requested letter into a large friendly monster mouth.
   - A mismatch is returned to its starting place with encouragement; the monster never reacts negatively.
   - **Reuse:** the same letter round data as `findUpper` and much of Letter Fishing's drag controller.
   - **New work:** drop zone, snap-back behavior, mouth animation, and accessible tap-to-select/tap-to-feed fallback.

3. **Word Rocket — Medium**
   - Drag letter tiles into large rocket fuel slots in reading order.
   - Correct tiles lock into place; a misplaced tile floats back without penalty.
   - **Reuse:** `buildWord` sequence data and completion/scoring behavior from Order Game.
   - **New work:** reusable ordered-slot drag engine and launch completion animation; round generation remains substantially unchanged.

4. **Animal Jigsaw — Medium–Large**
   - Move two to six large picture pieces into silhouette slots, with generous magnetic snapping.
   - Pieces can be placed in any order; there is no timer or failed round.
   - **Reuse:** existing jigsaw answers, theme shell, progress recording, and drag controller.
   - **New work:** piece geometry, slot matching, completed-picture artwork, and placement-state logic. This has the largest art requirement in the first wave.

5. **Number Maze — Medium**
   - Trace a broad path through numbered stepping points in order, lifting and restarting anywhere without losing progress.
   - Spoken prompts name the next number; an off-path movement simply pauses the trail.
   - **Reuse:** number sequence data and the existing canvas/pointer foundation from Tracing.
   - **New work:** path corridor, next-node detection, and per-round maze layouts.

### Second wave, after device validation

6. **Letter Rain — Large**
   - Tap the requested letter as symbols drift downward; targets settle safely at the bottom rather than expiring.
   - No countdown, missed-object penalty, or speed requirement; reduced motion replaces falling with gentle stationary reveals.
   - **Reuse:** letter content, narration, and scoring only.
   - **New work:** a motion loop, spawn/layout rules, pause/resume lifecycle, and a static accessibility mode.

7. **Alphabet Train — Medium**
   - Drag letter cars onto a track in sequence; placed cars join the train.
   - **Reuse:** ordered-letter data and the ordered-slot drag engine created for Word Rocket.
   - **New work:** train-specific slots and completion animation; little new round logic.

8. **Count the Fruit — Medium**
   - Move fruit into a basket one at a time while the app counts each item aloud, then choose or place the matching numeral.
   - **Reuse:** existing object-count data, narration, scoring, and drag controller.
   - **New work:** collection state and count narration; a small extension to expose individual objects cleanly.

## Technical approach for a later build

- Keep each catalog row and its existing `engine`/`kind` unchanged.
- In the game host, select a bespoke renderer by **game ID** before falling back to the shared Choice, Order, Hunt, or Memory renderer. This allows individual upgrades without creating false differences elsewhere.
- Extract one reusable pointer-drag foundation for Fishing, Monster, Rocket, Train, Fruit, and Jigsaw. Use Pointer Events and pointer capture rather than browser HTML drag-and-drop, which is unsuitable for young children on touchscreens.
- Reuse the current narration, gentle retry, answer recording, completion recording, adaptive level, theme, SFX, high-contrast, and reduced-motion systems.
- Give every drag activity an equivalent large-target tap flow, so motor accessibility and VoiceOver do not depend on precise dragging.
- Preserve existing rounds where possible. Only Number Maze and Letter Rain require meaningfully new round/layout generation; Jigsaw needs new piece geometry and picture assets.

## Capacitor and iOS risks

Validate these on a physical iPhone and iPad before expanding beyond the first two games:

- **Pointer capture and scrolling:** ensure dragging does not scroll the page, lose the dragged item at an edge, or trigger native text/image selection.
- **Coordinate scaling:** test drop-zone hit detection after rotation, across phone/tablet sizes, and with safe-area insets.
- **Multi-touch accidents:** ignore secondary fingers safely and recover from interrupted gestures, app backgrounding, or incoming system overlays.
- **VoiceOver:** confirm the tap fallback exposes clear labels, order, selected state, and completion announcements.
- **Performance:** Letter Rain needs early frame-rate, heat, battery, background/resume, and audio-concurrency testing. Avoid Canvas or a physics library unless DOM transforms fail profiling.
- **Reduced motion:** use stationary alternatives, not merely slower animation. The current root setting already disables themed CSS animation; bespoke motion needs explicit state-level alternatives too.
- **Audio timing:** counting and spoken cues should use the existing audio system, avoiding new raw audio paths that can fail iOS gesture-unlock rules.

No device-motion, tilt, pinch, or rhythm mechanic is recommended in this phase. Each adds permissions, accessibility problems, timing sensitivity, or accidental-touch risk without enough learning benefit.

## Suggested delivery order and scope

1. **Foundation + Letter Fishing** — establish drag, tap fallback, accessibility, lifecycle recovery, and device test harness.
2. **Feed the Letter Monster** — prove the foundation supports a distinct drop-zone experience.
3. **Word Rocket + Alphabet Train** — build and reuse ordered slots.
4. **Number Maze** — extend the proven tracing canvas with path checkpoints.
5. **Count the Fruit** — add collection/count narration using the drag foundation.
6. **Animal Jigsaw** — proceed once final piece artwork and scope are agreed.
7. **Letter Rain** — last, after explicit performance validation and reduced-motion design.

**Rough scope:**
- First two games plus reusable drag foundation: **2–3 focused build/verification sessions**.
- Recommended five-game first wave: **5–7 sessions**, including one physical-device validation checkpoint.
- All eight candidates: **8–12 sessions**, with additional art review for Jigsaw and a separate performance pass for Letter Rain.

## Scope boundaries

This investigation changes no game code. A future implementation should not change shared scoring, difficulty, Premium access, free/Premium assignments, or catalog/metadata copy. Each bespoke game should retain the current themed look and fall back safely to its existing shared engine until its new interaction is verified.
