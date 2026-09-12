# Roadmap

## Payments (approved plan)
- [x] Enable built-in payments (Paddle)
- [x] Create products: Premium Monthly $2.99/mo, Premium Yearly $19.99/yr
- [x] Checkout utilities: src/lib/paddle.ts, price resolver server fn, test-mode banner
- [x] Wire parent.subscription.tsx to real checkout (parent gate stays in front)
- [x] Test full flow in test mode — checkout opens with correct products/pricing

## Accounts + verified entitlement (done)
- [x] Lovable Cloud enabled; `subscriptions` table + `has_active_subscription`, RLS (read-own only, writes service-role only)
- [x] Parent sign-in (email/password + Google) behind the parental gate; kids never sign in
- [x] Checkout passes `customData.userId` + customer email
- [x] Webhook `src/routes/api/public/payments/webhook.ts` (signature-verified) is the only writer of entitlement
- [x] Server fn `getMySubscription` — premium is verified server-side, cached locally for offline play
- [x] Removed the spoofable `?checkout=success` unlock; success now polls for webhook confirmation
- [x] Renewal/cancel/past-due surfaced; canceled keeps access until period end
- [x] Restore purchase + sign out; checkout error message when a price can't be resolved

## Remaining
- [ ] Go live: verify identity in the Payments tab, publish (products + webhook sync to live)
- [ ] Kids-app policy pages required by the provider review (terms, refund policy, privacy notice)

## Codemagic store builds (approved plan)
- [ ] User: RevenueCat project + App Store app, `premium` entitlement, 2 products, webhook (blocked on RevenueCat account)
- [ ] User: Codemagic `appstore` group (done) with `CERTIFICATE_PRIVATE_KEY`; run iOS workflow to TestFlight
- [ ] User: Google Play account, `totland_keystore`, `google_play` group, RevenueCat Play app (blocked on Play dev account)
- [x] Stored user's Paddle account API key as PADDLE_ACCOUNT_API_KEY (not needed by app — checkout uses managed integration)
- [x] Registered custom URL scheme `app.totland.kids://` on iOS/Android and wired deep links to `/parent/subscription`
- [x] Matched iOS and Codemagic signing to Apple's existing `App.totland.kids` bundle ID

## Soundtracks (done)
- [x] Menu screens: Little Steps, Big Dreams; activities: Curious Steps; storybooks: Forest of Wonder
- [x] Audible volume slider with live preview in the parent dashboard; wider range, ducking kept
