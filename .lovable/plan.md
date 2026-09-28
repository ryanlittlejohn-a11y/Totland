# No voice at all on the Mac (iOS app on Apple Silicon) — findings and next step

## What I checked (read-only)

1. **Narration setting default** — Unchanged. A fresh profile starts with narration **on** (`narration: true`). The recent fix never touched the profile or settings code. Games switch narration on or off only from the saved setting, and only the grown-up Settings toggle changes that setting. I found nothing that reads a fresh profile as "off". A family that switched narration off earlier would keep it off, because the setting is shared by all children and synced to the account.

2. **Tap-to-unlock on a Mac** — I **can't verify** this. My test browser is Chrome on Linux, not Apple's iOS web engine running on macOS. I can't run the iOS app on a Mac, so anything I said about gestures there would be a guess. From the code: the unlock listens for mouse, touch and key presses, so a Mac click should count. A mouse-trackpad click sends "pointerdown", not "touchend", and that is enough. If Hannah's clip is refused, the app keeps it and tries again on the next tap. So a missed unlock should give delayed voice, not permanent silence.

3. **allowGenerate change** — It only has an effect when the pause flag is on. For a normal request, the app sends `allowGenerate: true`. The server checks the shared library first, then signs in, applies the hourly limit, calls ElevenLabs, saves the clip and returns it. The early exit happens only when `allowGenerate` is false. Every other failure returns "unavailable" or throws, and the app catches both and uses the device voice. The fix can't make the app go silent.

4. **Device-voice fallback** — There is a real weakness, and it affects Mac and iPhone alike. It isn't specific to the Mac:
   - It speaks right after `speechSynthesis.cancel()`. On Apple's web engine, a line started straight after cancel is sometimes dropped without any error.
   - It speaks after a network wait, so not during a tap, and the tap-unlock never unlocks the device voice. Apple's web engine can block speech that a tap didn't start.
   - An empty voice list is fine: the app just uses the default voice. There's no retry, but there doesn't need to be one.
   - If speech fails, nothing reports it. We can't tell "blocked" apart from "played".

## Key point

Silence from **both** Hannah and the device voice points to a shared cause, not the voice code. The likely candidates are the narration setting being off, the Mac's sound output or mute, or Apple's web engine on macOS blocking all web audio. Two parts that work independently are unlikely to fail together because of the recent fix.

## I need your answers before I can go further

- In the app's grown-up Settings on the Mac, is **Voice narration** switched on?
- Is the Mac's volume up and not muted? Does the **background music** or the **tap chime** play in the app? If the music plays but voice doesn't, the cause is in narration. If nothing plays at all, it's the Mac's sound or the environment.

## Genuinely unknown without a real device

- How Apple's web engine handles tap-unlock and speech when an iOS app runs on macOS.
- Whether the iPhone build has the same problem. The code paths are the same, so an iPhone test is the clearest check.

## Proposed next step (after your answers, no changes yet)

- If the music also plays silently: nothing to fix in code; it's the Mac's sound settings or a macOS limitation. We recommend testing on the iPhone.
- If the music plays but voice doesn't: a small, approved-first change that
  - adds a tiny on-device log of why each line didn't play (setting off, refused, fallback used), with no data sent anywhere, and
  - makes the device voice more reliable: a short pause after cancel, and unlocking speech on the first tap.
  This needs a new Codemagic build. No changes to game rules, scoring, sign-in, payments, the parental gate or Premium, and no audio recorded.
