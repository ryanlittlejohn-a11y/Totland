# Hannah's voice not playing on TestFlight: findings and proposed fix

## Findings (checked live, nothing changed)

1. **Not a publish gap.** The live site answers the iPhone app's voice requests correctly. I sent Hannah's request from the live site exactly as the iPhone app does (same app origin and headers). It got a 200 reply with real audio ("Can you find the letter N?", 32 KB) and the right permission header. Playing Letter Pop on the live website also gets Hannah's audio back. This is different from the CORS bug: the live backend already has yesterday's fixes.
2. **Recorded lines are served fine.** Recorded lines come from the shared library and never touch ElevenLabs. So the ElevenLabs key and its remaining credits don't affect the hundreds of clips we pre-recorded. The key only matters for brand-new lines. I didn't test it live because that would generate audio.
3. **Recent changes are not the cause.** Nothing in the last two days touched how narration plays. The only speech change added the praise-plus-teaching split, and it's add-on only. The connection fixes only add permission headers. Today's work (ordering-game crash, rebalance, wording) didn't touch audio.
4. **Likely cause (in the app itself, found by reading the code):** one "no" from the server turns off Hannah until the app is closed.
   - When the server says "unavailable" for any single line, the app turns off Hannah's voice for the rest of the session. That includes every already-recorded line.
   - The server says "unavailable" for a line that isn't recorded yet when the family isn't signed in. On TestFlight that's the normal case: Premium works without an account.
   - Many lines contain a name or change each round, so the first one that isn't recorded switches Hannah off, often within seconds.
   - After that, the iPhone falls back to the device voice. Silent mode can make that fallback silent (see point 5). Closing and reopening the app resets it.
   - The iPhone app also skips downloading common lines ahead of time. It was turned off because it froze real devices. So almost nothing is saved on the device yet, and every line depends on the server.
5. **Possible second cause, iPhone only:** the app never asks iOS to play sound when the ring/silent switch is on silent. With the switch on silent, iPhone apps like this can go fully quiet: Hannah, the device voice and possibly the music. I can't confirm this from here.
6. **Web vs native:** the same shutoff logic runs on the website too, but it hits the iPhone app much harder. The iPhone app starts with nothing saved on the device, and the silent-switch issue only exists there.

**Not yet confirmed:** whether the tester hears the robotic device voice or nothing at all, and whether the phone was on silent. That answer tells us which cause (point 4 or 5) they hit.

## Proposed fix (after your approval)

- **Only real account-wide problems switch Hannah off:** out of credits, or a rate limit from ElevenLabs. When a single line just isn't recorded, only that line uses the device voice. The next recorded line still plays in Hannah's voice.
- **iPhone silent switch:** set the app's sound to keep playing when the ring/silent switch is on silent, like other kids' learning apps. This is one small setting in the iPhone app's startup code. It needs a new Codemagic build, but no backend publish.
- Verify in a test browser as a signed-out family: play through a new line that isn't recorded, then confirm the next recorded line still uses Hannah. Check on the live site too.

Sign-in, payments, the parental gate, scoring and the premium flags stay untouched. No audio gets generated.

## Technical details

- `src/lib/speech.ts` `fetchAndStore`: call `blockVoiceRequests()` only when `result.reason` is `"quota"` or `"rate_limit"`; treat `"service"` as a per-line miss.
- Optional: `tts.functions.ts` could return a distinct `"not_recorded"` reason for anonymous library misses so the client never confuses it with an outage.
- `ios/App/App/AppDelegate.swift`: set `AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio, options: [.mixWithOthers])` at launch. Web deploy unaffected.
- Evidence: live `POST /_serverFn/9dccd720…` with `Origin: capacitor://localhost` returned 200 + audio. The OPTIONS preflight allows `x-tsr-serverfn`.
