# Fix: Sign in with Apple returns to the sign-in form (native app)

Sensitive area: this touches sign-in/session code. Nothing will be implemented until you approve.

## What happens today (traced in code)

```text
App: Continue with Apple -> in-app browser sheet -> hosted Apple sign-in
Website page /auth/native-return (inside the sheet):
   1. reads the new session's tokens
   2. calls signOut({ scope: "local" })   <-- "don't keep a web session on this sheet"
   3. redirects to app.totland.kids://auth-callback#access_token..&refresh_token..
App (native-shell -> completeNativeOAuth):
   4. setSession(tokens) -> SIGNED_IN event
   5. useEntitlementSync hears SIGNED_IN -> logInPurchases(userId)  (RevenueCat link succeeds)
   6. then verify() -> hasVerifiedSession() asks the backend "is this session valid?"
   7. backend says no (session was ended in step 2) -> app clears the sign-in locally
   8. SIGNED_OUT -> useParentAuth sets user = null -> "Sign in to manage your subscription" again
```

## Root cause

Step 2. In the auth library, `signOut({ scope: "local" })` is not only a local cleanup: when a session exists it also calls the backend logout endpoint, which ends that exact session on the server. The browser sheet and the app share the same session (the sheet hands its tokens to the app), so the sheet's "tidy up" kills the session the app is about to use. It is also fired without waiting, right before the redirect, so it races the app.

That explains the discrepancy precisely:
- The app briefly holds a session: its access token still looks valid for a moment, so `setSession` succeeds and SIGNED_IN fires. That is why `logInPurchases(userId)` ran and the purchase linked (RevenueCat keeps that link afterwards).
- Right after, `hasVerifiedSession()` (and the same check in `useChildSync`) asks the backend, gets a "session not found" rejection, and clears the sign-in on the device by design. The screen correctly follows that cleared state and shows the form again.

So the screen itself is not stale: `useParentAuth` in `parent.subscription.tsx` does listen for sign-in changes. It just gets SIGNED_IN and then SIGNED_OUT almost straight away.

Confidence: high from reading the code and the library's sign-out behavior, but not reproduced on a device. The browser preview cannot run this native deep-link flow.

## Proposed fix (small, one file)

`src/routes/auth.native-return.tsx` only:
- Remove the `supabase.auth.signOut({ scope: "local" })` call.
- Replace it with a device-only cleanup that never contacts the backend: remove the sheet's saved sign-in entry from the sheet's own browser storage. The storage key is read from the client's configured storage key, not hard-coded. The in-app browser's web storage stays separate from the app, so the purpose ("don't leave a web login in the sheet") is kept.

Not changed: `native-oauth.ts`, `native-shell.ts`, `useParentAuth`, `ParentAuthCard`, `useEntitlementSync`, `hasVerifiedSession`, RevenueCat logic, Paddle, the parental gate, or website sign-in. Rejecting a truly bad session and clearing it locally stays exactly as it is.

## Optional hardening (only if you want it; say so)
- In `completeNativeOAuth`, after `setSession`, confirm the session with the backend once. If it fails, show "Apple sign-in didn't work" instead of flashing a signed-in state. I'd skip this unless you want it, to keep the change minimal.

## Verification after approval
- Code check that nothing else calls the backend logout during the native return.
- Preview: load `/auth/native-return?n=<nonce>#access_token=..` with a real test session. Confirm it redirects to the app link and that the session is still valid on the backend afterwards (a follow-up `getUser` succeeds). Before the fix, the same test should show the session ended.
- Website sign-in regression check (email and Google on the website still land signed in).
- Real confirmation still needs a new Codemagic build and a TestFlight Sign in with Apple test. It should land on "Your account - Signed in as ..." and stay there after leaving and reopening the screen.

## Files to change
- src/routes/auth.native-return.tsx
