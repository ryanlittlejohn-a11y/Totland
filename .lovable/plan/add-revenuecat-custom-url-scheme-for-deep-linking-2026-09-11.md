# Add RevenueCat custom URL scheme for deep linking

RevenueCat win-back links, promotional offers, and some attribution flows need a custom URL scheme that opens the app. We will register `app.totland.kids://` on iOS and Android and route incoming links to the subscription/premium screen.

## What will change

1. **iOS URL scheme**
   - Add `CFBundleURLTypes` to `ios/App/App/Info.plist` with scheme `app.totland.kids`.

2. **Android URL scheme**
   - Add an `<intent-filter>` to `android/app/src/main/AndroidManifest.xml` for `app.totland.kids://`.

3. **Capacitor deep-link handling**
   - In the native shell startup (`src/lib/native-shell.ts` or a new `src/lib/deep-links.ts`), listen to the Capacitor `App` plugin’s `appUrlOpen` event.
   - Parse the path/host and navigate to `/parent/subscription` for links like `app.totland.kids://premium` or `app.totland.kids://subscription`.
   - Unknown paths fall back to the home screen.

4. **RevenueCat configuration note**
   - Document the scheme in `MOBILE.md` so it can be entered in RevenueCat → Project Settings → Custom URL Scheme / Win-back Links.

5. **Sync native projects**
   - Run `bun run build:app` and `bunx cap sync` so the plist and manifest changes are copied into the generated iOS/Android projects.
   - Verify `git status` stays clean of generated build artifacts.

## Out of scope

- Universal links / associated domains (HTTPS deep links) are not part of this change.
- No backend or webhook changes are needed.

## Testing in the preview

- Custom URL schemes only work inside the installed iOS/Android app; browsers cannot test them.
- After the change, validate by:
  1. Confirming `Info.plist` contains `CFBundleURLTypes` and `AndroidManifest.xml` contains the new intent filter after `bunx cap sync`.
  2. Building the app and using a test link like `app.totland.kids://premium` from Safari/Notes on a device/simulator — it should open Totland and land on the subscription screen.
