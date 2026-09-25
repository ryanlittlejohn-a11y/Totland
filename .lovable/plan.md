# Feed the Letter Monster plan

## Approach

- Give **Feed the Letter Monster** its own `monster` engine. This is clearer than reusing `fishing`: both share drag infrastructure, while their scene direction, visuals, prompts, and feedback remain independent.
- Keep the existing `findUpper` round generator, learning level, five-round flow, reveal text, rewards, profile recording, and completion behavior. Only this catalog row changes; Letter Pop, Letter Bubbles, Letter Rocket, and Letter Rain remain on `ChoiceGame`.
- Build a dedicated monster scene with the monster and mouth centered toward the lower portion, plus 2–4 letters from the existing level-based round data arranged as large floating tiles around it.

## Shared drag foundation

The current `useDragToTarget` hit testing already supports the required direction: a draggable element can be tested against one registered mouth target. It needs only a small backward-compatible generalization because it currently exposes one anonymous draggable handle.

- Add keyed handle bindings, such as `getHandleProps(letterId)`, and expose the active handle ID and its offset.
- Keep the existing `handleProps` API intact so Letter Fishing does not need to change behavior.
- Keep one pointer lock inside each hook instance, preserving primary-pointer checks, pointer capture, forgiving hit slop, cancellation, and `touch-action: none`.
- Register the monster mouth as the single `DragTarget`. Letter tiles remain accessible buttons: tapping or VoiceOver-activating one invokes the same feed action as a drop.

## Components and behavior

- Add `FeedTheLetterMonsterGame` for round generation, narration, scoring, praise, chime, completion, and penalty-free retries.
- Add a focused monster scene component for the draggable letter tiles, mouth drop target, hover state, eat animation, and bounce-back/refusal state.
- Correct feed: animate the selected tile into the mouth, play the existing `munch` theme chime, speak the same praise plus existing reveal line, award the full two stars, and record one correct answer.
- Wrong feed: show a gentle sniff/refusal response, speak a friendly retry, bounce the tile to its original position, and record no answer, miss, accuracy change, or star reduction.
- Use the exact bilingual round instruction: “Feed the monster the letter B!” / “¡Dale al monstruo la letra B!” with a replay button.
- Add scene-specific semantic styles for large touch targets, target highlighting, stable positioning, and text selection/scroll prevention. Reduced motion removes floating/eating/bounce animation without changing interaction; high contrast adds strong outlines to letters and mouth.

## Routing and catalog

- Add `monster` to the engine type and map it to drag interaction and the existing five-round duration.
- Change only the `feed-the-letter-monster` catalog row from `choice` to `monster`.
- Route only the `monster` engine to the new game component; leave `ChoiceGame` and every sibling route unchanged.

## Verification

- Confirm the app builds cleanly and current diagnostics remain clear.
- In a phone-sized browser, open Feed the Letter Monster and verify all five rounds complete through drag with the expected full reward.
- Verify wrong drops and wrong tap feeds bounce/refuse, allow retry, and do not reduce stars or accuracy.
- Verify tap and keyboard/VoiceOver-style activation feed letters without dragging.
- Simulate a second pointer during an active drag and confirm it cannot move or submit another letter; confirm dragging does not scroll or select the page.
- Verify reduced-motion and high-contrast settings visibly affect the monster scene while it remains playable.
- Regression-test Letter Fishing by drag and tap through a round, including an ignored second pointer and a penalty-free wrong catch.
- Open Letter Pop, Letter Bubbles, Letter Rocket, and Letter Rain and confirm they still use the existing tap-choice interaction.

## Expected files

- `src/hooks/useDragToTarget.ts`
- `src/components/game/FeedTheLetterMonsterGame.tsx` (new)
- `src/components/game/MonsterFeedingScene.tsx` (new)
- `src/routes/game.$gameId.tsx`
- `src/lib/catalog.ts`
- `src/styles.css`
- `AGENTS.md` only if the shared drag architecture rule needs clarification
- `roadmap.md` to mark this approved bespoke game complete

No audio will be generated, and game logic outside this dedicated engine, subscriptions, gates, payments, and other games will remain unchanged.
