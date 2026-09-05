# Mobile App Plan for Totland

## Goal
Give Totland a working mobile presence that feels like a native app, starting with the lowest-budget option and leaving the door open to App Store / Play Store publishing later.

## What we know
- You want a wrapped/native-style mobile app, but you are not sure yet about publishing to the App Store / Play Store.
- Budget is low.
- Offline requirement: learning games and child profile must work without internet.
- The app is already a responsive TanStack Start web app with a parent subscription flow.

## Recommended path: two phases

### Phase 1 — Installable web app (PWA) — do this first
A Progressive Web App lets families tap "Add to Home Screen" in Safari/Chrome and launch Totland like a regular app. It is the fastest, lowest-cost way to get a "mobile app" today.

What we will build:
1. Add a web app manifest (`public/manifest.webmanifest`) with app name, icons, theme colors, and `display: standalone`.
2. Generate app icons in the required sizes (192×192, 512×512, Apple touch icon, maskable icon).
3. Add `<head>` tags for the manifest, theme color, Apple touch icon, and viewport status-bar styling.
4. Add an offline-capable service worker so the learning games and child profile work without a network connection. Use `vite-plugin-pwa` with a guarded registration that only runs in production and never in the Lovable preview.
5. Add a gentle in-app "Add to Home Screen" hint on the home page (only on supported browsers).
6. Verify the install flow on iOS Safari and Android Chrome.

Cost/time: Low. No store fees or review.

### Phase 2 — Wrapped native app with Capacitor — optional, decide later
If you later choose to publish on the App Store / Play Store, we can wrap the existing web app in Capacitor. This reuses all current code and adds a thin native shell.

What we will do when you are ready:
1. Install Capacitor core and the iOS/Android platforms.
2. Configure `capacitor.config.ts` with the live production URL and app metadata.
3. Build the web app and sync assets into the native projects.
4. Add any required native permissions or splash screens.
5. Build and test locally with Xcode / Android Studio.
6. Prepare store listings, screenshots, and privacy details.

Cost/time: Medium. Requires Apple Developer Program ($99/yr) and Google Play Console ($25 one-time), plus store review time.

## Out of scope for now
- Fully native rewrite (Swift/Kotlin) — too expensive and unnecessary for the current feature set.
- App Store / Play Store publishing in this plan — only if you confirm you want Phase 2.

## Testing plan
1. Publish the updated site.
2. On an iPhone/iPad, open the live URL in Safari, tap Share → "Add to Home Screen", launch from the icon, and verify:
   - It opens full-screen without browser chrome.
   - Learning games load and play.
   - Child profile/stars persist.
   - Airplane mode still allows offline games.
3. On Android Chrome, tap the menu "Add to Home Screen" and repeat the checks.
4. Use the test card `4242 4242 4242 4242` on the subscription page to confirm premium still unlocks after email verification.

## Decision needed from you
Do you want to proceed with Phase 1 (installable PWA) now, or do you want to skip straight to Phase 2 (Capacitor native wrap and store publishing)?
