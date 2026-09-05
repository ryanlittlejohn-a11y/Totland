# Roadmap

## Payments (approved plan)
- [x] Enable built-in payments (Paddle)
- [x] Create products: Premium Monthly $2.99/mo, Premium Yearly $19.99/yr
- [x] Checkout utilities: src/lib/paddle.ts, price resolver server fn, test-mode banner
- [x] Wire parent.subscription.tsx to real checkout (parent gate stays in front)
- [x] Unlock premium on checkout completion (local profile, offline-friendly)
- [x] Test full flow in test mode — checkout opens with correct products/pricing
- [ ] Optional later: Lovable Cloud + webhook to restore premium across devices (needs user accounts)
- [ ] Go live: verify identity in Payments tab, publish (products sync to live automatically)
