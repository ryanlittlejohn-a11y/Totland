# Number Maze — bespoke path-tracing game (plan)

## What exists today
- Catalog row 47: "Number Maze", engine `order`, kind `numbers`, skill numbers, free, description "Move through numbers in order".
- It uses the shared OrderGame tap-in-sequence mechanic. The `numbers` round builder gives 3 numbers at level 1, 5 at levels 2-3, and 7 at levels 4-5, starting at a random number. 14 catalog rows use the `order` engine, and all of them stay unchanged.
- It has a theme entry in game-themes.ts ("Follow the number path!"). That entry stays as is.

## Honest assessment: what can be reused, and what's new
- **useDragToTarget: doesn't fit and won't be touched.** It models "pick up one item and drop it on one target". A maze is one continuous stroke that passes through many points and never drops anything. Forcing it in would mean changing the shared hook the four shipped games depend on.
- **TracingCanvas: borrow the ideas only.** It's a small handwriting canvas that paints dots and counts coverage, and it has no idea of points or order. Three techniques are worth copying: the no-scroll touch setting, holding onto the finger for the whole stroke, and converting screen positions into board positions. The component itself stays untouched.
- **Verdict: this is a genuinely new, fifth interaction pattern.** It gets a new, small, self-contained path-tracing hook. Nothing that already ships is changed.

## Maze layout and difficulty (tied to the numbers skill level, like Jigsaw)
The points sit on a winding, hand-drawn-looking path across a square board. It's a connect-the-dots trail, not a walled maze. A faint dotted guide path shows the route, and a solid trail is drawn as the child connects each point.

| Numbers level | Points | Numbers used | Layout | Mazes per session |
|---|---|---|---|---|
| 1 | 3 | 1-3 | gentle curve | 4 |
| 2 | 5 | 1-5 | S-curve | 3 |
| 3 | 7 | 1-7 | S-curve | 3 |
| 4 | 8 | 1-8 | zigzag snake | 2 |
| 5 | 10 | 1-10 | spiral or snake | 2 |

- Numbers always start at 1, matching "connect 1, 2, 3..." for ages 2-6. Point counts sit just above the existing order-game counts (3/5/7) and stay at or below 10.
- There's a small set of hand-designed layouts per level (about 3 each), picked at random and possibly mirrored. Points are placed so they are never closer than one touch-target width apart.
- Each point is a round number stone at least 64 px wide, about 72 px on phones. Level 5 (10 points) was checked against the smallest phone board (about 340 px square).
- The level is fixed when the game starts, so a level-up mid-game doesn't rebuild the board. This is the same approach as Jigsaw.
- **Reveal:** each completed maze shows the traced shape filling in as a simple picture (star, fish, heart, house, and so on, drawn in code as outlines), plus a praise line.

## Interaction rules
- **Start:** the child puts a finger on 1, or on the last connected number when resuming. Starting anywhere else draws nothing, and the next number gently pulses as a hint.
- **Drawing:** while the finger moves, a live line follows it from the last connected number.
- **Correct number:** the finger enters the next number's zone (slightly larger than the stone). The number locks, the segment becomes solid, a short chime plays, and the number is spoken.
- **Wrong number:** entering a number out of order (for example 5 when 3 is next) is penalty-free. That stone wiggles and the loose line snaps back to the last connected number. Nothing is recorded, and stars and accuracy are unaffected. A gentle "Find 3!" is spoken no more than about every 2 seconds. Progress is kept.
- **Passing over a connected number:** nothing happens.
- **Lifting the finger:** progress is kept and the loose line disappears. The child continues from the last connected number. There are no timers.
- **Maze finished (highest number reached):** the reveal animation plays, with praise and a reward chime. After the last maze comes the full reward: `recordGameComplete(profile, "numbers", 3, 1)` and `onFinish(3, 1)`.
- **Scoring:** each correct connection is recorded as a correct answer, the same as Jigsaw placements. Misses are never recorded.

## Tapping as a full alternative to dragging (VoiceOver)
- Every number stone is a real button labeled, for example, "Number 3, next". Connected stones are labeled "connected". Stones not yet reached are labeled "Number 5".
- **Tapping the next number connects it in full.** It draws the segment, plays the chime, speaks the number, and announces it to VoiceOver. The whole maze can be finished with taps alone, with no dragging needed. Enter and Space also work from a keyboard.
- Tapping a wrong number gives the same penalty-free wiggle, and VoiceOver hears "Find 3".
- A visually hidden live message keeps the child updated, for example "3 connected. Next: 4."
- Drag and tap can be mixed freely.

## Baseline requirements
- The spoken instruction is given each maze (EN/ES): "Trace the path: start at 1 and follow the numbers!" It uses the existing library, live voice or device voice. No new audio is generated.
- **Touch:** no page scrolling on the board. Only the first finger draws, and any other finger is ignored until it lifts. Text selection is blocked.
- **Reduced motion:** no pulsing, wiggle or reveal animation. The line and lock-ins still appear right away, so the game stays fully playable.
- **High contrast:** thick outlines on the stones, a solid dark trail, and "next" is shown by an outline plus the label, not by color alone.

## Scope
- Only row 47 changes engine, from `order` to a new `maze` engine with the "trace" interaction.
- Not touched: OrderGame.tsx, the round builder, the other 13 order rows (Alphabet Train, Letter Garden, Number Train, Number Rain, Picture Path, and so on), useDragToTarget, DragTarget, TracingCanvas, and anything related to sign-in, subscriptions, payments or the parental gate.

## Verification
- **All five levels:** correct point count and number of mazes, and finishing by drag gives the full reward.
- **Wrong-order touches:** they bounce, nothing is recorded, stars and accuracy are unchanged, and the child can resume.
- **Lifting mid-path:** progress is kept.
- **Tap-only:** a full session can be finished without dragging, including by keyboard, and the VoiceOver labels and live messages are present.
- **Touch safety:** a second finger is ignored and the page doesn't scroll.
- **Accessibility settings:** reduced motion and high contrast both still leave the game playable.
- **Regression checks:** Letter Fishing, Feed the Letter Monster, Word Rocket and Animal Jigsaw. Number Train, Alphabet Train and Picture Path stay unchanged tap-in-order games.
- Typecheck and build are clean.

## Technical details
- **New files:**
  - `src/hooks/usePathTrace.ts`: tracks one pointer (holds onto it and ignores any second pointer), converts screen positions to board positions, and tests each position against the point zones. It reports enter-point, move and end events.
  - `src/lib/number-maze.ts`: layouts per level, the level-to-tier mapping, and the reveal shapes.
  - `src/components/game/NumberMazeScene.tsx`: an SVG board with the guide path, the trail, the live line, and the stone buttons.
  - `src/components/game/NumberMazeGame.tsx`: rounds, speech, recording and the finish step.
- **Edited files:**
  - `src/lib/catalog.ts`: add `maze` to the engine list, map it to the "trace" interaction, and change row 47 only.
  - `src/routes/game.$gameId.tsx`: add a maze branch.
  - `src/styles.css`: maze styles, including reduced-motion and high-contrast rules.
  - `roadmap.md`
- **Assumption:** the game stays free, as row 47 is today. The theme mascot and colors are reused.
