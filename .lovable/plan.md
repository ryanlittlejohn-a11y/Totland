# Letter Fishing: drag-the-hook game + reusable drag foundation

## What the child sees
- A pond scene with 3–5 letters (count follows the existing level rule) bobbing gently on the water.
- Each round starts with the spoken line "Catch the letter B!" (Spanish too). Tapping the speech bubble repeats it.
- A big hook on a line hangs from a rod at the top. The child drags it down onto a letter.
  - Correct letter: it gets caught and reeled up, with the same praise, chime and reveal line as now ("B is for Ball!").
  - Wrong letter: the hook bounces off and the letter wiggles and drifts away. A soft "Try another one" plays and the hook floats back up. Nothing is recorded as a mistake (see scoring note).
  - Let go in empty water: the hook just drifts back up. Nothing happens.
- No timers. Same number of rounds as now, then the same reward screen.
- Reduced motion: letters sit still and the hook snaps back without animating. Everything still works.
- High contrast: letters get solid outlined tiles and the hook and line get a thick high-contrast outline.

## Scope
- Only Letter Fishing (game #6) changes. Its catalog row switches from engine `choice` to a new engine `fishing`, still with kind `findUpper`. Title, emoji, premium flag, skill, world and number stay the same.
- Letter Pop, Feed the Letter Monster, Letter Bubbles, Letter Rocket and Letter Rain stay on the tap game. ChoiceGame.tsx is not touched.

## Component structure
```text
src/hooks/useDragToTarget.ts        generic drag primitive (no fishing references)
src/components/game/DragTarget.tsx  tiny helper: registers a drop-target element by id
src/components/game/LetterFishingGame.tsx   round flow, scoring calls, speech
src/components/game/FishingPond.tsx         pond/hook/line visuals on top of the primitive
```

**useDragToTarget (reusable):**
- Input: `onDrop(targetId | null)`, optional `onHover(targetId | null)`, `disabled`, `hitSlop` (px, default 24 so targets are forgiving).
- Returns: `handleProps` to spread on the draggable element, `registerTarget(id)` ref callback, the live `offset {x, y}`, `dragging`, `hoverId`, and `reset()`.
- Hit-testing: on move it checks the handle's tip point (configurable via `getTipPoint`, so the fishing hook uses the hook's point and Feed the Letter Monster can later use the item's center) against registered target rects, which are measured once at pointerdown.
- Knows nothing about letters, hooks or fishing, so Monster, Word Rocket and Jigsaw can reuse it later.

## Touch, pointer and VoiceOver handling
- Pointer events only (`pointerdown/move/up/cancel`), with `setPointerCapture` so the drag keeps following the finger even outside the hook.
- Only the first pointer is tracked (`isPrimary`, and the pointerId is stored). A second finger is ignored, so multi-touch can't break it.
- `touch-action: none`, `user-select: none`, `-webkit-user-select: none`, `-webkit-touch-callout: none` on the hook and pond, so iOS won't scroll, zoom, select text or show the long-press menu. The rest of the page scrolls normally.
- `pointercancel` or losing capture resets the hook with no penalty.
- The hook's touch area is at least 64px, and each letter is at least 72px.
- **Tap fallback:** every letter is a real `<button>` with a label like "Letter B". Tapping or activating it with VoiceOver counts the same as dragging onto it (correct = caught, wrong = gentle bounce). A tap is only treated as a tap when the pointer moved less than 8px, so a drag that ends on a letter isn't counted twice.
- The hook is marked `aria-hidden`, and a screen-reader-only line says "Tap the letter to catch it". The result message uses the existing `role="status"` area.

## Scoring note (flagging a small difference)
The current tap game records wrong taps through `recordAnswer(correct:false)` and gives 1 star instead of 2 after a miss. Your rule says a wrong catch is not a failure, so:
- Wrong bounces are **not** recorded as wrong answers and don't cost stars. Every catch gives 2 stars and is recorded as correct, with response time.
- `recordGameComplete`, `onFinish(stars, accuracy)`, levels and difficulty all use the existing functions unchanged.

If you'd rather keep the exact 2-stars/1-star rule, tell me and I'll make wrong bounces count the way they do now.

## Technical details
- `catalog.ts`: add `"fishing"` to `EngineId`, map it to the `"drag"` interaction label, and change row 6's engine field only.
- `game.$gameId.tsx`: add one branch, `engine === "fishing" ? <LetterFishingGame kind theme onFinish />`.
- Rounds come from the existing `roundForKind("findUpper", level)`, so they stay bilingual and use the same level-based option count. The spoken prompt is changed only in this component ("Catch the letter X!", with Spanish from i18n).
- The existing narration clips are reused where they exist. The new "Catch the letter X" lines fall back to the free voice until clips are recorded. I'll list them later if you want a narration batch.
- Speech, chime, `themeChime`, theme scene and praise come from the same helpers ChoiceGame uses.
- Bobbing uses CSS keyframes, which are turned off when `profile.reducedMotion` is on (plus a `prefers-reduced-motion` media query). High contrast uses `profile.highContrast`. Colors come only from existing design tokens.

## Verification
- Typecheck and build.
- Playwright with `has_touch=True` and an iPhone viewport:
  1. Drag the hook onto a wrong letter with pointer events: it bounces, no failure is recorded, and the round stays the same.
  2. Drag onto the correct letter: it's caught, the praise message shows, and the next round loads.
  3. Tap the correct letter directly (the VoiceOver fallback): it's caught.
  4. Add a second touch mid-drag: it's ignored. Confirm `window.scrollY` doesn't change during a drag.
  5. With reduced motion on, letters have no animation and the game still works. With high contrast on, a screenshot shows the outlined tiles.
  6. Play all rounds and confirm the reward screen appears.
- Regression: Letter Pop and Letter Rocket still show the tap grid.

## Files
New: `useDragToTarget.ts`, `DragTarget.tsx`, `LetterFishingGame.tsx`, `FishingPond.tsx`. Edited: `catalog.ts` (engine type plus row 6's engine field), `game.$gameId.tsx`, `styles.css` (pond keyframes and touch utilities), `i18n.ts` (the new lines), `AGENTS.md` (drag primitive rule), `roadmap.md`.
