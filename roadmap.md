# Roadmap

## Google Play submission materials (2026-10-17)
- [x] Audit Android Data Safety code, SDK guidance and prior release manifest; flag provider sharing/deletion and IP-fingerprint classification uncertainties
- [x] Draft short/full listing with current counts and accurate narration wording; approved full iOS description absent from saved materials
- [x] Create and inspect 1024×500 RGB PNG feature graphic using existing Totland branding

## Voice pause still plays recorded lines (approved 2026-09-28)
- [x] While paused, look up shared library with allowGenerate:false; device voice only for unrecorded lines
- [ ] New Codemagic build + TestFlight check

## Hannah voice shutoff fix (approved 2026-09-27)
- [x] Only quota/rate-limit replies disable Hannah for the session; unrecorded lines fall back per line (src/lib/speech.ts)
- [x] iOS: play narration through the silent switch (AVAudioSession .playback in AppDelegate.swift)
- [ ] New Codemagic build + TestFlight check (client-only; no backend republish needed)


## Native server-call permission fix (approved 2026-09-26)
- [x] Root cause: `x-tsr-serverfn` missing from native CORS allowed headers in src/start.ts blocked every server call from the phone app
- [ ] Add `x-tsr-serverfn` to native allowed headers
- [ ] Verify all 7 native server calls (deleteMyAccount, getMySubscription x2, listChildren/upsertChild/deleteChild, speakText, submitContactInquiry) pass preflight; website unchanged
- [ ] Stress-test child sync merge: local-only children + remote children, second-device sign-in, no duplicates/loss
- [ ] Verify website-Premium (Paddle) recognized in simulated native session
- [ ] Re-verify account deletion end to end with throwaway account
- [ ] Remind: new Codemagic build + TestFlight retest, especially child sync across real devices

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
- [x] User: Google Play account, `totland_keystore`, `google_play` group
- [x] Android readiness: signing from Codemagic keystore, auto versionCode, plugin refresh, adaptive icon, /delete-account page, edge-to-edge, back button
- [ ] User: first signed AAB uploaded by hand to Play internal testing; Play subscriptions + RevenueCat Play app + `goog_` key
- [ ] Test on a real Android phone (purchase, restore, gate, back, music, Spanish)
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

## Honest skill-area exploration (approved plan)
- [x] Replace Home difficulty-level bars with named games explored / total games per skill
- [x] Give Flash Cards a neutral ready state and relabel parent area bars as mastery
- [x] Verify empty, partial, full, replayed, locked, bilingual, world, and parent states

## Letter Rain bespoke interaction (approved Option A)
- [x] Add the self-contained rain engine and accessible animated/static scene
- [x] Keep wrong catches and waiting penalty-free across all five skill levels
- [x] Verify accessibility, motion/contrast modes, performance proxy, layouts, and game regressions

## TestFlight subscription fixes (approved)
- [x] OfflineGate waits for the first Premium check (settled signal) before showing the offline screen
- [x] Fix "your the App Store account" copy in StorePurchasePanel
- [x] Add Terms/Privacy links inside the native purchase box
- [x] Verify offline cold launch (Premium vs free), panel copy, link targets

## Native Apple/Google sign-in return (approved)
- [x] Sheet page clears its saved sign-in on the device only (no backend logout that kills the app's session)
- [x] After handing the session over, confirm it with the backend once; show the existing "didn't work" message on failure
- [x] Verify: no other backend logout on the native return, session survives, website sign-in unchanged
- [ ] (User) Rename the Lovable project to "Totland" and check the consent screen
- [ ] (User, later) Own Apple Services ID + Google OAuth client to replace Lovable branding on Apple/Google screens

## Pre-resubmission number audit (approved)
- [x] Home locks individual games (area lock only for Flash Cards, which has no catalog games)
- [x] Catalog Word Search games follow their Word Finds puzzle tier
- [x] Hidden parent-only miss tracking in the six bespoke games
- [x] Live counts replace typed-in activity numbers, picture words, Word Finds copy
- [x] Honest Premium benefit list; "New content every month" removed
- [x] Flash Cards / Storybooks show sessions instead of mastery bars
- [x] Verify numbers, free access, Word Search tiers, penalty-free feel

## Account deletion fix (approved)
- [x] Client explains the real reason (offline / sign-in expired / server code)
- [x] Refresh + confirm sign-in before deleting
- [x] Server deletes children, subscriptions, then login; safe to retry
- [x] Verify with a throwaway test account

## Deletion DEL-NET + sign-out fix (approved 2026-09-26)
- [x] Permission header on error replies to the app
- [x] Remove forced refreshSession() from deletion
- [x] Log the source of every sign-out
- [x] Verify: real server error shows its code; simultaneous refresh doesn't sign out; deletion end to end
- [ ] (User) Publish, new Codemagic build, TestFlight retest of deletion; send the [signout] line if a sign-out happens

## Subscription-screen clarity and management (approved 2026-09-26)
- [x] Clarify exactly what account deletion removes and preserves
- [x] Add a real native Manage subscription button when RevenueCat supplies a management URL
- [x] Verify iOS/Android URLs, fallback wording, opening failures, and unchanged website handling

## Game interaction fixes and accuracy audit (approved 2026-09-26)
- [x] Add correct-answer pop-and-disappear for findUpper/findNumber ChoiceGame variants with reduced-motion fallback
- [x] Freeze HuntGame boards and complete exactly once from the freshly computed found list
- [x] Correct the three learning-data privacy claims, two bespoke objectives, and per-game age descriptions
- [x] Verify ChoiceGame variants, all hunt games including final-target level-up, bilingual copy, age ranges, and live totals

## Future game interaction backlog
- [x] Letter/Number Pop games (findUpper/findNumber choice-engine games): make the selected tile visually pop and disappear on a correct answer, instead of showing a green checkmark overlay on top of the still-present tile.
- [x] Hunt-type games (Alphabet Safari, Letter Detective, and other hunt-engine games): once all copies of the target letter/item are found (e.g. “4 of 4 found”), the game does not automatically advance to the next round or the reward screen — investigate and fix.

## English narration Tier 1 (approved 2026-09-26)
- [x] Praise and reveal/hint play as back-to-back clips (component approach)
- [x] Rhyme hints use a comma instead of "…" so Hannah can say them
- [x] Record Tier 1 English lines + rhyme hints: all 763 recorded (12,242 credits total); finished 2026-09-26 with the new ElevenLabs key
- [ ] Later decision: Tier 2 (prompts, Word Finds) and Tier 3 (reveals/hints); Spanish out of scope

## Narration: English Tier 2 + Spanish Tier 1 (approved 2026-09-27)
- [x] Spanish rhyme hint: "…" swapped for a comma so Lucy can say it
- [x] English Tier 2 recorded (Hannah): 865 question prompts + 1,019 Word Finds lines
- [x] Spanish Tier 1 recorded (Lucy): 745 lines, praise and teaching line kept as separate clips
- [x] Replace translated English rhyme pairs with the approved 10-pair Spanish rhyme bank and matching pictures
- [x] Correct every Spanish number/shape tracing prompt, article, translated shape name, and adjective agreement
- [x] Verify Spanish and English behavior, then report the exact Lucy replacement-line count and cost without generating audio (79 lines, 2,509 characters; no audio generated)
- [x] Record all 79 corrected Spanish rhyme/tracing lines in Lucy's voice (1,280 credits used) and verify every app lookup resolves from the shared library
- [ ] English Tier 3 (reveals and hints) still on hold

## English App Store resubmission media (approved 2026-09-27)
- [x] Rebuild eight current English screenshots for iPhone 6.9-inch and iPad 13-inch from real app captures
- [x] Use only free gameplay; keep the Word Finds free/Premium split visible and show the exact 104-game count
- [x] Recreate the warm headline/device-frame treatment and inspect all 16 upload-ready PNGs
- [x] Remove markdown asterisks around the App Store description welcome line
- [x] Finalize the reviewer note from live Premium benefit counts and deliver an upload-order guide
- [ ] Hold Spanish screenshot updates for later

- [x] URGENT: fix the ordering-game crash in the middle of a round (keep each round fixed, skip a missing tile safely), then check all 11 games in EN/ES

- [x] Rebalance free/Premium to 40/64: 49 games to Premium, Word Rocket + Animal Jigsaw to free; update App Store reviewer note numbers

## Voice audit follow-up (approved 2026-09-28)
- [x] Text fixes: pattern hint "…" → ".", Spanish gender/article agreement, leftover English, picture-slot blanks (EN + ES)
- [x] Record clean Spanish Tier 3 (1,328) then Tier 2 (558) in Lucy + 46 changed English lines incl. 30 pattern hints in Hannah (19,325 credits)
- [ ] ON HOLD: Spanish phonics / spelling / missing-letter / Word Finds lines (~1,190) — need a Spanish word bank first

## Apple Kids Category 1.3 data-flow (approved 2026-09-28)
- [x] Verify external hosts in packaged app, backend region, pod list
- [x] Self-host Baloo 2 + Nunito Sans; remove Google Fonts; prove no third-party requests
- [x] Deletion: also delete contact_inquiries; 30-day purge of voice_generation_events; verify with throwaway accounts
- [x] Privacy Notice + subscription deletion wording + manifest; updated Apple reply

## Silent narration fix (approved 2026-09-28)
- [x] 4 s time limit on Hannah requests → device voice fallback
- [x] Device voice: pause after cancel, prime inside first tap, replay on not-allowed
- [x] On-device narration diagnostics log (50 events) in parent Settings with Copy
- [ ] New Codemagic build + check on Mac and iPhone (read the diagnostics log)

- [ ] Voice reply fix (expose-headers + reply-shape guard): publish, new Codemagic build, then recheck deletion, child sync, subscription check on a real device
- [ ] On hold: on-device text-to-speech plugin for device-voice fallback (needs separate approval)

## Apple 1.3 (iPad) rejection fix
- [x] Remove Guide/Terms/Privacy/Refunds/Contact links and "For grown-ups" guide link from home; show them inside the parent area
- [x] Grown-up check re-asks on every entry from the child side (no sessionStorage persistence)
- [x] Re-audit at iPad Air 11" (820x1180): external links, purchase actions, deep links, back navigation

## Game-screen scroll fix
- [x] PlayFrame: touch-none -> touch-pan-y so tall game screens can scroll on iPhone
- [ ] Real iPhone/iPad check: drag, tracing, pinch/double-tap zoom on game screens

## Catalog expansion polish (approved 2026-10-10)
- [x] Accept and verify the live 46 free / 75 Premium split without changing flags
- [x] Replace stale visible counts and polish all 17 new games' English/Spanish titles, objectives, and visual themes
- [x] Render real swatches/shapes/numbers in the nine new Fishing/Monster/Rain games with accurate accessibility names
- [x] Keep beginner Monster decoys within the current color/shape/number skill instead of adding alphabet letters
- [x] Verify representative new games in English/Spanish and free/locked states

## Narration coverage scan (approved 2026-10-15)
- [x] Scan every spoken line (EN/ES) against the voice library, no audio generated; report in Files /narration
- [ ] On/after Oct 17 (credit renewal): approve and generate English gaps (~4,600 credits)
- [ ] Fix Spanish letter/phonics word bank before generating Spanish gaps (~45,600 credits)
- [ ] Next: re-point the 11 misnamed games to their real scenes, then the counting interaction

## Spanish word bank (approved 2026-10-15)
- [x] WORDS_ES (27 letters incl. Ñ) + Spanish rounds, spelling, flash cards, Ñ in letter/order/tracing games
- [x] No first-sound questions for H/Ñ/X; tests; flash-card count copy; re-run narration scan
- [ ] Generate Spanish gaps (~2,544 lines, ~51,000 credits) on/after Oct 17 with approval

## Game rebuild group 1 — Batch 1 + 2 (approved 2026-10-15)
- [x] Letter/Number Rocket on the rocket scene (alphabet / counting order)
- [x] Simple Jigsaw on the jigsaw scene, fixed 2–4 pieces, own vehicle picture set
- [x] Number Fishing → "catch the number that comes next"
- [x] Shared picture clue for Fishing/Monster/Rain; Word Fishing + Number Monster use it
- [x] Number Rain "catch in order" mode; Letter Maze (EN 26 / ES 27 with Ñ) with own rewards
- [x] Tests: re-pointed scenes, no duplicate engine+content among bespoke games
- [ ] Look at the 7 Premium re-pointed games with a Premium account (not checked in preview)
- [ ] Record new lines (~190, ~6,500 credits) with the Oct 17+ batch, with approval
- [x] Batch 3: Alphabet Jigsaw (letter+picture cards, EN 26/ES 27), Number Jigsaw (1–20 counts), Shape Train (rocket scene, train skin)
- [ ] Record Batch 3 lines (~250 EN+ES) with the Oct 17+ batch, with approval

## Premium locked despite active store subscription (approved 2026-10-15)
- [x] Store and account answers combined; backend can only add Premium
- [x] Purchase/Restore unlocks games immediately
- [x] Tests (src/lib/premium-sources.test.ts)
- [ ] RevenueCat webhook: anonymous purchases skipped + confirm webhook configured in RevenueCat
- [ ] New Codemagic build + TestFlight check

## Spanish for grown-up screens (approved 2026-10-16)
- [x] Parents area, dashboard, family, subscription/deletion, sign-in, store panel, app cards, contact, sign-in return, error page in Spanish
- [x] Language switch updates these screens immediately
- [x] Terms/Privacy/Refund: Spanish note that English version applies
- [x] Test: src/lib/parent-spanish.test.tsx
- [ ] Native Spanish speaker reviews wording before publish

## Opening animation + first-time language picker (approved 2026-10-16)
- [x] Entrance animation covering startup load, skippable, reduced-motion still
- [x] First-time English/Español popup; returning families never asked
- [x] Tests (src/lib/language-choice.test.ts)
- [x] Investigate Spanish home-screen music (reported)
- [x] Spanish home-screen song: separate little-steps-big-dreams-es.mp3, live language selection, offline bundle; 9 tests passed and browser requested hosted Spanish audio (200)
- [ ] Spanish song on a real iPhone: new Codemagic build + device check
- [ ] Check opening animation on a real iPhone (new build)

- [x] Music: dashboard silent (no preview), home music survives leaving dashboard, ordering test EN/ES

- [x] Pin vitest to exactly 5.0.5

## Misnamed games rebuild + matching-game freeze (approved 2026-10-18)
- [x] Bubble Pop scene: Letter/Number/Color/Shape Pop, Letter/Number Bubbles
- [x] Sort into baskets: Rainbow Sort, Shape Sort, Sort the Toys, Color Carousel
- [x] Assemble pieces: Letter/Number/Shape/Picture Puzzle, Shape Builder, Pattern Builder
- [x] Train: Beginning Sound Train (load pictures), Counting Train (hook N carriages)
- [x] Number Garden (plant N flowers); Sound Detective now a find-every hunt
- [x] Matching-pairs (memory) games freeze fixed: deck frozen, done guarded once
- [ ] Ryan plays the new scenes on a real phone; record new spoken prompts (needs credit approval)
- [ ] Amazon Appstore scoping (plan drafted, awaiting review)

## Flat tap-a-card games, Part 1 (approved 2026-10-18)
- [x] Twin Shapes → flip-to-find shape pairs
- [x] Count the Stars → fill the jar; Count the Fruit → fill the basket
- [x] Shape Match → toy shape-sorter box; Shape Shadow (shapes) / Match the Shadows (objects) → drag onto shadow
- [x] Recorded combined Part 1+2 narration (137 lines)
- [x] Part 2: Color Match paint-the-picture, Paint Match dip-the-brush, Count the Animals tap-to-count, Big or Small size boxes, Long or Short ribbon order

## Android vitals fixes (approved 2026-10-18)
- [x] R8 shrinking + keep-list + mapping file artifact
- [x] Native edge-to-edge in MainActivity, cream bars, StatusBar color call removed
- [ ] Ryan: internal-testing check of bars + real purchase/restore on minified build
- [x] Scope Capacitor 8 upgrade (findings + estimate delivered 2026-10-18)
- [ ] Capacitor 8 upgrade: deliberately on hold, scheduled for Thanksgiving week (week of Nov 23, 2026) — don't start before then (Play deadline Feb 2027)

## Progress-saving fixes (approved 2026-10-18)
- [x] Saves apply to freshest progress (no stale-copy overwrite); sync keeps mid-sync play; Words lock shows live count
- [ ] Ryan: new build + TestFlight check of explored counter and Words unlock; confirm "10 different letters" rule

## One-frame word tracing (approved 2026-10-24)
- [x] Little-finger tuning (2026-10-25): named 10% touch allowance (9px at slot 90), 7% brush radius (6.3px), 60% finish; pure tests pass. Actual-font browser checks at 360px and 1024px: vertical d/o swipes stay at 23–27%; single careful 6px-offset outlines finish, 25px-away touch paints nothing, drift/re-entry resumes without lifting, zero outside-glyph ink; panda/búho/niño finish once in order. Phone 4/5-letter slots 90px scroll; iPad 5-letter slots 98px fit 490px. Real free game saved 3 words and reached reward. No publishing or sensitive-area changes.
- [x] Whole word on one baseline with guides; per-letter auto-advance; coverage only in active letter; word letters count toward unlocks
- [x] iPhone ink fix: glyph-clipped narrow brush, 70% fine-grid coverage, clean highlight, 90px minimum slots; 91 tests pass; actual-font d/o swipe resistance, zero outside-glyph ink, ordered one-time finish checked at 360px and 1024px; real free-game session saved 3 words and reached reward
- [ ] Ryan: new TestFlight build, re-check panda/donut finger tracing, 60% completion feel, drift/re-entry, scroll and Spanish accents; five-letter canvas checked in isolated browser fixture (no Premium bypass), not a verified entitled session
- [ ] Ryan: device check of word frame on phone + iPad (finger tracing feel, 5-letter scroll, Spanish accents); not published

## Line Tracing pre-writing game (approved 2026-10-24)
- [x] Game #122 "Line Tracing" (free): 30 code-made dashed paths, 5 levels, follow-in-order rules, calm finish
- [x] Recorded 4 new narration lines (2 EN Hannah / 2 ES Lucy, 141 characters) — 2026-10-24, scan confirms all present
- [x] Multi-stroke tracing engine + games #123 "Trace Shapes" (FREE) and #124 "Trace Numbers" (PREMIUM) — 2026-10-25: ordered strokes with numbered green start dots, generous start zone, lift keeps progress, strict order default with per-child "free order" toggle in the parent dashboard (profile.freeTraceOrder, optional field, old profiles unaffected); 8 shapes + digits 0-9 hand-authored (US school print, top-to-bottom, left-to-right) in src/lib/trace-strokes.ts; 106 tests pass; contact sheet + full playthrough verified at 360px and iPad widths; Trace Numbers lock screen confirmed. Free/Premium for Trace Numbers is the trailing 1 on its catalog row (src/lib/catalog.ts).
- [x] Narration for Trace Shapes/Numbers: recorded all 72 lines (36 EN Hannah / 36 ES Lucy, 1,300 characters) — 2026-10-25; library scan confirms all 72 present; 572 ElevenLabs credits used, 172,287 remaining
- [ ] Update hand-written counts (now 125 games, 49 free / 76 Premium) in store listing, review notes and marketing docs
- [ ] Later (after teachers pick a handwriting style): "Trace Big Letters" and "Trace Small Letters" plug into the same engine
- [ ] Ryan: real-device finger check on phone + iPad (stroke order, start zones, free-order toggle, Spanish names); not published

## Free Draw game (approved 2026-10-25)
- [x] Fix delayed-mount canvas sizing (2026-10-29): attach retina sizing and ResizeObserver after profile hydration; verify finger-aligned ink across the page, replay, undo and resizing at phone/iPad widths
- [x] Game #125 "Free Draw" / "Dibujo libre" (FREE, Color Cove, ages explorer/learner/reader): blank-page canvas, smooth retina strokes (pointer events, coalesced moves, quadratic smoothing, round caps), single-pointer rule, touch-action none on the canvas only; 10 colour-blind-distinct swatches, 3 brush sizes, eraser, multi-step undo, two-tap Clear (3s window), calm "I'm finished" reward once; no timer/score/sharing/network
- [x] Privacy: drawings never enter the profile or family sync; last drawing per child kept on-device only under storage key `totland.freedraw.v1` (localStorage on web, native storage in the packaged app), removed on child deletion (removeChild) and account deletion (parent.subscription); Privacy Notice wording checked — still accurate, no tweak needed
- [x] 119 tests pass (undo stack, eraser flag, clear confirm, finish-once, single pointer, persistence caps, catalog totals 125/49/76); browser playthrough at 360px and iPad: strokes, undo, eraser, clear confirm, reward, reload persistence all verified
- [x] Narration: recorded all 4 lines (2 EN Hannah / 2 ES Lucy, 90 characters) — 2026-10-25; lookup-only scan confirms all 4 present; credit counter unchanged at 16,454 used / 172,287 remaining (usage below refresh granularity)
- [ ] Ryan: real-device finger check (palm rejection, fast scribbles, Clear two-tap, Spanish labels); not published

## Connect the Dots (approved 2026-10-25)
- [x] Game #126 "Connect the Dots" / "Une los puntos" (FREE via no trailing flag, Number Valley/numbers, ages explorer/learner/reader), engine/kind `dots:connectDots`
- [x] 30 original hand-authored puzzles in src/lib/connect-dots.ts (5 levels, 3→20 dots), strict numeric order, gentle nudge, hit radius 11, frozen deal of 3 per session, once-only completion; `puzzleSvg` helper for printables
- [x] Tests: ordering, nudge, completion once, hit radius, sequential/in-bounds/non-overlapping dots, no line crossing over another dot; totals 126 / 50 free / 76 Premium
- [x] Narration: recorded 59 missing lines (Hannah EN / Lucy ES, 1,125 chars, 492 credits) — 2026-10-25, lookup scan confirms all 62 present
- [ ] Hand-written game-count quotes (store listing, review notes, marketing docs) → 126 / 50 free / 76 Premium
- [ ] Ryan real-device check: 29px dots on phones at 20-dot level, drag feel, Spanish lines
- [x] Printable PDFs — see Teachers & printables below

## Teachers & printables — Build 1 (approved 2026-10-25)
- [x] "Teachers & printables" page inside /parent (behind the existing gate), dashboard card + Printables tab; no child-screen links
- [x] Pure sheet catalogue/layout in src/lib/printables.ts: Letter (default) / A4 remembered on device, 0.5in margins, 1 or 2 per page, Name/Date line on by default, typed name never saved, black-and-white photocopy-safe sizes
- [x] Sheets: Connect the Dots (30), dashed Line Tracing (30) with start dot + arrow + end ring, Blank page with border; free = first 3 by level per type, Blank always free; Premium via existing verified check
- [x] jsPDF loaded only on "Make PDF" (dynamic import); web Download PDF / Open to print; native app shows "Coming in the next app update"
- [x] Tests: margins Letter/A4, 1 vs 2 per page, free-sample rules, page counts, PDF page count + numbers; browser check through the gate at 360px and iPad, PDF rasterized
- [ ] Build 2: Trace Shapes/Numbers sheets, dashed/dotted toggle, Filesystem + Share plugins, native share/print (needs new native build)
- [ ] Ryan: real printout/photocopy check of line weights and dash spacing
