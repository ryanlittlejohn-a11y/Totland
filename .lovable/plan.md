# Lucy for Spanish: clean up the test, then plan the library refresh

## 1. Remove the test page and clips

- Delete `src/routes/voice-test.tsx` (the route list regenerates itself).
- Delete `public/voice-test/01.mp3` … `10.mp3` and the now-empty folder.
- Remove the Word Find/voice-test line from `roadmap.md`.

Nothing else links to that page, so removing it changes nothing a child or parent sees.

## 2. Spanish voice routing — confirmed

`src/lib/tts.functions.ts` holds a small voice table: English uses Hannah, Spanish uses Lucy (`Bh4tkGuEEIADxUACafG5`). Every Spanish line the app speaks goes through that table, so all future Spanish recordings are Lucy's. Nothing resets or overrides it — it is a plain constant in the code, not a setting. I will only update the stale comment above it that still says Spanish "falls back to Hannah".

## 3. Regenerating the Spanish library in Lucy's voice

### What exists today

The shared clip library holds **186 recordings** (recorded 13–20 September), stored under scrambled names that mix the language and the text together. That means I can't read the list and tell you "these 40 are Spanish" — the names don't reveal it. It doesn't matter in practice: I can recompute the exact name for any Spanish line, so the refresh targets precise lines rather than guessing from the list.

Any Spanish clip in there was recorded in Hannah's voice and would still play in Hannah until it is replaced.

### Scope: the essentials tier

Same set we agreed earlier — the lines a child hears constantly:

- letter names (A–Z)
- numbers 1–20
- colours
- shapes
- core vocabulary words
- praise and encouragement phrases
- storybook page text

**Roughly 400 Spanish lines, ~3,100 characters ≈ 3,100 ElevenLabs credits, about 3 MB of audio.** I will re-count the exact lines from the app's Spanish text before generating and report the precise number for your approval.

Not included in this tier: the long tail of generated prompt variations and hints. Those keep working — they are simply spoken live in Lucy's voice the first time they come up, and recorded from then on.

### How nothing breaks

- The name of a clip is derived from the language plus the exact words, so a re-recorded Spanish line **lands on the same name** and everything that already points at it keeps working. No paths change, no code changes, no references to update.
- Each file is overwritten in place, one at a time. If the run stops halfway, the remaining lines are still the old Hannah recordings — nothing is ever missing or broken, just not yet refreshed.
- English recordings are never touched: different language, different name.
- Devices that already cached a Spanish line locally will keep hearing Hannah until that cache is cleared. To make the switch immediate everywhere, I would bump the on-device cache name once (a one-word change), which quietly re-downloads Spanish lines in Lucy's voice. I recommend doing that in the same step.
- Offline play, Premium, music, the parental gate and all English narration are untouched.

### Order of work

1. Clean up the test page and clips (step 1 above) — no credits.
2. Count the exact essentials lines and report the precise credit figure.
3. **Stop for your approval on the spend.**
4. Run the refresh once approved, then report actual credits used.

## Technical details

- Delete: `src/routes/voice-test.tsx`, `public/voice-test/*.mp3`. Edit: `roadmap.md`, comment in `src/lib/tts.functions.ts`.
- Storage key is `sha256("<lang>:<text>")` in bucket `voice-clips`, so regeneration is idempotent and key-stable; uploads use `upsert: true`.
- Refresh runs as a one-off server-side script calling ElevenLabs directly with `eleven_multilingual_v2` and the existing voice settings (stability 0.5, similarity 0.75, style 0.4, speaker boost, speed 0.95), sequentially, skipping nothing and logging each key.
- Optional cache bump: `VOICE_CACHE` in `src/lib/speech.ts` from `totland-voice-v1` to `v2`.
