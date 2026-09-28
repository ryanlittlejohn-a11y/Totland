# Number Pop device voice: findings and proposed fix

## Findings (read-only, verified)

**1. No Number Pop audio is missing.** Number Pop's lines are all recorded in the shared library under the exact wording the app uses today. That's 69 of 69:
- 20 questions: "Can you find the number 1?" through "…20?"
- 20 reveals: "That's 1!" through "That's 20!"
- 20 retry hints: "one looks like 1." through "twenty looks like 20."
- All 9 English praise and try-again lines

**2. The wording hasn't changed since the game was built.** The question, reveal and hint text in Number Pop was last touched on 4 Sep, before any tier was recorded. The order-game crash fix and the wording fixes didn't touch it, so the text still matches what was recorded.

**3. It isn't only Number Pop.** Number Bubbles, Number Fishing and Number Rocket use the same line generator, so their lines are identical and all recorded. Letter Pop is also fully recorded: 78 of 78 questions, hints and reveals. If one of these games falls back to the device voice, the cause is the same for all of them.

**4. Root cause: something switched Hannah off for the whole session.** The audio itself is fine.
- A game falls back for every line (question, praise and reveal) only when the session-wide "voice unavailable" flag is on. While that flag is on, the app skips the shared library completely, so even recorded lines use the device voice.
- Before the fix on 27 Sep (16:08 UTC), **any** single unrecorded line turned that flag on. That's the bug we already fixed.
- Since that fix, only a quota or rate-limit response from our server can turn it on. Our server logs no voice generation attempts at all in the last 3 days. That makes it very unlikely the current code turned the flag on.
- **Most likely explanation:** the tester's TestFlight build was made before the 27 Sep fix. I can't see which build they have, so please confirm the build number or date. Also, inside the phone app the flag lasts until the app is fully closed, not just sent to the background. So one bad moment can keep Hannah off across several games.

**5. A weak spot remains in the current code.** Even after the fix, one real quota or rate-limit event still makes recorded lines use the device voice for the rest of that app session. The flag should only stop the app from *creating new* lines. It shouldn't stop it from *playing ones that are already recorded*.

## Proposed changes (after your approval)

1. **You check:** confirm the tester's build was made after 27 Sep 16:08 UTC. If it wasn't, a new Codemagic build alone should fix what they're hearing.
2. **Code hardening (small, speech only):** when the voice is paused for quota or rate limit, keep playing recorded lines from the shared library. Use the device voice only for lines that have never been recorded.
3. **Verify:** with the pause flag forced on, Number Pop and Letter Pop should still play Hannah for all their lines. A deliberately unrecorded line should use the device voice, and no new audio should be created.

No changes to game rules, scoring, sign-in, payments, the parental gate or Premium. No audio will be recorded.

## Technical details

- `src/lib/speech.ts`: `fetchAndStore` returns early when `voiceRequestsBlocked()` is true, before it ever calls `speakText`, so library hits get skipped too. The plan is to always call `speakText` and send it an `allowGenerate: false` hint while blocked.
- `src/lib/tts.functions.ts`: add an optional `allowGenerate` input. When it's false, a library miss returns `unavailable/service` right away, without checking sign-in, the rate limit or ElevenLabs. Library hits are unchanged.
- Evidence: SHA-256 keys `en:<text>` were checked against the `voice-clips` storage objects. `voice_generation_events` has 0 rows in the last 3 days. The per-line fix is commit 09f09fe (27 Sep 16:08 UTC).
