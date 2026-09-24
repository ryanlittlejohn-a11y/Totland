# Fix the blank screen in the TestFlight app

## Best diagnosis (before any fix)

Most likely cause: **the app waits for native storage before showing anything, with no time limit.**

- `StorageBoot` (wraps every screen in `__root.tsx`) renders nothing until `hydrateStorage()` finishes on native.
- `hydrateStorage()` makes 3-5 sequential Capacitor Preferences calls (get migrated flag, get each key, possibly set) with no timeout. If any one never answers (the bridge not ready yet, or the plugin not registered in this build), the promise never settles, `finally` never fires, and the screen stays empty forever. The `catch` only helps if the call *fails*; a *hang* is not caught.
- The blank "gradient" is exactly what you would see: the page background from the stylesheet is painted, but no content.
- Secondary contributor: the prerendered shell was built with "not native" (content visible), then on the phone the first client render is "not ready" (empty). That mismatch makes React throw away the shell and re-render from scratch, so nothing survives from the prerender.

Checked and less likely (all run *after* the first screen, so they cannot block it):
- RevenueCat configure, splash hide, status bar, deep links, Network plugin, PWA registration, crash reporting — all inside effects, fire-and-forget.
- High-contrast / reduced-motion attributes — set in effects from the profile, no plugin calls.
- One real side risk: splash hide runs from the root effect, which is fine, but if the JS bundle itself failed to load we would see the splash then blank — the overlay below will tell us which case it is.

## Part 1: Temporary on-device diagnostic overlay

Single flag: `DIAG_OVERLAY = true` in a new `src/lib/diag-overlay.ts`, native-only (never on the website). Removal = set to false or delete the file and its one import.

1. **Inline boot script** in the root `<head>` (native-guarded by `window.Capacitor`): installs `error` / `unhandledrejection` handlers *before* the app bundle loads, and writes any error (message + first stack lines) into a fixed, high-contrast box on screen. This catches bundle-load failures that React never sees.
2. **Step tracker**: `diagStep("name")` records the current init step (e.g. `bundle loaded`, `root mounted`, `storage: get migrated`, `storage: get totland.family.v1`, `storage done`, `first screen rendered`) on `window.__totlandDiag`.
3. **Watchdog**: if `first screen rendered` has not been marked within 5 s, show "Still loading... last step: X", elapsed time, platform, Capacitor present yes/no, plugin list, and URL.
4. Overlay has a small "Hide" button and stays out of normal use once the first screen appears (unless an error occurs).

## Part 2: Stop init from ever blocking the screen

1. **Timeout on storage hydration**: wrap each Preferences call in a 3 s timeout, and the whole `hydrateStorage()` in a 4 s cap. On timeout: stay on web storage (localStorage, which already holds a copy of every write), log it via the existing crash reporter, and render the app. No progress is lost — nothing is deleted.
2. **Wait for the bridge** before the first plugin call: only proceed once `window.Capacitor` reports native and the Preferences plugin is available; otherwise fall back immediately.
3. **StorageBoot safety net**: independent 4 s timer that forces `ready = true` even if the promise never settles; show the existing app background with a simple loading mark instead of nothing while waiting.
4. **Fix the hydration mismatch**: StorageBoot starts in the same state on server and client, then switches after mount, so the shell is not discarded.
5. **Timeouts on post-render native calls** (RevenueCat configure, splash hide, network check): 5 s caps so a hang there can never leave the splash up or premium stuck; on timeout, default to non-premium unless the on-device entitlement already says premium.

Unchanged: website behaviour, parental gate, premium/Paddle/RevenueCat logic, OfflineGate rules, stored data format.

## Technical details

Files:
- new `src/lib/diag-overlay.ts` (flag, step tracker, watchdog, overlay)
- `src/routes/__root.tsx` (inline head boot script, `diagStep` calls, mark first render)
- `src/lib/storage.ts` (`withTimeout` helper, bridge check, capped hydration)
- `src/components/StorageBoot.tsx` (safety timer, mismatch-free initial state)
- `src/lib/native-shell.ts`, `src/lib/purchases.ts` call sites / `src/hooks/useEntitlementSync.ts` (timeouts)
- `roadmap.md` (task + "remove diagnostic overlay" follow-up)

Verification: typecheck, build, `bun run build:app` to confirm the head script lands in `dist-app/index.html`; Playwright with a fake `window.Capacitor` whose Preferences never resolves, confirming the app appears within ~4 s and the overlay shows the stuck step.

Outside Lovable: run `bun run sync:app` and a new Codemagic build; on the phone, a blank screen should now show either the app or a readable message — send a screenshot of whatever appears.
