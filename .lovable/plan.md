# Three pre-launch fixes for the native build

Website behaviour stays byte-for-byte the same: every change is either a removal of unfinished admin pages, or is wrapped in a native-only branch that falls through to today's code path in a browser.

---

## Part A — Remove the unfinished admin pages

What exists today: the parent tab bar links to "Content rights" and "Content studio". Nothing else in the app references them.

Dependency check (already done):
- `src/routes/parent.cms.tsx` imports only `AREAS` from `src/lib/content.ts` and the `RightsStatus` type from `src/lib/rights.ts`.
- `src/routes/parent.rights.tsx` is the only consumer of `src/lib/rights.ts`.
- `src/lib/rights.ts` is imported by nothing else.
- No other page, dashboard card, footer, or sitemap entry points at these two routes.

Changes:
- Delete `src/routes/parent.cms.tsx` and `src/routes/parent.rights.tsx`.
- Remove the two tab entries from the nav array in `src/routes/parent.tsx` (leaving Dashboard, Children, Subscription, Contact).
- Move `src/lib/rights.ts` to `docs/content-rights-register.md` (the records preserved as a readable table) so the licence register is kept but no longer bundled.
- Let `src/routeTree.gen.ts` regenerate; confirm it no longer lists the two routes and that the build is clean.

Risk: a stale `Link to="/parent/cms"` anywhere would become a typecheck error — that is the safety net, and the search above shows there are none.

## Part C — Premium without an account in the native app

Native-only. Web keeps sign-in + Paddle exactly as today.

1. `src/lib/purchases.ts`: allow `configurePurchases()` with no user id — RevenueCat then generates its own anonymous app user ID. Add `logInPurchases(userId)` and `logOutPurchases()` wrappers.
2. New `src/hooks/useStoreEntitlement.ts` (native only): configures RevenueCat at launch, reads `storeEntitlementActive()` from cached customer info (works offline), and refreshes on app resume and after purchase/restore.
3. `src/hooks/useEntitlementSync.ts`: premium becomes `serverVerified || storeEntitlement` on native. The current "no session ⇒ premium false" rule stays exactly as-is on web; on native it can only be cleared when the store also reports no entitlement.
4. `src/components/StorePurchasePanel.tsx`: `userId` becomes optional so the purchase and restore buttons work signed out. The panel still lives behind the parental gate on `/parent/subscription`; nothing about the gate changes.
5. `src/routes/parent.subscription.tsx`: on native, show the store panel without requiring a session; keep the sign-in card as an optional "sync across devices" section.
6. On sign-in (`useParentAuth` / auth state change) call `Purchases.logIn(userId)`; on sign-out call `logOut()`.

RevenueCat ID transfer (answer to your question 3): when you call `logIn` with a real id, RevenueCat has to decide what happens to purchases attached to the anonymous id. Set **"Transfer to new App User ID"** in the RevenueCat dashboard (Project settings → Restore behaviour). With that setting, the anonymous purchase moves onto the parent's account the moment they sign in, so they keep premium and the account owns it going forward. The alternative ("keep with original") would strand the purchase on the anonymous id.

Webhook (question 6): `src/routes/api/public/rc/webhook.ts` rejects non-UUID `app_user_id`, and anonymous ids look like `$RCAnonymousID:...`. That is **correct and should stay** — the `subscriptions` table is keyed to a real account, and anonymous premium is proven on-device by RevenueCat's own cached entitlement, not by our database. I will only soften the log line so an anonymous event is recorded as expected-and-ignored rather than as an error. Once the parent signs in and RevenueCat transfers the purchase, RevenueCat re-sends events with the real user id and the row is written then.

## Part B — Native storage and real offline detection

1. Add `@capacitor/preferences` and `@capacitor/network` to `package.json`.
2. New `src/lib/storage.ts`: a small key/value layer with a synchronous in-memory cache. On web it reads and writes `window.localStorage` exactly as today. On native it serves reads from memory and writes through to Preferences asynchronously.
3. `src/lib/profile.ts` keeps its current synchronous API — `loadFamily`, `saveFamily`, `loadProfile`, `saveProfile`, `useProfile`, `useFamily` are unchanged in shape; only the two `window.localStorage` calls are swapped for the new layer.
4. First native launch migrates `totland.family.v1` and `totland.profile.v1` from localStorage into Preferences if Preferences is empty, then marks migration done. Nothing is deleted from localStorage, so a failed migration cannot lose progress.
5. New `src/components/StorageBoot.tsx` in `src/routes/__root.tsx`: on native it awaits the hydration of the two keys before rendering children (splash screen stays up), so the first screen already sees the real profile. On web it renders children immediately with no extra render pass.
6. `src/components/OfflineGate.tsx`: on native, use `@capacitor/network`'s `getStatus()` and `networkStatusChange` listener; web keeps `navigator.onLine`. Add an explicit guard so a premium profile never sees the offline screen, and only treat the device as offline when the network plugin reports disconnected.
7. `src/routes/parent.subscription.tsx` account-deletion cleanup clears the new storage as well as localStorage.

## Confirming the web app is unaffected

- Every native path is behind `isNativeApp()`; the browser keeps `localStorage` and `navigator.onLine`.
- Typecheck and build after each part.
- Playwright pass in the sandbox browser: home, worlds, word finds, a puzzle, rewards, `/parent` (gate answered), `/parent/children`, `/parent/subscription` — checking the two admin tabs are gone, premium/free gating is unchanged, and the console is clean.
- Confirm progress written before the change is still read after it (same keys, same JSON).

## Outside Lovable (you)

- **RevenueCat:** set restore behaviour to *Transfer to new App User ID*; confirm the `premium` entitlement is attached to both products.
- **App Store Connect / Play:** no new settings; the "account not required to purchase" answer in the review notes becomes accurate.
- **Codemagic:** rerun `cap sync` happens in the existing `build:app` step — no workflow edit needed, but the first build after this must run a clean pod install so the two new Capacitor plugins are linked.
