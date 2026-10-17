# Android: target API 36 for Google Play

## What I found
- Android project currently: compileSdk 35, targetSdk 35, minSdk 24.
- Build tools: Android Gradle Plugin 8.7.2, Gradle 8.11.1, Capacitor 7.6.9 (core, android, cli all match).
- AGP 8.7.2 only officially supports up to API 35. Building against 36 needs AGP 8.9.1 or newer. AGP 8.9.x runs on Gradle 8.11.1, so the Gradle wrapper can stay.
- Capacitor 7 defaults to 35 but reads the numbers from our project settings, so it builds against 36 without upgrading to Capacitor 8. A Capacitor 8 upgrade is a bigger change touching every plugin — not needed now.

## Changes
1. `android/variables.gradle`: compileSdkVersion 36, targetSdkVersion 36. Bump androidx core/activity/webkit only if the build needs it.
2. `android/build.gradle`: AGP 8.7.2 -> 8.9.1 (or the latest 8.9.x/8.10.x compatible with Gradle 8.11.1).
3. Leave Gradle wrapper, minSdk 24, signing, versionCode, iOS, gate and subscriptions untouched.

## Edge-to-edge under API 36
- On API 36 Android removes the opt-out switch apps used to dodge edge-to-edge. We never relied on that switch: the app uses Capacitor's `adjustMarginsForEdgeToEdge: "force"`, which pads the screen away from the status and nav bars on every version. I'll confirm no theme file sets the old opt-out (it would be ignored and is misleading) and that the setting still applies.
- Also check the back button: API 36 enables predictive back by default only if the app opts in; we don't, so the existing back handling stays in charge. I'll confirm the manifest doesn't opt in.

## Verification
- Run the full test suite (`bunx vitest run`, currently 55) and typecheck.
- Actually compile the Android app: install a JDK 21 and Android SDK (platform 36, build-tools 36) in the sandbox temporarily, run `cap sync android`, then `./gradlew bundleRelease` unsigned (no keystore here) and confirm it produces an AAB with targetSdk 36 (checked with bundletool/aapt).
- If the sandbox can't download the Android SDK, I'll say so plainly and the Codemagic build becomes the compile check.

## After
Ryan reruns "Totland Android" in Codemagic and re-uploads the new AAB.
