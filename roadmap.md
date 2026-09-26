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
- [x] Part A: remove /parent/cms and /parent/rights; move rights register to docs/
- [x] Part C: native premium without sign-in (RevenueCat anonymous ID, logIn on sign-in)
- [x] Part B: @capacitor/preferences storage + @capacitor/network offline detection on native
- [ ] User: confirm RevenueCat restore behavior stays on "Transfer to new App User ID"

## App Store readiness (approved plan)
- [x] Part D: PrivacyInfo.xcprivacy for the app and the App Clip (user adds both to the Xcode targets once)
- [ ] Part E: spoken-line inventory + credit estimate only (no audio generated yet)
- [x] Lucy Spanish voice: es -> Bh4tkGuEEIADxUACafG5 in tts.functions.ts; test batch approved, test page removed, device voice cache bumped to v2
- [ ] Spanish library refresh in Lucy's voice: essentials tier (~3,100 credits) — awaiting credit-spend approval, then generate

## Parent dashboard fixes (approved plan)
- [x] Show honest trailing-seven-day time and game totals with clearly labeled all-time accuracy
- [x] Replace raw per-area levels and accuracy with mastery labels and mastery-based bars
- [x] Add and visually wire the shared high-contrast setting

## Catalog game visual variety (approved plan)
- [x] Add presentation-only themes for all 63 games in the 22 repeated families
- [x] Apply themes across Choice, Order, Hunt, and Memory without changing gameplay
- [x] Verify SFX, reduced-motion, high-contrast, premium gates, and representative game families

## Systematic letter and word tracing (approved plan)
- [x] Track uppercase and lowercase tracing coverage per child without losing existing progress
- [x] Prioritize uncovered letter forms and avoid repeats within each tracing session
- [x] Add parent-facing uppercase/lowercase A–Z coverage
- [x] Add one-letter-at-a-time tracing for 2-, 3-, 4-, and 5-letter words
- [x] Keep 2- and 3-letter tracing free; make 4- and 5-letter tracing Premium
- [x] Verify progression, migration, accessibility, bilingual content, layouts, and persistence
- [x] Count exact new English and Spanish narration lines without generating audio (230 English, 207 Spanish)

## Blank screen in TestFlight app
- [x] Temporary on-device diagnostic overlay (native only, DIAG_OVERLAY flag)
- [x] Time limits on storage load, bridge check, StorageBoot safety timer, mismatch fix
- [x] Time limits on RevenueCat / splash / network calls
- [x] Verify (typecheck, build, build:app head script, stuck-Preferences Playwright)
- [x] Removed diagnostic overlay

## iPhone plugin crash + false offline screen
- [x] Stop returning plugin proxies from async helpers (Purchases, Preferences)
- [x] Native backend default → https://totland.app (no redirect)
- [x] OfflineGate: retry ping once, any HTTP response counts as online
- [x] Fixed launch hydration mismatch (#418); diagnostic overlay removed

## Phone-app Apple/Google sign-in 404
- [x] Native-only in-app browser sign-in sheet (@capacitor/browser)
- [x] Nonce-checked return via app.totland.kids://auth-callback + /auth/native-return page
- [x] Verify native vs web and nonce match/mismatch
- [ ] Confirm a real Apple sign-in end to end on TestFlight

## Store diagnostics (temporary)
- [x] Show RevenueCat error/offering details on the phone subscription panel
- [x] Remove STORE_DIAG box once the TestFlight screenshot identifies the cause (options confirmed loading)

## Bespoke game interactions
- [x] Letter Fishing: drag-the-hook engine + generic useDragToTarget primitive (penalty-free wrong catches, tap fallback)
- [x] Feed the Letter Monster: keyed draggable letters into one mouth target, penalty-free retries, tap fallback
- [x] Word Rocket: drag letters into per-letter fuel slots (flexible order, penalty-free wrong drops, tap fallback)
- [x] Animal Jigsaw: 4-tier levels (2/4/6/9 pieces), 6 AI animal images, drag puzzle; verified all tiers + Fishing/Monster/Rocket regressions
- [x] Number Maze: path-tracing engine (usePathTrace), 3/5/7/8/10 points by level, penalty-free, tap-in-order alternative; verify all tiers + 4 regressions
- [x] Named game list per skill area (/play/$area layout + index + quick)
