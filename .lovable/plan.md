# Fix: Hannah never plays in the phone app, and the device voice is silent

## Root cause 1: the "o.status" crash (reproduced)

**Where it happens:** `fetchAndStore` in `src/lib/speech.ts`, at the line `if (result.status !== "ok")`. The minified live code calls the voice request `i` and its answer `o`, which is where the logged name comes from.

**What is undefined:** the value the voice request hands back. The timeout is not involved. When it fires it returns a special marker that gets checked first, and that path logs "timed out after 4000ms" instead.

**Why it's undefined:**
- The server answers the phone app correctly: HTTP 200, full Hannah audio, and the right permission header. I checked this with the exact request the app sends, from the phone's own address.
- To decode the answer, the app looks for a marker header called `x-tss-serialized`.
- A browser only lets a page from another address read a response header if the server lists it as readable (Access-Control-Expose-Headers). Our allowed-origin list doesn't do that.
- The website runs on the same address as the server, so it can always read the marker. That's why every earlier check on the website passed.
- In the phone app the marker is hidden and reads as missing. The app then treats the encoded reply as plain data, looks for a `result` field that doesn't exist, and gets `undefined`. Reading `.status` from that crashes.

**Reproduced:** I loaded a page from `http://localhost`, which is on the phone-app list, and sent the real Number Pop request to the live server in a real browser:
`status 200, content-type application/json, x-tss-serialized = null, .result = undefined`.
The same request from the website decodes normally and plays Hannah.

**Wider impact:** every server call from the phone app decodes the same way, so the same fault reaches them too: account deletion, children sync and subscription checks. This bug may also explain the earlier Number Pop "robotic voice only" report. I haven't confirmed either of these on a device.

## Root cause 2: "device-missing"

That log is written only when `window.speechSynthesis` doesn't exist. It is not logged when `pickWarmVoice()` finds no voice, and it has nothing to do with the audio player. So on this phone the app's built-in screen has no speech feature at all. Chimes and music use a different, ordinary sound feature, which is why they still play.

I can't reproduce this part here, because desktop browsers always include the speech feature. What the log shows for certain: on this device the fallback voice has never been able to work.

## Root cause 3: was this caused by the timeout change?

No. Before that change the line was `const result = await speakText(...)` followed by the same `result.status` check, so it would have crashed the same way. The fault started when phone-app server calls began going through the allowed-origin list (the account-deletion fix). The timeout change only added the log that finally showed it.

## Proposed fix (needs your approval: fix 1 changes the server's allowed-origin list)

1. **Server, needs a publish only:** in `nativeCorsMiddleware` (`src/start.ts`), add one header to replies for the phone app:
   `access-control-expose-headers: x-tss-serialized, x-tss-raw, content-type`
   Nothing else changes: same allowed addresses, same methods, same checks. The fix reaches existing builds as soon as it's published.
2. **App, needs a Codemagic build:** in `fetchAndStore`, check that the reply has the expected shape before reading `.status`. Anything unexpected is logged as `hannah-failed — unexpected reply`, falls back cleanly, and never crashes.
3. **Device voice (needs a separate decision):** the phone's built-in screen has no speech feature, so the fallback needs a small on-device speech plugin, `@capacitor-community/text-to-speech`, which uses Apple's own voice. It makes no network calls and adds no tracking. It is still a new component, and your rules require approving each one. It would also need a Codemagic build. If you'd rather not add it, the fallback stays silent on these phones, but once fix 1 is live, Hannah will cover every recorded line.

## Verification after approval
- Repeat the browser test from the phone-app address and confirm the marker header is now readable and the reply decodes into `{ status: "ok", audio }`.
- Check that the website still behaves the same.
- Run a malformed reply through the app code and confirm it's logged and falls back without crashing.
- No changes to game rules, scoring, sign-in, payments, the grown-up check, Premium or recordings.

## Files
- `src/start.ts` (one header added)
- `src/lib/speech.ts` (reply-shape check)
- If approved: `package.json`, `bun.lock` and a small change in `src/lib/speech.ts` for the on-device voice plugin.
