# Finish RevenueCat + App Store launch setup

The code for native purchases is done and the webhook secret is now saved. What remains is account-side configuration that only you can do in the RevenueCat, Apple, and Google dashboards. This plan lists each step in order.

## Step 1 — Create your RevenueCat project (free tier)

1. Sign up at revenuecat.com and create a project named Totland.
2. Add an iOS app with bundle id `app.totland.kids` and an Android app with package id `app.totland.kids`.
3. Create one entitlement named `premium`.
4. Create two products and attach both to the `premium` entitlement:
   - `premium_monthly` — $2.99/month
   - `premium_yearly` — $19.99/year

## Step 2 — Create the products in the stores

- App Store Connect: create the two auto-renewable subscriptions (`premium_monthly`, `premium_yearly`) in a subscription group, then connect App Store Connect to RevenueCat with an App Store Server API key (RevenueCat's setup wizard walks you through it).
- Google Play Console: create the same two products and connect Play to RevenueCat with a service account (also guided in RevenueCat).

## Step 3 — Point RevenueCat webhooks at the app

1. In RevenueCat → Integrations → Webhooks, add endpoint:
   `https://totland.lovable.app/api/public/rc/webhook`
2. Paste the same webhook secret you just saved into RevenueCat's "Authorization header value" field.
3. Send RevenueCat's built-in test event — you should get a 200 OK, meaning verification works.

## Step 4 — Give me the RevenueCat public SDK key

- RevenueCat gives you a public "Apple app API key" and "Google app API key" (they start with `appl_` / `goog_`). These are publishable, safe to paste in chat. I'll wire them into the app's store screen.

## Step 5 — Cloud build and submission (Codemagic)

- Connect the repo to Codemagic (free tier), add your Apple signing certificate and App Store Connect API key.
- Produce a signed iOS build, upload to TestFlight, then submit for App Store review (Kids category, no ads/tracking, privacy pages already linked in-app).
- Repeat for Google Play when ready.

## What I'll do once you complete Steps 1–4

- Verify the test webhook wrote correctly and the premium unlock flows end-to-end in the preview.
- Add your RevenueCat public keys to the app and re-run the app build so the packaged app is ready for Codemagic.
