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
- [x] Kids-app policy pages required by the provider review (terms, refund policy, privacy notice)
- [x] Contact page with form at `/contact` (submissions saved to `contact_inquiries`; email forwarding pending email provider setup)

## Codemagic store builds (approved plan)
- [ ] User: RevenueCat project + App Store app, `premium` entitlement, 2 products, webhook (blocked on RevenueCat account)
- [ ] User: add `CERTIFICATE_PRIVATE_KEY_BASE64` to Codemagic `appstore` group; run iOS workflow to TestFlight
- [x] Validate both iOS signing profiles and retain focused/full Xcode archive diagnostics when code 65 occurs
- [ ] User: Google Play account, `totland_keystore`, `google_play` group, RevenueCat Play app (blocked on Play dev account)
- [x] Stored user's Paddle account API key as PADDLE_ACCOUNT_API_KEY (not needed by app — checkout uses managed integration)
- [x] Registered custom URL scheme `app.totland.kids://` on iOS/Android and wired deep links to `/parent/subscription`
- [x] Matched iOS and Codemagic signing to Apple's existing `App.totland.kids` bundle ID
- [x] Made iOS App Store build numbers automatic with a timestamp fallback
- [x] Added the Totland App Clip target, counting game, app icons, and paired Codemagic signing
- [ ] User: correct the Apple App Clip identifier relationship/capabilities, then configure its App Store experience

## Soundtracks (done)
- [x] Menu screens: Little Steps, Big Dreams; activities: Curious Steps; storybooks: Forest of Wonder
- [x] Audible volume slider with live preview in the parent dashboard; wider range, ducking kept

## Voice reliability (done)
- [x] Fall back to the device voice when ElevenLabs is out of credits or unavailable
- [x] Stop repeated voice requests for the rest of the session after the first provider denial

## Word Finds (approved plan)
- [x] 100 original themed word find puzzles with swipe-to-find
- [x] First 30 free and replayable; puzzles 31–100 unlock with premium

## Pre-launch native fixes (approved plan)
- [ ] Part A: remove /parent/cms and /parent/rights; move rights register to docs/
- [ ] Part C: native premium without sign-in (RevenueCat anonymous ID, logIn on sign-in)
- [ ] Part B: @capacitor/preferences storage + @capacitor/network offline detection on native
