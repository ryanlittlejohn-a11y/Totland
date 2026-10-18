# Part 1 — "Pop" games and other misnamed games: audit and fix plan

Read-only audit of all 121 games. Nothing built yet.

## Findings: the Pop / Bubbles family

All six run the shared tap-a-card screen. None has a real pop or bubble-burst interaction.

| # | Game | Today | Free/Premium |
|---|------|-------|--------------|
| 1 | Letter Pop | Tap-a-card; correct card plays a small "popped" animation | Free |
| 4 | Letter Bubbles | Tap-a-card (same content as Letter Pop), round "bubble" card shape | Premium |
| 37 | Number Pop | Tap-a-card; same small "popped" animation | Free |
| 38 | Number Bubbles | Tap-a-card (same content as Number Pop) | Premium |
| 56 | Color Pop | Plain tap-a-card, no pop at all | Free |
| 61 | Shape Pop | Plain tap-a-card, no pop at all | Free |

The small "popped" effect only exists for letters and numbers. That is why Color Pop and Shape Pop feel completely flat. Letter Pop / Letter Bubbles and Number Pop / Number Bubbles are also identical pairs under different names.

## Findings: other games whose name promises a scene they don't have

Same class of problem, all on the tap-a-card screen:

- **Train names:** Beginning Sound Train (#23), Counting Train (#51) — no train.
- **Garden:** Number Garden (#44, "plant that many flowers") — nothing is planted.
- **Sorting names:** Rainbow Sort (#58), Shape Sort (#64), Sort the Toys (#78), Color Carousel (#108) — nothing is sorted into groups; it's pick-one.
- **Builder/Puzzle names:** Shape Builder (#63), Letter Puzzle (#19), Number Puzzle (#52), Shape Puzzle (#68), Picture Puzzle (#85) — nothing is assembled.
- **Detective:** Sound Detective (#24) — pick-one, unlike Letter/Color Detective which really are hunts.
- **Pattern Builder** (#95) — picks the next item, doesn't build a pattern.

Not flagged (name honestly describes a pick-one game): Missing Letter, Upper/Lower case, Letter/Shape Shadow, Sound Match, Picture Word Match, Rhyming Pairs, Same Sound, Missing Letter Word, Count the Animals/Stars/Fruit, Number Match, Missing Number, More or Less, Bigger Number, Color/Paint/Shape Match, Twin Shapes, What's Different/Missing, Which Comes Next, Big or Small, Long or Short, Complete the Picture, Match the Shadows, Pattern Parade. Order-type "Train/Garden/Bridge/Race" letter and number games do use a sequence mechanic, so they're acceptable.

## Proposed real interactions

1. **Bubble Pop scene (shared) — fixes 6 games:** floating bubbles drift gently upward (calm, no timer, slow wobble). Each bubble holds a letter, number, colour or shape. Tapping the right one bursts it (stretch, burst into droplets, soft pop sound); wrong bubbles wobble and stay. Same picture-clue panel as Fishing/Monster/Rain. Reduced-motion and screen-reader users get still bubbles that are real buttons. Built the same way as Letter Rain (light animation, no per-frame work).
   - To keep the pairs distinct: **Pop** games = a few big bubbles, find the one named; **Bubbles** games = a bubble cloud, pop *every* bubble holding the named letter/number (more like a hunt).
2. **Sort into baskets (shared) — fixes 4 games:** drag each item into the matching basket (colour or category), with tap-to-place fallback. Uses the existing drag helper.
3. **Train scene (shared, reuse Shape Train look) — fixes 2:** Beginning Sound Train loads picture cars that start with the sound; Counting Train adds that many carriages.
4. **Assemble pieces (reuse jigsaw scene) — fixes up to 5 "Puzzle/Builder" games:** drag 2–4 pieces into place to form the letter, number, shape or picture.
5. **Individual:** Number Garden (tap to plant N flowers), Sound Detective (hunt-style), Pattern Builder (drag shapes to complete the row). Alternatively these three can be honestly renamed instead of rebuilt.

## Ranking (most games fixed per build)

1. Bubble Pop scene — 6 games (all four free ones are prominent). Recommended first.
2. Assemble pieces — up to 5.
3. Sort into baskets — 4.
4. Train scene — 2.
5. Individual builds or renames — 3.

## What stays the same

Game names, numbers, the free/Premium split (46/75), the parental gate, subscriptions, Spanish word banks (with Ñ). No new narration audio unless approved; new prompt lines would be listed with credit cost first.

## Technical details

- New `engine: "pop"` added to the engine switch in `game.$gameId.tsx`; catalog rows 1, 4, 37, 38, 56, 61 re-pointed; existing round generators (`findUpper`, `findNumber`, `findColor`, `findShape`) reused; "Bubbles" uses a find-all variant.
- Bubble motion: CSS transform/opacity loops with a static reduced-motion path, per the existing moving-target rule.
- Tests added to `game-repoint.test.ts`: each Pop/Bubbles game opens the pop scene, no two share engine+content, free/Premium counts unchanged.
- Later batches: `sort` engine on the drag helper; train and assemble reuse existing scenes.

---

# Part 2 — Totland on the Amazon Appstore (Fire tablets) — scoping

Read-only scoping. Nothing is changed until Ryan approves a build step.

## Short answer

A small-to-medium follow-on, not a second Android project. The same Android app code works on Fire tablets. Purchases need one extra Amazon billing module, one switch to tell RevenueCat "this is the Amazon build", and a separate Amazon build in Codemagic. Estimated build work: roughly half a day to a day on my side, plus Ryan's store setup and device testing (the larger share of elapsed time).

## 1. Does the installed purchase plugin support Amazon?

Checked in the installed code (@revenuecat/purchases-capacitor 12.3.2):

- **Yes, the plugin wraps Amazon.** Its setup accepts a `useAmazon: true` option (Android only). Its Android code reads that option and switches the store from Google Play to Amazon.
- **The gap:** the plugin does not include Amazon's billing library by default. Its Android build only pulls in the shared RevenueCat core (purchases-hybrid-common 17.55.1). RevenueCat's Amazon support lives in a separate module (`purchases-store-amazon`) that must be added to the app's Android build, version-matched to the core. Without it, `useAmazon: true` fails at launch.
- So: same plugin, no new plugin, one added Android dependency.
- Not verified here: the exact matching Amazon module version for core 17.55.1 — confirm against RevenueCat's release notes during the build step.

## 2. Can the same Android build go to Amazon for free content?

Mostly yes, but it should be a **separate build**, not the identical Google file:

- **Same code, same minimum/target Android version, same app id** (app.totland.kids) are fine. Fire OS 7/8 are based on Android 9/11, above the Android 7.0 minimum.
- **No Google Play Services dependency in app code** — nothing in the app needs it, so Fire tablets (which lack Google services) are OK. The google-services build plugin is declared but should be confirmed unused before submission.
- **File format:** Amazon has historically required an APK rather than the Google .aab; whether Amazon currently accepts .aab for this account must be checked in the Amazon developer console. Planning assumes an APK (`assembleRelease`).
- **Signing:** Amazon re-signs apps itself. The same Codemagic keystore can sign the upload; no new keystore needed.
- **Why a separate build anyway:** the Amazon build must turn on Amazon billing and say "Amazon Appstore" instead of "Google Play" in the subscription screens. A Google build uploaded to Amazon would show Google wording and fail to buy.
- Free content alone would work from the Google build, but shipping it would mean a broken "Subscribe" button — not recommended.

## 3. What changes for Premium (additive or invasive?)

Additive, the same shape as adding Android next to iPhone:

- **Store detection:** Fire tablets report "android", so the app cannot tell Amazon apart at runtime reliably. Use a build-time flag (e.g. `VITE_APP_STORE=amazon`) set only in the Amazon Codemagic build.
- **purchases.ts:** pick an Amazon RevenueCat public key (`VITE_REVENUECAT_AMAZON_KEY`, starts with `amzn_`) and pass `useAmazon: true` when the flag is set. Everything else (buy, restore, entitlement check, sign-in linking, anonymous purchases) is unchanged.
- **Product matching:** Amazon product ids come back as SKUs without Google's `id:baseplan` format. The existing matcher already falls back to RevenueCat's package type (monthly/annual), so it should work — to be confirmed with a test.
- **Wording:** StorePurchasePanel, parent.subscription and GetTheAppCard say "Google Play" on Android; add "Amazon Appstore" (English and Spanish) when the Amazon flag is set.
- **Server webhook (rc-webhook.ts):** currently records Google as "google", Apple as "apple", anything else as generic "store". Amazon purchases would still grant Premium but be labelled "store". Add an explicit "amazon" label plus a test.
- **Store links:** app-links.ts / GetTheAppCard would gain an Amazon listing link only once one exists.
- These touch subscription/purchase code, so each needs Ryan's approval before building (per the project rule).

## 4. Amazon kids policy vs what's already built

Amazon's kids rules largely mirror Apple Kids and Google Families, which Totland already meets: parental gate before purchases/settings/links, no ads, no third-party tracking, no advertising ID, optional grown-up account, public deletion page.

Items specific to Amazon:

- **"Directed to children under 13" declaration** in the submission form (COPPA) — answer Yes; Amazon then forbids ad/analytics SDKs and interest-based ads (none present).
- **Content rating questionnaire** — Amazon's own form, not reusable from IARC automatically.
- **Privacy policy URL** — existing totland.app/privacy works.
- **Amazon Kids+ (the paid kids catalog) is a separate, invitation/partner programme**, not an Appstore checkbox. Being in the regular Appstore with a kids rating makes the app installable on Fire Kids profiles via parent approval; Kids+ inclusion is a later business conversation, not a build task. Kids+ titles usually must not show in-app purchases inside the Kids+ experience — check before applying.
- **Note:** Amazon closed its Appstore on non-Amazon Android phones in August 2025; Fire tablets remain fully supported, which is Ryan's target.
- Nothing found that requires changing the gate, deletion flow or privacy practices. Final policy wording should be checked in Amazon's console at submission time.

## 5. Effort estimate

- My build work: ~0.5–1 day (billing module, build flag, key selection, wording, webhook label, tests, Codemagic Amazon workflow, real compile check).
- Ryan's work: Amazon developer account, app listing, subscriptions created in Amazon (same ids: totland_premium_monthly / totland_premium_yearly), RevenueCat Amazon app + shared key, device testing on a Fire tablet, review (typically a few days).
- Much smaller than the original Android effort: no new platform folder, signing, icons, edge-to-edge or back-button work.

## Recommended order of operations

1. Ryan: create the Amazon developer account and the app entry; confirm whether .aab or APK is accepted.
2. Ryan: create the two subscriptions in Amazon with the same ids; add an Amazon app in RevenueCat (needs Amazon's shared key), attach products to the existing `premium` entitlement and offering; send me the `amzn_` public key.
3. Me (approval needed — purchase code): add the Amazon billing module, the build flag, key selection with `useAmazon`, Amazon wording (EN/ES), webhook "amazon" label, tests.
4. Me: add a "Totland Amazon" Codemagic workflow producing a signed APK with the same keystore and auto build number; compile it here to prove it builds.
5. Ryan: install on a real Fire tablet via Amazon's Live App Testing; check purchase, restore, gate, back button, music, Spanish, offline.
6. Ryan: kids declaration, content rating, store listing (reuse the Google text, icon, feature graphic and screenshots, swapping "Google Play" wording for Amazon), submit.
7. Later, optional: approach Amazon about Kids+.

## Uncertainties to resolve before building

- Exact `purchases-store-amazon` version matching the installed core.
- Whether Amazon currently accepts .aab for Ryan's account.
- Whether the Amazon product SKUs map cleanly through the existing monthly/yearly matcher (test with real offerings).
- Amazon Kids+ IAP restrictions, if Ryan pursues Kids+.
