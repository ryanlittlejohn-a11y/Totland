# Premium games locked despite an active subscription — root cause findings

Read-only investigation. Nothing changed. Fix proposal at the end needs approval (this is subscription code).

## 1. What the lock screen checks

- Game screen, area lists, worlds, Word Finds and stories all use the same check: `game.premium && !profile.premium`.
- `profile.premium` is never read from storage. It comes from one in-memory flag (`verifiedPremium` in profile.ts), set only by:
  - **App launch check** (useEntitlementSync): asks RevenueCat on the device first; if yes, Premium. If not, asks our backend for the signed-in account. Runs again only when the device comes back online or someone signs in/out.
  - **Subscription page** (parent.subscription.tsx): every time it opens with a signed-in, verified account, it sets the flag to **whatever the backend says**.
  - Sign out / delete account: set to false.

## 2. Systemic, not caused by the game batches

- Batch 1/2/3 touched only which scene a game opens and the catalog's kind/engine fields. No premium flags changed (46/75 still), and the lock line in the game screen is unchanged.
- Nothing in the Premium-check files (entitlement sync, purchases, profile, sign-in check, storage boot, offline gate, subscription functions, store webhook) has changed in the last 10 days. Letter Bubbles being locked confirms it's app-wide.

## 3. Root cause (two real bugs, both old, made visible now)

**Bug A — the subscription page overwrites the store answer.**
The page's own display combines both sources (`account active OR store active`), so it shows "Premium active". But the flag the games read is set from the backend answer **only**. The backend has no record of App Store purchases (see below), so it says "not active" and the games lock — and stay locked until the app is fully closed and reopened.
Sequence: Premium recognized at launch → grown-up opens parent area → subscription page → games locked.

**Bug B — buying or restoring in the app never unlocks games right away.**
After a store purchase or Restore Purchases succeeds, the panel refreshes only the subscription page's own display. Nobody sets the game flag to true. Games stay locked until the next launch (and then Bug A can re-lock them).

**Why the backend says "not active":** the subscriptions table has only 2 rows, both test web (Paddle) purchases from Sept 26. There are **zero App Store rows** — the store notification receiver has never recorded a purchase. So on a store-only subscriber, the backend is always "no", which turns Bug A into a lock.

## 4. Cached/stale state?

- Not a stale-cache issue in RevenueCat; the device check at launch is fine if RevenueCat reports the entitlement.
- The "settled" flag only affects the offline screen, not the lock.
- One thing I can't rule out from here: RevenueCat itself not reporting the entitlement on Ryan's device (e.g. entitlement named something other than premium / totland_pro / pro). If so, games would be locked even right after a fresh launch.

## 5. Reproducible here?

Not on the device — no RevenueCat in the browser preview. The logic path is confirmed by reading the code and the database. I need from Ryan:
1. After **force-closing and reopening** the app (without visiting the parent area), are Premium games unlocked? Yes → Bugs A/B. No → RevenueCat entitlement problem as well.
2. Was the subscription bought in TestFlight or restored? Was Restore Purchases tried?
3. Signed into a grown-up account in the app, or not?
4. The entitlement name in the RevenueCat dashboard.

## Proposed fix (needs approval — subscription code)

1. Subscription page sets the game flag to `account active OR store active`, never the backend answer alone.
2. After a successful store purchase or restore, set the game flag to true immediately.
3. App launch check: keep the store answer; the backend may only add Premium, never remove a store "yes".
4. Tests: store yes + backend no → unlocked; purchase/restore → unlocked without relaunch; sign out with no store entitlement → locked.
5. Separately investigate why App Store purchases never reach the backend (webhook setup in RevenueCat). Doesn't block the fix, since the device's store answer is enough.

No changes to pricing, the parental gate, or free/Premium flags.
