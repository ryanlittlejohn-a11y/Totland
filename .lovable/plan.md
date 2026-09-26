# Blast radius: missing `x-tsr-serverfn` permission in the native app

## Short answer
Every one of the app's 9 server calls sends the same `x-tsr-serverfn` header, so from the phone app **every one of them is blocked before it reaches the server**, reads (GET) and writes (POST) alike. The allowed-header list in `src/start.ts` only includes `authorization, content-type, x-tsr-redirect, accept`. Capacitor plugin calls (RevenueCat, the in-app browser, sign-in itself, and direct backend calls made through the normal backend client) don't go through this and are unaffected.

## Call-by-call

| # | Call | What it does | Used in the phone app? | What happens today when it fails |
|---|------|--------------|------------------------|----------------------------------|
| 1 | `deleteMyAccount` | Deletes the account | Yes | Visible failure: "DEL-NET" (the confirmed bug) |
| 2 | `getMySubscription` (useEntitlementSync) | Asks the server whether this account has Premium | Yes, runs on every launch, on sign-in/out, and when the phone comes back online | **Silent.** The error is swallowed as a "network hiccup" |
| 3 | `getMySubscription` (subscription screen) | Shows plan status, renewal date, "canceling" / "past due" notices | Yes | Silent. Logged to the console; the screen shows no server plan details |
| 4 | `listChildren` / `upsertChild` / `deleteChild` (useChildSync) | Keeps child profiles and progress in sync with the family account | Yes, every 60s while signed in | **Silent.** Errors are swallowed and play continues from the phone's own copy |
| 5 | `speakText` | Fetches a narration line that isn't already stored | Rarely. Normal narration plays from the bundled approved clips | Silent. Returns nothing, and further voice requests are turned off for the session |
| 6 | `submitContactInquiry` | Contact form | Yes, if a parent opens Contact inside the app | Visible: "We couldn't send your message right now" |
| 7 | `resolvePaddlePrice` | Web checkout price check | No. Paddle only runs on the website | None on the phone |

## getMySubscription: failing the whole time, and it does matter
Yes. It has almost certainly failed on every native launch since the allowed-header list was added. For App Store buyers the failure is **hidden**, because RevenueCat is checked first and returns early. The real gaps are elsewhere:

1. **Premium bought on the website doesn't carry over to the phone.** A parent who subscribed through Paddle on totland.app and signs in on the phone never gets Premium there. RevenueCat knows nothing about that purchase, and the server check that would grant it is the one being blocked. This is a real, unnoticed bug.
2. **A lapsed store subscription isn't cleared by the server.** This does no harm today, because Premium is kept only in memory (never trusted from storage) and starts as "not Premium" on each launch.
3. **Subscription screen is incomplete on the phone.** Status, renewal date and cancel/past-due notices from the server never show. App Store buyers still see "active" through RevenueCat (`storeActive`), so this has gone unnoticed.
4. **Sign-out safety net never runs.** The "session was rejected, so sign out locally" branch never runs on the phone, because the error is a blocked request, not "unauthorized". Minor.

## useChildSync: a second hidden bug
Child profile sync has never worked from the phone. Progress made in the app never reaches the account, and children added on the website or another device never appear. Nothing shows an error. This also explains a result from the deletion testing: the child profiles that came back during deletion were re-created by the **website** sync in the test browser, not by the phone. On the phone, sync can't interfere with deletion today. Once the fix goes in it can, and the server-side final sweep we already added covers that.

## What the header fix will change on the phone (all expected, but worth knowing)
- Account deletion works.
- Website-bought Premium starts working on the phone after sign-in.
- Child progress starts syncing for signed-in parents. On first sync, the phone's local children are pushed up and the account's children are merged in. Existing phone-only progress is kept, because local changes are marked "unsynced" and uploaded rather than overwritten.
- The subscription screen shows full plan details.
- Contact form works in the app.

None of this touches payments, RevenueCat, Paddle, pricing, sign-in, or the parental gate. It is a one-line server permission change.

## Proposed fix (awaiting approval)
- `src/start.ts`: add `x-tsr-serverfn` to `access-control-allow-headers` for the native origins only.
- Verify with a throwaway account by sending native-origin (`capacitor://localhost`) preflight + real requests for: account deletion, subscription check, child list/save/delete, and the contact form. Confirm website requests are unchanged.
- Then a new Codemagic build + TestFlight: deletion, a website-Premium account signing in on the phone, and child sync across phone and website.

## Technical notes
- Any request header outside the CORS safelist (here `x-tsr-serverfn`) triggers a preflight, whether the request is a GET or a POST. So the GET server functions are blocked too, not only POSTs.
- useEntitlementSync and useChildSync only treat `/unauthorized|invalid token/` as special. A blocked request surfaces as a `TypeError` and falls into the "keep last answer / keep local copy" branch.
