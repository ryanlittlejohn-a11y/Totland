# Totland on the Apple App Store (and Google Play)

Goal: ship Totland as a real installable app on iPhone/iPad and Android, with the screens bundled inside the app and Apple's own in-app purchase for Premium.

## What you'll get

- A native app project (iOS + Android) that wraps the existing Totland experience, with all screens shipped inside the app so it opens instantly and works offline for premium families.
- Apple in-app purchase (and Google Play billing) for Totland Premium at the same $2.99/month and $19.99/year, alongside the existing website checkout.
- Premium unlocked from a verified store receipt, tied to the family account, so a parent who buys on iPhone also has premium on the website.
- App icons, splash screen, kid-safe settings (no external links for kids, parental gate kept in front of the grown-up area), and store listing material.
- A cloud build setup so you can build and submit without owning a Mac.

## Key decisions already made

- Screens bundled in the app (not a web wrapper) — better for Apple review and offline play.
- Apple in-app purchase set up now.
- iOS and Android both.
- You have a developer account but no Mac, so builds run on a cloud macOS service.

## Plan

### 1. Make the app buildable as a bundled app
Add a second build output that produces a plain, self-contained version of Totland (no server rendering) for packaging. The live website keeps working exactly as today.

### 2. Talk to the backend over the network
Inside the packaged app there is no local server, so the pieces that need one — Hannah's voice, subscription checks, child profile sync — will call your live Totland backend over the internet using a fixed address, with permission rules added so only your app can call it.

### 3. Add the native shell
Add Capacitor with iOS and Android projects, app id (e.g. `app.totland.kids`), app name, icons, splash screen, portrait/landscape support for iPad, status bar and safe-area handling, and hardware back-button behaviour on Android.

### 4. Store purchases
Add store subscriptions through RevenueCat, which handles Apple and Google receipts and validation:
- Two products: monthly $2.99 and yearly $19.99, created in App Store Connect and Google Play.
- A "Restore purchases" button (Apple requires it).
- Store receipts verified server-side and written to the same subscription records used today, so premium works the same everywhere.
- On iPhone/iPad the Paddle checkout is hidden; on the website nothing changes.

### 5. Kids-category compliance
Parental gate stays in front of purchases and any outside link; no ads or tracking; privacy, terms and refund pages linked in-app; store listing marked for the Kids category with the required age band and privacy questionnaire answers prepared.

### 6. Cloud builds and submission
Set up a cloud macOS build service (Codemagic or Ionic Appflow) with a config file in the repo, so you can produce signed builds and upload to TestFlight and Google Play without a Mac. I'll write step-by-step instructions for certificates, App Store Connect setup, and first submission.

## What I need from you along the way

- Apple Developer account access to create the app record and the two subscription products (you do this in App Store Connect; I'll give exact steps).
- A Google Play developer account ($25 one-time) if you want Android live too.
- A RevenueCat account (free at your volume) and its API keys.
- A cloud build account (Codemagic free tier is enough to start).

## Technical notes

- Build: add a static/SPA build target for the Capacitor `webDir`; keep the existing Nitro/Cloudflare build for the web deployment.
- Networking: server functions are same-origin today. For the packaged app, route the required calls (`tts.functions.ts`, `subscription.functions.ts`, `children.functions.ts`) through explicit HTTP endpoints under `src/routes/api/` with bearer auth and a CORS allow-list for `capacitor://localhost` and `https://localhost`, and a build-time base URL pointing at the published site.
- Purchases: `@revenuecat/purchases-capacitor` client, RevenueCat webhook into a new `/api/public/rc/webhook` route writing to the existing `subscriptions` table with a `source` of `apple`/`google`; entitlement sync unchanged.
- Service worker/PWA stays for the website; inside Capacitor the SW registration is skipped since assets are local.
- Offline gating logic (`OfflineGate`, `useEntitlementSync`) reused as-is.
- Capacitor config, `ios/`, `android/`, and a `codemagic.yaml` are added to the repo; `bun run build:app && bunx cap sync` becomes the packaging step.

## Out of scope for this pass

- Actual Xcode signing/upload (needs your Apple account credentials in the build service).
- App Store review outcome and any changes reviewers request.
