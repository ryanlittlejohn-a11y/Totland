# Totland on iPhone, iPad and Android

The website keeps working exactly as before. The phone and tablet app packages
the same screens inside a native shell (Capacitor) and talks to the live
Totland backend for sign-in, subscriptions, child progress and Hannah's voice.

## Build the app bundle

```bash
bun run build:app   # builds the packaged screens into dist-app/
bunx cap sync       # copies them into the iOS and Android projects
```

`bun run sync:app` does both in one step.

## Settings the app needs

Set these when building (Codemagic environment group `totland`):

| Name | What it is |
| --- | --- |
| `VITE_NATIVE_API_ORIGIN` | Where the app talks to. Defaults to `https://totland.lovable.app` |
| `VITE_REVENUECAT_IOS_KEY` | RevenueCat public key for Apple |
| `VITE_REVENUECAT_ANDROID_KEY` | RevenueCat public key for Google |

On the backend, add a secret `REVENUECAT_WEBHOOK_SECRET` and paste the same
value into RevenueCat's webhook settings, pointing at
`https://totland.lovable.app/api/public/rc/webhook`.

## Subscriptions

- On the website, families pay through Paddle (unchanged).
- Inside the iPhone/iPad/Android app, Apple and Google handle the payment, as
  their store rules require. RevenueCat tells our backend when a subscription
  starts, renews, or ends, so premium unlocks on every device the parent uses.
- Store product IDs to create: `totland_premium_monthly` ($2.99/month) and
  `totland_premium_yearly` ($19.99/year), both attached to the `premium`
  entitlement in RevenueCat.

## Store listings

- Apple bundle ID / Android package: `app.totland.kids`
- Apple: choose the Kids category (ages 5 and under / 6–8), declare no ads and
  no tracking, and point the privacy questionnaire at the existing
  `/privacy`, `/terms` and `/refund` pages.
- Google Play: complete the Families policy and Data safety forms the same way.
- The parental gate already protects everything involving money.

## Cloud builds

`codemagic.yaml` builds and uploads both apps, so no Mac is needed. Connect the
repository in Codemagic, add the environment groups listed above, add your Apple
App Store Connect API key and Google Play service account, then run the
`Totland iOS` and `Totland Android` workflows.

## Known limitation

Background music files stream from our media host, so in the packaged app the
music needs a connection the first time it plays. Games, narration cached
earlier, and progress all keep working offline for premium families.
