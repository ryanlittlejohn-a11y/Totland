# iOS TestFlight build checklist

This is the iOS-only path to a TestFlight build. Android stays blocked until you purchase the Google Play developer account.

## Stage 1 — RevenueCat iOS setup (user dashboard work)

1. In your RevenueCat Totland project, confirm the iOS app exists with bundle ID `app.totland.kids` and public key `appl_HsZozLYeDxkkUyvOYIOgbtRrVvo`.
2. Confirm one entitlement named `premium` exists.
3. Create two products and attach both to the `premium` entitlement:
   - `totland_premium_monthly` — $2.99 / month
   - `totland_premium_yearly` — $19.99 / year
4. Add the webhook endpoint:
   - URL: `https://totland.lovable.app/api/public/rc/webhook`
   - Authorization header value: the same `REVENUECAT_WEBHOOK_SECRET` already saved in Lovable
5. Send RevenueCat's test event and confirm it returns HTTP 200.

## Stage 2 — App Store Connect app record (user dashboard work)

1. Sign in to App Store Connect.
2. Create a new iOS app:
   - Name: Totland
   - Bundle ID: `app.totland.kids`
   - SKU: something unique, e.g. `totland-kids-2026`
   - Primary category: Kids (ages 5 and under / 6–8)
3. Do not submit for review yet — the goal is just the record so TestFlight can receive the build.

## Stage 3 — Codemagic environment (user dashboard work)

1. Open the Totland app in Codemagic → Environment variables.
2. Create or update the `totland` group (mark secure):
   - `VITE_NATIVE_API_ORIGIN` = `https://totland.lovable.app`
   - `VITE_REVENUECAT_IOS_KEY` = `appl_HsZozLYeDxkkUyvOYIOgbtRrVvo`
   - `VITE_REVENUECAT_ANDROID_KEY` = leave blank for now
3. Create or update the `appstore` group (mark secure):
   - `APP_STORE_CONNECT_ISSUER_ID`
   - `APP_STORE_CONNECT_KEY_IDENTIFIER`
   - `APP_STORE_CONNECT_PRIVATE_KEY`
   - `CERTIFICATE_PRIVATE_KEY` (Codemagic can generate this under Code signing identities)
4. Under Code signing identities, add an iOS App Store distribution certificate and matching provisioning profile for `app.totland.kids`, or let Codemagic's `app-store-connect fetch-signing-files` create them during the first build.

## Stage 4 — Run the iOS workflow

1. In Codemagic, start the **Totland iOS** workflow.
2. It will install dependencies, run `bun run build:app`, sync Capacitor, fetch signing files, install pods, build the `.ipa`, and upload to TestFlight.
3. If the build fails, paste the relevant log lines and I will fix the config.

## Stage 5 — TestFlight validation

1. Once the build appears in App Store Connect → TestFlight, add yourself as an internal tester.
2. Install on an iPhone/iPad and verify:
   - Sign-in works (email, Google, or Apple)
   - A child game loads and Hannah's voice plays
   - Background music plays on menu/activity/story screens
   - The parent subscription screen shows the two Apple prices
   - A test purchase completes and premium unlocks
3. Report any issues and I will adjust the code.

## What I will do

- Nothing in the repo is required to start — the bundle builds and syncs cleanly today.
- I will fix any Codemagic build failures that appear in the logs.
- I will fix any runtime issues found during TestFlight testing.

## Notes

- The app uses bundle ID `app.totland.kids` everywhere (Capacitor config, codemagic.yaml, Info.plist).
- Store product IDs must exactly match `totland_premium_monthly` and `totland_premium_yearly`.
- The RevenueCat webhook is the only writer of premium entitlement for store purchases; the shared secret must match what is saved in Lovable.
