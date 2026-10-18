# Capacitor 8 upgrade — findings and estimate (nothing changed)

## 1. What's installed now vs latest
| Piece | Now | Latest (needs Capacitor 8) |
|---|---|---|
| core / cli / android / ios | 7.6.9 | 8.5.3 |
| app | 7.1.2 | 8.1.2 |
| browser | 7.0.5 | 8.0.5 |
| network | 7.0.4 | 8.0.1 |
| preferences | 7.0.4 | 8.0.1 |
| splash-screen | 7.0.5 | 8.0.2 |
| status-bar | 7.0.6 | 8.0.4 |
| RevenueCat | 12.3.2 | 13.7.4 |

Android build today: minSdk 24, target/compile 36, build plugin 8.9.1, Gradle 8.11.1. iPhone minimum: iOS 15.0. Codemagic uses "latest" Xcode.

## 2. What actually changes (from Capacitor's official guide)
- **Edge-to-edge setting removed.** `adjustMarginsForEdgeToEdge` (what keeps content clear of the bars today) no longer exists. Capacitor 8 replaces it with a new built-in "System Bars" feature plus the web safe-area padding. This is the only real redesign: our layout must rely on the CSS safe-area work (already present) and be re-checked on screen.
- **Android tooling:** build plugin 8.9.1 -> 8.13.0, Gradle 8.11.1 -> 8.14.3, splash library 1.0.1 -> 1.2.0, small `=` syntax tidy-ups in build files. Our SDK levels (24/36) already meet the new minimums.
- **Node 22+** needed for the build tools (Codemagic setting check).
- **Plugins:** for the ones we use, the changes are version/library bumps; no function signatures we call change. Status bar and splash are the ones tied to the deprecated warning.
- **Not confirmed:** whether status-bar 8 fully drops the old window-colour code Play flags. The guide doesn't say so explicitly; this must be checked in the built app before promising the warning clears.

## 3. RevenueCat (business-critical)
- A Capacitor 8 version **is available** (13.x, latest 13.7.4), so the upgrade doesn't need to wait.
- It's a major version jump with real changes: newer Google Play Billing library (8.3), new underlying RevenueCat SDKs on both phones, and removal of an old trick for restoring "consumed" one-time products.
- Totland sells subscriptions, so the consumable warning likely doesn't apply, but the RevenueCat product settings should be confirmed.
- Our purchase code calls must be re-checked against 13.x; I haven't confirmed every function is unchanged.

## 4. iPhone / Xcode
- **Xcode 26+ required.** Codemagic's "latest" should satisfy it; worth pinning so builds don't surprise us.
- iOS minimum stays **15.0** (we're already there). No App Store minimum change for families.
- The iPhone app must be rebuilt and re-tested too, because core and RevenueCat change on both platforms. You can't upgrade Android alone.

## 5. Effort and risk
**Effort:** about 3–5 hours of work here (1–2 sessions), including real Android release compiles and tests. Then a Codemagic build for each platform and Ryan's device testing (about half a day on his side).

**Most likely to break (needs real devices, not just a compile):**
1. **Purchases and restore on both stores** (RevenueCat 13 + new billing library): prices load, buy, Premium unlocks, reinstall + restore, webhooks still match.
2. **Bars and screen edges on Android** after the margins setting goes away: content under the status bar or the gesture bar, in games and the grown-up area.
3. **Splash/entrance animation timing** with the new splash library.
4. **Back button and app resume** (app plugin bump).
5. **R8 shrinking** with new plugin code — keep-rules re-verified from the mapping file.
6. **iPhone build** on Xcode 26 (signing, pods).

**Recommendation:** worth doing, but as its own release after the current Android build is stable, not mixed with other changes. Deadline is Feb 2027, so there's no rush. Wait to do it until Ryan has device time for a full purchase/restore pass on both phones.

No changes made. Gate, pricing, free/Premium split and purchase code were not touched.
