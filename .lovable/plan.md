# Subscription-screen clarity and management

## Part A — make account deletion unambiguous

Replace the current warning with concise copy that separates account data, store billing, and device-only play data:

> This permanently deletes your grown-up account and child profiles saved to it. It does not cancel an App Store or Google Play subscription, and it does not erase play progress or stars stored on this device. This cannot be undone.

- When a subscription is active, keep the existing highlighted billing warning immediately below this explanation, but tighten it to direct the parent to **Manage subscription** before deleting.
- Update the success message so it does not imply that store billing or device-only progress was removed.
- Preserve the typed `DELETE` confirmation and all deletion behaviour.

## Part B — add a real native “Manage subscription” button

The installed RevenueCat library already returns `CustomerInfo.managementURL`. This is a real, store-selected management destination:

- **iOS/iPadOS:** the App Store subscription-management destination.
- **Android:** the Google Play subscription-management destination, normally scoped to the relevant subscription/account.
- RevenueCat chooses the current device’s store when subscriptions exist on more than one platform.
- It returns `null` when there is no manageable active store subscription.

Implementation:

1. Extend the existing native purchase helper to retrieve the current customer’s `managementURL` from RevenueCat.
2. In the native Premium-active panel, show **Manage subscription** only when that real URL exists.
3. Open that URL through the existing Capacitor Browser integration so the parent reaches the store-provided management destination; report a plain error if opening fails.
4. Keep concise fallback instructions when no management URL is available, including the case where Premium came from the website rather than the device store.
5. Do not change RevenueCat configuration, products, prices, Paddle, entitlement rules, purchases, restores, or the parental gate.

## Part C — backlog only

Add two unchecked roadmap notes without implementing either feature:

- Letter/Number Pop choice-engine games: make a correctly selected tile visibly pop and disappear instead of leaving it under a green checkmark.
- Hunt-engine games, including Alphabet Safari and Letter Detective: investigate why completing every target does not advance to the next round or reward screen, then fix it.

## Verification

- Confirm deletion copy accurately covers account/child cloud data, store billing, and device-only progress in active and inactive subscription states.
- Simulate native iOS and Android customer information and verify the button uses RevenueCat’s returned store URL.
- Verify the button is absent and fallback wording remains useful when `managementURL` is `null` or Premium is website-backed.
- Verify opening failures are visible and no inert button is shown.
- Confirm website subscription handling is unchanged.
- Confirm both roadmap entries are present and no game code changed.

## Expected changed files

- `src/routes/parent.subscription.tsx`
- `src/lib/purchases.ts`
- `roadmap.md`
