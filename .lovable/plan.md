# Move the Premium pitch off the child home screen

## What changes in `src/routes/index.tsx`

1. **Remove the whole "Totland Premium" section** (lines 256–293): the description with the hardcoded "Cancel anytime through Paddle" copy, the offline-play line, the $2.99 / $19.99 price cards, the refund-policy link, and the "Get Premium" button.

2. **Replace it with one small, non-transactional card** — a single compact row (gift/sparkle emoji + one friendly line like "Ask a grown-up about Totland Premium" / Spanish equivalent via `L()`), no prices, no payment-provider names, no purchase button. Tapping it links to `/parent`, which sits behind the existing parental gate — never directly to `/parent/subscription`.

## Locked-world tiles — recommendation

The locked learning-world rows further down currently link straight to `/parent/subscription`. `/parent/subscription` is a child of the `/parent` layout, so the gate still intercepts it — a child tapping a lock hits the multiplication question before any purchase UI. So it's technically safe today. **Recommendation: still reroute them to `/parent`** for consistency with the new hint card and to make the gate-first flow explicit and immune to future routing changes. This is a one-line change per tile (`to="/parent"`, drop the params); it does not touch `/parent/subscription.tsx` itself.

## What stays untouched

- `/parent/subscription.tsx` and everything under `/parent/` — already platform-aware (Paddle on web, StorePurchasePanel on native) and behind the gate.
- The parental gate, RevenueCat/Paddle logic, OfflineGate, premium logic.
- Web behavior otherwise unchanged.

## JSON-LD offers block

**Leave it as-is.** The `SoftwareApplication` structured data with prices is machine-readable metadata for search engines, not user-visible content — it never renders on the child screen and isn't "in-app purchase promotion" in Apple's sense. Standard practice; no change needed.

## Verification

- Typecheck + build clean.
- Playwright at phone size: home screen shows no prices or "Get Premium"; the small hint card routes to `/parent` and hits the gate; a locked world tile also lands on the gate; premium users see no hint/locks as before.

## Changed files

- `src/routes/index.tsx` only.

No steps needed outside Lovable.
