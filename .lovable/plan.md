# Getting Totland built by Codemagic and submitted to the stores

Your repo is already connected to Codemagic and the build recipe (`codemagic.yaml`) is in place. What's missing is account-side setup: RevenueCat keys, an Android signing key, and a Google Play account. Since you have neither RevenueCat keys nor Android accounts yet, the fastest path is: **iOS first, Android right after.**

## Stage 1 — RevenueCat (needed before any build)

1. Create a free account at revenuecat.com and add a project called Totland.
2. Add an **App Store** app with bundle ID `app.totland.kids`. Copy the public key that starts with `appl_`.
3. Create an entitlement called `premium`.
4. In App Store Connect, create the two subscriptions `totland_premium_monthly` ($2.99/month) and `totland_premium_yearly` ($19.99/year), then attach both to the `premium` entitlement in RevenueCat.
5. In RevenueCat, add a webhook pointing at `https://totland.lovable.app/api/public/rc/webhook` with the authorization value you already saved in Totland's secrets.

## Stage 2 — Codemagic environment groups

In Codemagic, open the Totland app, then Environment variables, and create these groups exactly:

**`totland`**
- `VITE_NATIVE_API_ORIGIN` = `https://totland.lovable.app`
- `VITE_REVENUECAT_IOS_KEY` = your `appl_...` key
- `VITE_REVENUECAT_ANDROID_KEY` = your `goog_...` key (leave blank until Stage 4)

**`appstore`** — easiest via the App Store Connect integration you already added; it supplies `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY_IDENTIFIER`, `APP_STORE_CONNECT_PRIVATE_KEY`. Also add `CERTIFICATE_PRIVATE_KEY` (Codemagic can generate one for you under Code signing identities).

**`google_play`** — created in Stage 4.

Mark every group "secure".

## Stage 3 — Run the iOS build

1. In App Store Connect, create the app record for `app.totland.kids` (name Totland, Kids category, age band 5 and under / 6-8).
2. In Codemagic, start the **Totland iOS** workflow.
3. It installs dependencies, builds the packaged screens, signs, and uploads to TestFlight automatically.
4. Install from TestFlight on your iPhone/iPad and check: sign-in, a game, Hannah's voice, music, and the Premium purchase screen showing Apple's price sheet.

## Stage 4 — Android (after iOS is green)

1. Pay the one-time $25 Google Play developer fee and create the app `app.totland.kids`.
2. In Codemagic, go to Code signing identities, Android keystores, and use **Generate keystore** — name the reference `totland_keystore` (matches the build recipe, so nothing in the repo changes). Download and back up the file; losing it means you can never update the app.
3. In Google Play, create a service account with Play Developer API access and download its JSON. Add it to a Codemagic group `google_play` as `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`.
4. In RevenueCat, add the Play app, copy the `goog_...` key into the `totland` group, and create the same two products in Play.
5. Run the **Totland Android** workflow; it uploads an `.aab` to the internal test track.

## Stage 5 — Submit

- Apple: fill in the App Privacy questionnaire (no ads, no tracking), point privacy/terms at `https://totland.app/privacy` and `/terms`, add screenshots from the TestFlight build, submit for review.
- Google: complete the Families policy and Data safety forms the same way, promote the internal build to production.

## What I'll do in the project

Nothing needs changing to start — the app builds and syncs cleanly today. I'll stay on standby for:
- Build log failures from Codemagic (paste them and I'll fix the config).
- Any store-review feedback that needs code or wording changes.
- Screenshot generation for the store listings if you'd like me to produce them.

## Technical notes

- `codemagic.yaml` already defines both workflows; group names in it are `totland`, `appstore`, `google_play`, and the Android signing reference is `totland_keystore` — the names above must match exactly.
- Build steps are `bun install` -> `bun run build:app` -> `bunx cap sync` -> native build, which matches what runs cleanly here.
- The RevenueCat public keys are safe to store as plain build variables; only the webhook secret is sensitive and it already lives in Totland's backend secrets.
