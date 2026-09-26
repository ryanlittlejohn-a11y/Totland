# Account deletion still failing on TestFlight: findings and next steps

## Finding 1: Is the live site running the fix? Yes, as of now (tested directly)

A preflight sent to https://totland.app just now, as if from the phone app, came back correct:
- 204, `access-control-allow-origin: capacitor://localhost`
- `access-control-allow-headers: authorization,content-type,x-tsr-redirect,x-tsr-serverfn,accept`

So the permission fix is live now. I can't tell from here whether it was already live when you tested. If you published after you ran that TestFlight test, the test hit the old site and will fail differently when you retry. The phone app sends every server call to totland.app, so what counts is the live site, not the app build.

**New problem found in the same test:** when a server call fails on the live site, the error reply has no permission header for the phone app. A test call came back `500` with an HTML "This page didn't load" page and no `access-control-allow-origin`. The phone's web view hides any reply without that header and reports it as a network failure. So **any server-side failure shows up as DEL-NET on the phone**, even with the preflight fixed. DEL-NET no longer proves there's a connection problem.

The most likely server-side failure is a **mismatch between the app build and the live site**. Each server call is addressed by an ID made during the build. If the TestFlight app and the published site came from different builds, the phone asks for an ID the live site doesn't have. That gives the same 500 we saw in dev after a restart, and on the phone it looks like DEL-NET. This isn't confirmed yet. The TestFlight bundle and the live site need to be compared (step 1 below).

## Finding 2: What caused the sign-out? Narrowed down, not confirmed

- **Deletion code: ruled out.** `doDelete` only signs out after the server confirms the deletion worked. On DEL-NET it never gets there.
- **Sign-in check before deletion: ruled out.** If that check had signed you out, you'd see "Your sign-in has expired", not DEL-NET.
- **Background checks (Premium check and child sync): ruled out for this error.** They only sign out when the error text says "unauthorized" or "invalid token". An HTML 500 page, or a reply the phone blocked, doesn't match.
- **Most likely cause: two sign-in refreshes at once.** `doDelete` forces a refresh first (`refreshSession()`). The sign-in system may also be refreshing on its own at the same moment, when the app comes to the front or the 60-second child sync runs. If both use the same one-time refresh token, the backend treats it as reused and **ends the session on the server**. The app then signs out. That fits "signed out afterward, never before", because the forced refresh is new in the last deletion fix. It's the same kind of bug as the earlier Apple sign-in issue: the session really gets ended on the backend.
- The backend's sign-in logs for the last 72 hours came back empty to my query, so I can't confirm this from logs yet.

## Proposed steps (need your approval: this touches sign-in and account deletion)

1. **Confirm the build match (no code change).** Compare the server call IDs in the TestFlight/Codemagic bundle with the published build. If they differ, fix the release process so the site is published from the same code before every Codemagic build. Then retest.
2. **Add the permission header to error replies for the phone app** (`src/start.ts`, same middleware). Real server errors would then show their actual code (like DEL-500) instead of DEL-NET. No change to which websites are allowed.
3. **Remove the forced `refreshSession()` from `doDelete`.** Rely on the existing check, which already refreshes when needed. This takes away the likely cause of the refresh collision and the sign-out.
4. **Add a clear log line** when the app signs out for any reason, naming where it came from (deletion, Premium check, child sync, sign-in check). The next TestFlight run then shows exactly what happened.
5. Verify with throwaway accounts: a simulated phone call to a stale ID now shows the real code, deletion works end to end, and no sign-out happens during two refreshes at once.

Not touched: RevenueCat, Paddle, pricing, the parental gate.

## Technical details
- Live preflight: 204 with the correct allow-headers. A POST to `/_serverFn/abc` from `capacitor://localhost` returns 500 HTML with no ACAO, so WebKit throws TypeError and the code maps that to DEL-NET.
- `nativeCorsMiddleware` adds ACAO only on the success path. Error/500 responses produced outside it are missing the header.
- Sign-out sources: verifiedSession.ts (3 places), useEntitlementSync.ts:75, useChildSync.ts:95, native-oauth.ts:85, parent.subscription.tsx:161/363.
