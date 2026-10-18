# Google Play Android vitals: shrinking and edge-to-edge (findings and fix plan)

Read-only investigation. Nothing has been changed.

## Findings

### 1. Code shrinking / obfuscation: confirmed off
- The release build has `minifyEnabled false` (android/app/build.gradle). No R8 shrinking or obfuscation runs, so there is no deobfuscation (mapping) file to upload. That explains the earlier deferred warning too.
- The app's own Android code is a single empty MainActivity. Almost everything is the web game bundle, which R8 never touches. Size savings come only from the native libraries (Capacitor, AndroidX, RevenueCat, plugins), typically a few MB. The games and audio don't shrink.
- **Risk:** Capacitor finds plugins by reflection. Capacitor core ships its own keep-rules, which cover all plugins and the web bridge. RevenueCat publishes keep-rules inside its library. Not yet confirmed: the exact rules bundled with the installed RevenueCat Android version. The real compile and a device purchase/restore test would confirm it.
- **Build time:** adds roughly 30–90 seconds to a Codemagic release build. Debug builds are unaffected.

### 2. Edge-to-edge: only half done
Both layers exist, but they are not aligned:
- **Web layer (done):** safe-area padding in styles.css, plus `adjustMarginsForEdgeToEdge: "force"` in capacitor.config.ts. That setting makes Capacitor shrink the web view inside the system bars using the modern insets API, so content is never hidden under the bars. This is what the readiness batch did, and why the app looks right.
- **Native shell (never done):** MainActivity is Capacitor's empty default (`class MainActivity extends BridgeActivity {}`). It never calls `EdgeToEdge.enable()`, and styles.xml has no edge-to-edge setup. Play's check looks for exactly that call, so the warning is accurate: the shell relies on Android 15 forcing edge-to-edge instead of opting in. Older Android versions (7–14) get no edge-to-edge at all.

### 3. Deprecated APIs: coming from plugins, not our code
Our code makes none of these calls. They come from two installed Capacitor 7 plugins:
- **Status bar plugin:** because the config sets `StatusBar.backgroundColor`, the plugin calls `window.setStatusBarColor()` at launch. That call is deprecated and does nothing on Android 15+. It also contains `setSystemUiVisibility` for its overlay feature, which we don't use.
- **Splash screen plugin:** contains `SYSTEM_UI_FLAG_*` / `setSystemUiVisibility` in its immersive mode. We have that mode off, but Play scans the code, not runtime use.
- Play reports these by scanning the code inside the app, so removing our config value stops the runtime call but won't make the warning disappear. Fully clearing it needs plugin versions that drop these APIs (the Capacitor 8 line), which is a larger, separate upgrade.

## Proposed fixes

**A. Turn on R8 for release (small effort, low-to-medium risk).**
- Set `minifyEnabled true` and `shrinkResources true` for release, and use `proguard-android-optimize.txt`.
- Add a short safety keep-list in proguard-rules.pro for Capacitor plugin classes, the web bridge (`@JavascriptInterface`) and RevenueCat models. These are a backstop if the bundled rules turn out to be incomplete.
- Keep the mapping file as a Codemagic artifact, so you can upload the deobfuscation file and crash reports become readable. Optional: automatic upload to Play.
- Prove it compiles here with a real release build (the sandbox has the Android SDK). Then you install it from internal testing and check: launch, a game, music, narration, the grown-up gate, subscribe screen loads prices, restore, back button.

**B. Opt into edge-to-edge in the native shell (small effort, low risk).**
- MainActivity: override `onCreate` and call `EdgeToEdge.enable(this)` (AndroidX Activity 1.9.2 is already installed) before `super.onCreate`.
- styles.xml: give the app theme a cream window background (#fff7ed) so the area behind the transparent bars matches the app. Set the bar icons dark to suit the light background.
- Keep `adjustMarginsForEdgeToEdge: "force"` and the CSS safe-area padding as they are. Content positioning stays exactly as today, now on Android 7–14 too.
- Remove `StatusBar.backgroundColor` from the config so the deprecated colour call no longer runs. Keep the dark-icon style call.
- iOS is untouched: the config value removed is Android-only in effect, and iOS uses its own content inset.

**C. Deprecated-API warning: accept for now, track.**
- After B, our app makes no deprecated calls at runtime. The remaining warning comes from library code. Upgrading to Capacitor 8 (which has its own system-bars handling) would clear it. That is a medium-sized job touching every plugin, iOS included, so I recommend scoping it separately before the Feb 2027 deadline rather than bundling it here.

## What stays the same
iOS, gate, purchases/subscriptions code, pricing, free/Premium split, signing, version numbering, back-button behaviour.

## Verification
- Real release compile in the sandbox (minified), confirming the mapping file is produced.
- Existing tests (69) plus the Android back-button tests.
- Not verifiable here: how the bars look on a real device and purchase/restore under R8. Ryan checks these from an internal-testing build.

## Effort
A + B: about 1–2 hours including the compile check. C: a separate scoping task.
