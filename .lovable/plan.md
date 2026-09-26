# Subscription screen: three TestFlight fixes

Heads-up: fix 1 touches how Premium is checked at app start. That's one of your approval-required areas, so it's called out here. Fixes 2 and 3 only change wording and links.

## 1. Premium families briefly see the offline screen (bug)

**What's happening (confirmed by reading the code):**
- When the app opens, the Premium flag always starts as "not Premium". That's deliberate: we never trust a Premium value saved on the device.
- The app-start Premium check (`useEntitlementSync`) then asks RevenueCat for the Premium status it keeps on the device. This takes time: setting up RevenueCat and reading the status can each take up to 5 seconds.
- The offline screen (`OfflineGate`) doesn't wait for that check. It decides as soon as the family's saved profile has loaded. In airplane mode the phone's network check says "not connected" right away, so the gate shows "Totland needs internet" while Premium still reads as off.
- Once RevenueCat answers, Premium turns on and the gate lets the app through. That's why tapping retry seemed to fix it.

**Proposed fix:**
- Add a "Premium check finished" signal next to the existing Premium flag. It turns on after the first app-start check ends, whether the answer is Premium, not Premium, or timed out.
- The offline screen waits for that signal before it decides. Until then it shows the normal app, not the offline screen. It never shows the offline screen before the check finishes.
- Order at launch: first read the Premium status saved by RevenueCat, then decide if the device is offline. A Premium family in airplane mode goes straight into the app.
- Safety cap: the check is already limited to about 10 seconds in total. After that the signal turns on anyway, so free families offline still get the offline screen and never a blank page.
- No change to what counts as Premium. We still never read Premium from the app's own saved data. The website still only trusts the server.

## 2. "your the App Store account" (copy bug)

The shop name is stored as "the App Store", and the fine print puts "your" in front of it. Two places are affected:
- `StorePurchasePanel.tsx`: the fine print shows the phrase twice ("subscribe and restore with your …", "charged to your …").
- `parent.subscription.tsx` also uses "the App Store" in two sentences. Both currently read correctly ("in the App Store", "manage subscriptions in the App Store"), so they stay as they are.

Fix: store the plain name ("App Store" / "Google Play") and add "the" only where a sentence needs it. The fine print will then read "your App Store account". I'll search again afterwards to confirm the broken phrase is gone everywhere.

## 3. Terms and Privacy links on the purchase screen (Apple Guideline 3.1.2)

**Findings:**
- The in-app purchase box (`StorePurchasePanel`) has no Terms or Privacy links. Near the Subscribe buttons it only shows the prices, Restore, and the auto-renew fine print.
- Links to Terms, Refund, and Privacy do exist on the same subscription page, but only in the footer at the very bottom, below the account and privacy sections. They're far from the Subscribe buttons, which is the kind of placement Apple reviewers flag.
- Apple also expects the plan name, length, and price shown clearly. We already show those ("$2.99 per month", "$19.99 per year").

**Proposed fix:** add one line directly under the auto-renew fine print in the purchase box: "By subscribing you agree to our Terms of Use and Privacy Policy." Both are working links to the existing `/terms` and `/privacy` pages. They sit inside the grown-up area, which is already behind the parental gate. The footer links stay.

## Checks after building
- Simulate a cold launch in the preview with the device offline and RevenueCat's answer delayed. Confirm the offline screen never appears for Premium, and still appears for a free family once the check ends.
- Screenshot the purchase box: correct fine print, visible Terms/Privacy links, and both links open the right pages.
- Recommended: one real TestFlight cold launch in airplane mode (needs a new app build).

## Files
- `src/lib/profile.ts`: add the "check finished" signal and a hook to read it
- `src/hooks/useEntitlementSync.ts`: turn the signal on after the first check
- `src/components/OfflineGate.tsx`: wait for the signal
- `src/components/StorePurchasePanel.tsx`: fix the store name and add the Terms/Privacy line
- `src/routes/parent.subscription.tsx`: store name wording only, same sentences as now
