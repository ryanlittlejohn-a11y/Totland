# Roadmap

## Payments (approved plan)
- [x] Enable built-in payments (Paddle)
- [ ] Create products: Premium Monthly $2.99/mo, Premium Yearly $19.99/yr
- [ ] Checkout utilities: src/lib/paddle.ts, price resolver server fn, test-mode banner
- [ ] Wire parent.subscription.tsx to real checkout (parent gate stays in front)
- [ ] Unlock premium on checkout completion (local profile, offline-friendly)
- [ ] Webhook handler at /api/public/payments/webhook (needs Lovable Cloud for subscriptions table — confirm)
- [ ] Test full flow in test mode
- [ ] Business logic: purchase unlocks all premium; cancel keeps access until period end; monthly/yearly switch prorated (confirm with user)
