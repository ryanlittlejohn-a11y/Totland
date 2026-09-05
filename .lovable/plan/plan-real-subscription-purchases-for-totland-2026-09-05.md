# Plan: Real Subscription Purchases for Totland

## Goal
Replace the demo premium toggle on the Subscription page with real, purchasable subscriptions — starting in test mode, then live.

## Recommended provider: Seamless Payments (Paddle)
The eligibility check classified Totland as a standard first-party educational software subscription, which fits Paddle well:

- **No account setup needed** — no Stripe/Paddle account or API keys required from you; it's built into Lovable.
- **Paddle is the legal seller (merchant of record) on every transaction** — it handles all sales tax calculation, collection, filing, and remittance worldwide, plus chargebacks, refunds, and billing-related customer support automatically. For a US seller, this removes the need to register for sales tax in dozens of states and countries yourself.
- **Pricing:** 5% + 50¢ per transaction, all-inclusive, no surcharges.
- Customer bank statements show Paddle alongside your brand name; Paddle handles billing support, you handle product support.

**One important warning:** because of the product type (kids' educational app), Paddle requires a **manual review after you go live**, and approval is not guaranteed. Test mode works immediately; the review happens when you claim your live account.

## What will happen when we enable
1. A **test environment** is created instantly — you can run full checkout flows with test cards, no real money.
2. **Live payments** require you to complete Paddle's verification/review step later (business details, then their product review).

## Build steps (after you approve)
1. Enable the built-in payments integration (one click, no keys).
2. Create two subscription products:
   - **Premium Monthly — $2.99/month**
   - **Premium Yearly — $19.99/year**
3. Wire the existing Subscription page (`parent.subscription.tsx`) to real checkout:
   - Replace the demo toggle with "Subscribe" buttons that open checkout.
   - Keep the parent gate in front of all purchase actions (kids can never reach checkout).
4. Handle the purchase confirmation webhook so premium unlocks reliably after payment (this needs Lovable Cloud to store subscription status — free tier covers this).
5. Sync premium state with the existing local profile so unlocked games work offline after purchase.
6. Test the full flow in test mode: parent gate → checkout → premium unlocked.

## What stays the same
- All kid-facing content, rewards, and offline behavior.
- The free tier of games remains free.
- Privacy posture: no ads, no tracking; payment data is handled entirely by Paddle, never touches the app.

## Notes
- If the long-term goal is a native iOS app on the App Store, Apple will require StoreKit for digital content on iOS. This web checkout works for the web/PWA version today; StoreKit remains the path for the native build later.
