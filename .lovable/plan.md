# Show the real reason the subscription options won't load (phone app only)

## What I found

- The message comes from the subscription panel inside the parent area. It only appears when the store setup or the "get subscription options" request **fails outright**. If the store answers but sends back no products, the panel doesn't show this message. It shows the two price cards greyed out instead.
- So on your phone, RevenueCat is returning an **error**, not an empty list. The most common cause is RevenueCat error **23, "configuration error"**, with a message like "None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect." That points to App Store Connect setup: the Paid Apps Agreement isn't active, the products are still "Missing Metadata" or not "Ready to Submit", or the product IDs don't match.
- Warning: an older launch checklist used the IDs `premium_monthly` / `premium_yearly`. The app now expects different IDs (below). If RevenueCat or App Store Connect still uses the old names, nothing will match.

## IDs the app expects (check these in your dashboards)

| What | Exact value |
|---|---|
| Monthly product ID (App Store Connect and RevenueCat) | `totland_premium_monthly` |
| Yearly product ID (App Store Connect and RevenueCat) | `totland_premium_yearly` |
| Entitlement ID (RevenueCat) | `premium` (lowercase) |
| Offering | must be set as the **Current** offering in RevenueCat and contain both products as packages |
| iOS app key | the `appl_...` key set in Codemagic as `VITE_REVENUECAT_IOS_KEY` |
| Bundle ID | `app.totland.kids` |

## What I'll change (temporary, phone app only)

1. Add a single on/off switch for store diagnostics, clearly labelled so it's easy to remove later.
2. When loading fails, keep the friendly message and add a small, readable detail box under it that shows:
   - which step failed (store setup or loading the options)
   - RevenueCat's error code, its error name and message, and the underlying store error if there is one
3. Even when loading works, the box shows what came back: the current offering's name, how many packages it has, each product ID found, and whether that ID matches the two IDs the app expects. This catches the "loaded but no matching products" case, which currently fails without any message.
4. The box also shows whether the iOS key is present (only the `appl_` prefix, never the full key).
5. The website never shows this box. The parental gate, Premium rules, purchase and restore logic, and Paddle checkout stay unchanged.

## Technical details

- `src/components/StorePurchasePanel.tsx`: record the failing step plus a safe JSON summary of the error (`code`, `message`, `readableErrorCode`, `underlyingErrorMessage`), and render it only when `isNativeApp()` and the flag are both true.
- `src/lib/purchases.ts`: add a read-only `describeOfferings()` helper that returns the current offering id, package ids and product ids, without changing `listStoreOffers()`.
- `roadmap.md`: add the task plus a follow-up to remove the diagnostics.
- Verify with typecheck and build, plus Playwright on the website to confirm the page looks exactly the same.
- Outside Lovable: run `bun run sync:app`, start a new Codemagic build, then screenshot the subscription page.
