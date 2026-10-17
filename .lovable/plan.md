# Totland on Google Play: scope and order of work

Findings come from reading the project. Nothing has been changed.

## 1. Android project: already there, but never built
- An `android/` folder already exists: app id `app.totland.kids`, a deep-link scheme matching iPhone, internet permission, and the default Capacitor icon and splash folders.
- It has never been built or tested. The plugin list in the Android build file is out of date: it lists app, splash, status bar and RevenueCat, but not browser, network or preferences, which the app uses. Running `cap sync android` fixes this.
- `versionCode` is fixed at 1. The build needs to raise it automatically, the same way iPhone build numbers work.
- **Shared code (about 95%):** every game, story, word find, narration (Hannah/Lucy), music, i18n/Spanish, parental gate, offline Premium, family sync, account deletion and entitlement checks. All of it is web code inside the shell.
- **Already handles Android:** `purchases.ts` reads an Android RevenueCat key. The subscription screens say "Google Play" on Android. The back button is wired: back, or exit at the home screen. Store-purchase records already mark Google purchases as `google`.
- **iPhone-only, needs an Android equivalent or a decision:**
  - The `ios/AppClip` (no Android equivalent needed; Play Instant is not worth it).
  - `PrivacyInfo.xcprivacy` (on Android, Play Console's Data safety form does this job).
  - The "Continue with Apple" button on the sign-in card. It can stay; it works through the browser sheet on Android. Google sign-in and email already exist.
  - App icon: Android needs adaptive icon layers (foreground and background) made from the Totland icon. The current ones are Capacitor placeholders.

## 2. RevenueCat and Google Play
- One RevenueCat project supports both stores. You add a "Play Store" app in the same project, upload a Google service-account key, and get a separate Android key (`goog_...`).
- Products must be created again in Play Console. Apple products don't carry over. Use the same ids (`totland_premium_monthly`, `totland_premium_yearly`), each as a subscription with a base plan. Attach them to the same `premium` entitlement and the same offering in RevenueCat.
- The app code already handles Play's `product:baseplan` id format.
- Code changes needed: just one. Add `VITE_REVENUECAT_ANDROID_KEY` to the production settings. The key is publishable, the same as the iOS one.
- Point Google's real-time notifications at RevenueCat (Pub/Sub topic in Play Console). The existing webhook to our backend already handles Play events.
- To test, upload the app to Play's internal testing track and add license testers.

## 3. Google Play Families policy: gaps compared with Apple
Already meets the policy: no ads or ad SDKs, no tracking or analytics SDKs, parental gate before purchases and outside links, account deletion inside the app, and a privacy policy.

Google-specific items still to do:
- **Account deletion web link:** Play requires a public web page or URL where people can ask to delete their account without installing the app. The Data safety form asks for this link. Today deletion only happens inside the app, so this needs a small public page or a section on the privacy page.
- **Data safety form:** this is required. Answers are drafted from the Apple privacy answers: email (optional, for the grown-up account), purchase history, crash diagnostics (the app's own crash report), all encrypted in transit, and deletion available.
- **Target audience and content:** the Families form must list ages 5 and under, plus 6–8 if we include age 6. You also need the IARC content rating questionnaire, and confirmation that every SDK is on Google's Families self-certified list. RevenueCat is fine; there are no other SDKs.
- **Sign-in must stay optional for children:** already true. Play play is anonymous.
- **Teacher Approved:** Google chooses apps for this; there is no application. Nothing to build.
- Google forbids collecting precise location and device IDs from children. We collect neither.
- To check: the crash reporter must not send any advertising or device ID.

## 4. Codemagic
- An `android` workflow already exists. It builds an AAB, signs it with `totland_keystore`, and uploads to the internal track using the `google_play` group.
- Missing pieces:
  - An automatic `versionCode` increase.
  - Signing configuration in `build.gradle` that reads Codemagic's keystore variables. Without it, `bundleRelease` comes out unsigned.
  - The Android RevenueCat key in the build.
  - The first upload is done by hand: Play requires the first AAB to be uploaded manually in Play Console before the API can publish.
- **Keystore:** upload it in Codemagic, under Team settings, Code signing identities, Android keystores. Name it exactly `totland_keystore` and enter the keystore password, key alias and key password. Never put it in the project.
  - Keep a secure offline backup.
  - Turn on Play App Signing. Google then holds the real app signing key, and the keystore you made becomes the "upload key", which can be replaced if lost.
- **Service account:** create a Google Cloud service account with Play Console access. Put its JSON in a Codemagic group named `google_play` as `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`. The same key can go into RevenueCat.

## 5. Android behaviour differences
- **Back button:** handled. One thing to check: during a game, back should go back a screen, not exit the app. A back press while the parental gate is open should close the gate.
- **Status bar and edge-to-edge:** Android 15 (target SDK 35) draws behind the status and navigation bars. The safe-area padding must be checked on a real device, and the bottom gesture bar may cover buttons.
- **Splash:** Android 12+ always shows the system splash with the app icon. The background colour `#fff7ed` already matches.
- **Deep links:** the `app.totland.kids://` scheme is already in the manifest. Sign-in return and the premium links will work as on iPhone. `launchMode=singleTask` is correct.
- **Audio:** Android WebView sometimes blocks autoplay. The existing "start music on first tap" should cover this; check on a device.
- **Share sheet:** the app doesn't use one. Nothing needed.
- **AAB vs APK:** Play requires AAB, and the workflow already builds one.
- **Older phones:** minSdk 23 (Android 6). Fine.

## 6. Store listing assets
Can be reused: app name, short and full description (Play's short description has an 80-character limit; full is up to 4000), privacy, terms and support links, and the Spanish listing text.

Must be made for Play:
- Hi-res icon: 512x512 PNG with no rounded corners added.
- Adaptive app icon layers inside the app.
- Feature graphic: 1024x500. Required, no iOS equivalent.
- Phone screenshots: 2–8, between 16:9 and 9:16. Can be cut from the iOS ones, but they must not show the iPhone frame or say "App Store".
- 7" and 10" tablet screenshots: optional, but needed to show up as a tablet app.
- Preview video: optional, YouTube link only.

## Recommended order
1. **Ryan, in Play Console:** create the app, accept Families policy, set the target audience, do the content rating, and turn on Play App Signing.
2. **Ryan, in Codemagic:** upload the keystore as `totland_keystore`. Create the service account and the `google_play` group.
3. **Build (me):** signing config, automatic version code, refreshed plugin list, adaptive icons, and the Android RevenueCat key setting. Also an edge-to-edge and back-button check.
4. **Build (me):** a public "delete your account" page for Play's Data safety link. This is a new page; it doesn't change how deletion works inside the app.
5. **First signed AAB from Codemagic:** Ryan uploads it by hand to Internal testing.
6. **Ryan, in Play Console:** create the monthly and yearly subscriptions using the same ids and prices. Then in RevenueCat: add the Play app, link the products to `premium`, and connect real-time notifications. Send me the `goog_` key.
7. **On a real Android phone:** test purchase, restore, gate, back button, music and Spanish.
8. **Play Console:** Data safety, store listing, assets, then closed testing. New personal developer accounts must run 12 testers for 14 days before going live. Check whether this applies to Ryan's account type.
9. Submit for production review.

## Approvals needed
Steps 3 and 6 touch payment and subscription setup: a new store key, and Play products added to existing entitlements. In-app purchase behaviour does not change. The gate, sign-in and deletion flow are not changed.
