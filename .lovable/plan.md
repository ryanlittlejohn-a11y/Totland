# Silent narration on the Mac (iOS app): allowed-origin check and voice hardening

## Allowed-origin finding (read-only)

- **Finding from the code:** the backend list of allowed app addresses doesn't tell a Mac apart from an iPhone. It accepts exactly `capacitor://localhost`, `ionic://localhost`, `http://localhost` and `https://localhost`, compared as exact text. It doesn't look at the user-agent, the device type or the platform. When the iOS app runs on an Apple Silicon Mac, the binary, the web engine and the app's local address (`capacitor://localhost`, Capacitor's default iOS scheme, which we don't override) are all the same as on an iPhone. So by the code alone, a Mac should be accepted exactly like an iPhone.
- **What I can't verify:** I can't prove what address the Mac actually sends without a real request from that Mac. Code reading can't show it.
- **Why it probably isn't the whole story:** if the backend blocked the voice request, the app would get an error and switch to the device voice. You heard **neither** voice. Two things fit that:
  1. **The voice request hangs instead of failing.** The Hannah request has no time limit. If it never answers, the app waits forever and never falls back. That gives total silence for every line.
  2. **The device voice is blocked or dropped** by Apple's web engine, because it speaks right after cancel and outside a tap.

  The diagnostic log below will show which one it is on the first try.

**No change to the server's allowed-origin list is proposed.** Nothing in the code shows it's wrong, and widening it without evidence would weaken a security control. If the log shows a different address from the Mac, I'll come back to you with that exact one-line addition before making it.

## Proposed fix (app-side narration only)

1. **Time limit on Hannah requests.** If a line doesn't arrive within about 4 seconds, stop waiting and use the device voice for that line. The pause-for-session rules stay unchanged.
2. **Brief pause after cancel.** Wait about 60 ms after cancelling before speaking with the device voice, so Apple's web engine doesn't drop the line.
3. **Device voice unlocked inside the first tap.** On the very first tap, speak a silent, empty line through the device voice, in the same way the Hannah player is already primed. Later fallbacks that start after a network wait are then allowed. If a device-voice line still errors as "not allowed", keep it and replay it on the next tap, as Hannah already does.
4. **On-device diagnostic log.** Keep the last 50 narration events in memory and in local storage on the device only. Nothing is sent anywhere. Events include: setting off, played from cache, Hannah OK, Hannah unavailable (quota / rate limit / service), Hannah request failed (with the error name or "timed out"), Hannah refused by the player, device voice attempted, device voice started, device voice error (with its code), and no device voice available. A grown-up can read it in the parent area's Settings under a small "Narration diagnostics" line, with a Copy button, so a tester can paste it to us.

## Not touched

Game rules, scoring, sign-in, payments, the parental gate, Premium and the server's allowed-origin list stay the same. No audio is recorded.

## Rollout

Everything here is app-side. It reaches the Mac and iPhone only through a new Codemagic build; no publish is needed. After the build, open any game on the Mac, tap once, then open the diagnostics line. It will show exactly where narration stops.

## Technical details

- `src/lib/speech.ts`: wrap `speakText` in the existing `withTimeout` helper from `native.ts`, with a 4000 ms fallback of null. Keep `sayWithDeviceVoice` behind `setTimeout(…, 60)` after `cancel()`. Add a first-gesture `onGesture` prime of `speechSynthesis` with an empty utterance at volume 0. Add utterance `onstart` and `onerror` logging. Keep a pending device-voice replay on a `not-allowed` error.
- New `src/lib/narration-log.ts`: ring buffer of 50 entries (`{t, event, detail}`) mirrored to localStorage `totland.narration-log`, with no network calls.
- `src/routes/parent.index.tsx`: read-only diagnostics display with a Copy button, next to the existing narration toggle. The toggle logic itself is unchanged.
- `roadmap.md`: add "Mac silent narration: timeout, device-voice hardening, diagnostic log" plus the pending build and Mac check.
