# Fix the TestFlight app freezing after the first touch

## What the symptoms tell us

The floating shapes keep drifting while taps stop working, and sometimes the screen turns white. That combination is specific: the animations are drawn by the phone's graphics layer and keep going, while the part of the app that reacts to touches is completely tied up. A white screen is iOS shutting the app's web view down because it ran out of memory.

## The most likely cause

About four seconds after the app opens — right when a child makes that first touch — Totland quietly downloads Hannah's voice for roughly 120 common lines (every letter, number, colour, shape, word and praise line) so they work offline later. Each downloaded clip is then unpacked character by character on the same thread that handles touches, and every clip is kept in memory for the whole session and never released.

On a laptop that is barely noticeable. On an iPhone it is around 120 downloads, 120 slow unpacking passes and 120 audio clips held in memory at once, all starting at the same moment as the first tap. That matches both symptoms exactly. This is a strong diagnosis based on reading the code, not yet confirmed on a device, so the plan also adds reporting so we can see the real picture from your next TestFlight build.

## The fix

1. Stop the bulk voice download from running at launch in the packaged app. Hannah's lines are still saved as they are used, so offline play still builds up naturally.
2. When we do pre-save lines, do it gently: one at a time, in small batches, only while the app is idle, and never during the first moments after opening.
3. Unpack downloaded voice clips using the phone's built-in decoder instead of the slow character-by-character loop, so the touch handling thread is never held up.
4. Release voice clips from memory once they are saved to the device's cache, keeping only a small number of the most recent ones.
5. Make the white screen recover on its own: if iOS shuts the web view down, the app reloads itself instead of sitting blank.
6. Add quiet crash and freeze reporting so the next TestFlight build tells us what actually happened on your device, rather than us guessing.

## Technical details

- `src/lib/voice-prewarm.ts`: skip the launch prewarm when `isNativeApp()`; otherwise raise the delay, drop to concurrency 1, chunk the queue, and schedule via `requestIdleCallback` with a `setTimeout` fallback.
- `src/lib/speech.ts`: replace `atob` + `Uint8Array.from(..., cb)` with `await (await fetch('data:audio/mpeg;base64,' + audio)).blob()` so decoding happens off the main thread; bound the `memory` map (LRU, ~12 entries) and `URL.revokeObjectURL` on eviction; prewarm path writes to the Cache API without ever creating an object URL.
- `src/lib/native-bridge.ts`: wrap bridged requests in an `AbortController` timeout (~15s) so a stalled backend call cannot pile up pending work.
- `ios/App/App/AppDelegate.swift` (or a small `WKNavigationDelegate` extension on the Capacitor bridge view controller): implement `webViewWebContentProcessDidTerminate` to call `webView.reload()`, recovering the white screen.
- New `src/lib/crash-report.ts` wired in `src/routes/__root.tsx`: `window.onerror`, `unhandledrejection`, and a long-task observer posting to a new `src/routes/api/public/diag.ts` endpoint (rate-limited, no personal data), readable through the server logs.
- Verify with `bunx tsgo --noEmit`, `bun run build:app`, `bunx cap sync ios`, and a Playwright pass that measures main-thread blocking during the first ten seconds on `/`.
