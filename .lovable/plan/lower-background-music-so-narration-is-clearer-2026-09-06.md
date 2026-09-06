# Lower background music so narration is clearer

## What we’ll do
- Reduce the base background-music volume constant in `src/lib/music.ts` so it sits further under Hannah’s voice.
- Reduce the "ducked" volume (used while narration plays) even more so the narrator is always easy to hear.
- Keep the parent dashboard volume slider working with the new defaults.

## Proposed changes
- In `src/lib/music.ts`:
  - Change `BASE_VOLUME` from `0.12` to `0.07`.
  - Change `DUCK_VOLUME` from `0.04` to `0.02`.
- Verify the build/typecheck still passes.

## Test in the preview
1. Open the preview and start any kid-facing screen.
2. Confirm background music is still audible but noticeably quieter.
3. Trigger narration (tap an answer or wait for instruction) and confirm the music dips further while Hannah speaks.
4. Use the parent dashboard "Music volume" slider to confirm it still adjusts loudness on top of the new defaults.
