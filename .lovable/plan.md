# Fix the launch hydration mismatch and remove the diagnostic box

## What is causing the #418 error

The phone app's start page is pre-built on a computer where it is "not native", so it contains the real home screen. On the phone, `StorageBoot` starts with `useState(() => !isNativeApp())`, so its very first render is the loading fox instead. React compares the two, they differ, it throws #418, discards the pre-built page and redraws from scratch. That is the flash on every launch.

## Fix (root cause, no warning suppression)

1. **Same first render everywhere.** `StorageBoot` will start "ready" on both the pre-build and the phone, so the phone's first render matches the pre-built page exactly and React keeps it.
2. **Wait for phone storage after that first render, not instead of it.** Right after mounting, on native only, it loads phone storage (same 4.5 s safety timer as today). While that runs, the native splash screen stays up, so the child never sees default data. Splash hiding moves from "app started" to "storage settled" (still capped at 5 s so it can never stick).
3. **Refresh once storage lands.** When native storage finishes loading, screens that read the profile re-read it (a small "storage loaded" notification that the profile hook listens to; the profile hook already re-reads after mounting, so this is one extra re-read, not a new system).
4. **Other render-time native checks.** Only the start page is pre-built for the phone, and no other first-render code on it branches on "native". The subscription page reads "native" during render but is never pre-built, so it can't mismatch; left unchanged.

## Remove the diagnostic overlay

- Delete `src/lib/diag-overlay.ts`.
- Remove its inline head script and `diagStep` call from `src/routes/__root.tsx`.
- Remove `diagStep`/`diagRendered` calls and the `FirstRenderMark` helper from `StorageBoot.tsx`, `storage.ts`, `OfflineGate.tsx`, `crash-report.ts`.
- Keep the useful hardening from that work: storage timeouts, web-storage fallback, plugin-ready check, safety timer, and the existing crash reporter (`/api/public/diag` endpoint stays; it predates the overlay).

## Untouched

Parental gate, Paddle, RevenueCat, Premium rules, OfflineGate rules, stored data format, website behaviour (on the web storage is ready immediately, so nothing changes).

## Verification

- Typecheck and build; `bun run build:app` confirms the boot script is gone from `dist-app/index.html`.
- Playwright with a fake native `window.Capacitor` (slow and stuck Preferences): no #418 / hydration error in the console, the pre-built page is kept (no remount), saved profile data appears after storage loads, and the app still shows within the safety window when storage hangs.
- Website check: home page loads with no console errors, identical to today.

## Files

`src/components/StorageBoot.tsx`, `src/lib/storage.ts`, `src/lib/profile.ts`, `src/lib/native-shell.ts`, `src/routes/__root.tsx`, `src/components/OfflineGate.tsx`, `src/lib/crash-report.ts`, `src/lib/diag-overlay.ts` (deleted), `roadmap.md`.

## Outside steps

Run `bun run sync:app`, then a new Codemagic build.
