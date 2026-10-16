# Narration batch: English (Hannah) + Spanish (Lucy)

## Step 1 — Fresh coverage scan (no audio generated)
- Re-run the full scan across all 121 games, 10 storybooks, Flash Cards, Word Finds and quick-play pages, in English and Spanish, checking each line against the shared voice library in lookup-only mode.
- Includes the new lines from the rebuilt games (rockets, number fishing "what comes next", word fishing clues, number monster counting, number rain, letter maze incl. Ñ, vehicle jigsaw names).
- Output: exact missing line count and character-based credit cost per language, saved as `missing-lines_v3.tsv` and an updated coverage report in Files.

## Step 2 — Real credit balance
- Read the current ElevenLabs subscription balance (characters used / limit, reset date) through the linked account. Read-only.

## Step 3 — Go / stop check
Generate only if all of these hold:
- English gap within roughly 2x of the ~368 lines / ~12,500 credit estimate.
- Spanish gap within roughly 1.3x of the ~2,780 lines / ~59,000 credit estimate.
- Combined cost uses no more than 70% of the real remaining balance.
Otherwise stop and report the numbers before generating anything.

Before generating Spanish, drop any line that still uses an old translated letter pairing (e.g. "U es de paraguas") — only lines the current app can actually say get recorded.

## Step 4 — Generate
- English first with Hannah, then Spanish with Lucy, same voice settings as today, saved into the shared library so every device reuses them.
- Small batches with limited concurrency; stop immediately on any quota or rate-limit reply and report where it stopped.
- No pruning or deletion of existing clips.

## Step 5 — Verify and report
- Re-run the scan; expect zero gaps (or list any remaining).
- Spot-check playback of: a Number Fishing "what comes next" prompt, a Letter Maze prompt, a Simple Jigsaw vehicle name, a Premium storybook page, Spanish "¡Ñ, como en piña!", "¡H es de helado!", "¡W es de wafle!", "¡Escribe SOL…!".
- Report exact credits spent (balance before vs after) and remaining balance.

Nothing is published; app code is unchanged.

## Technical details
- Scan reuses the previous enumeration script with `allowGenerate:false`; generation calls ElevenLabs with `ELEVENLABS_API_KEY` server-side via a one-off script that uploads to the `voice-clips` bucket using the same sha256(`lang:text`) key as `tts.functions.ts`.
- Balance via `GET https://api.elevenlabs.io/v1/user/subscription` (`character_count`, `character_limit`).
