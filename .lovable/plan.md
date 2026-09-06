# Offline play becomes a premium feature

Free families can play Totland whenever they have internet. Playing without internet becomes part of the paid plan, alongside the premium worlds and games they already get.

## What changes for families

**Free, with internet:** everything works exactly as it does today.

**Free, no internet:** instead of a broken page, a warm Totland screen appears — the mascot, a short line like "Totland needs internet to play right now", a "Try again" button, and a quiet grown-up link to the premium page. No games, no menus.

**Premium, no internet:** full offline play, exactly as it works today.

**Subscription ends:** the next time the app reaches the internet it checks the subscription, sees it has ended, and offline play stops from then on. No grace period.

**Installing to the home screen:** unchanged and still offered to everyone. Free families can still install the app; it simply needs internet to play.

## Where premium gets described

- Home page premium section: add "Play anywhere, even with no internet" to the list of what premium includes.
- Grown-up subscription page: same line in the feature list.
- The offline screen free families see: one sentence pointing grown-ups to premium.

## Technical notes

- Offline capability stays a single generated service worker (unchanged `vite-plugin-pwa` config and the existing guarded `registerPWA` wrapper). Gating happens in the app, not by swapping service workers per user — that keeps the preview guards and update behavior intact.
- New `useOnlineStatus` hook plus an `OfflineGate` wrapper rendered in `src/routes/__root.tsx` around `<Outlet />`. It blocks the app when `navigator.onLine === false` **and** the locally cached, server-verified `profile.premium` is false, and renders the friendly screen instead. Legal routes (`/terms`, `/privacy`, `/refund`) and the grown-up subscription route stay reachable if cached.
- Entitlement stays server-truth: `useEntitlementSync` already overwrites the local `premium` flag on every online check and on sign-in/sign-out, so an expired subscription disables offline play at the next online check with no extra work.
- Copy additions go in `src/routes/index.tsx`, `src/routes/parent.subscription.tsx`, and the new offline component, all bilingual through the existing `L()` helper.

## Honest limitation

Because all game content ships inside the app bundle for speed, a determined technical user could still reach cached files with the browser's developer tools. The offline screen is a product gate, not a lock — the same trade-off that already applies to the premium games.
