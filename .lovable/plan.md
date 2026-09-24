# Fix "Continue with Apple / Google" opening a 404 in the phone app

## What's wrong

- The Apple and Google buttons live in the grown-up sign-in card (`ParentAuthCard`, on the Subscription page behind the parental gate). Both call `lovable.auth.signInWithOAuth(...)`.
- That sign-in helper was built for websites only. When the page isn't inside a frame, it just sends the current page to the *relative* address `/~oauth/initiate?...`.
- On the website, `totland.app/~oauth/initiate` is handled by the hosting layer, so it works. In the iPhone app the page's address is `capacitor://localhost`, so that relative link becomes `capacitor://localhost/~oauth/initiate`. Nothing inside the app answers there, so you get the 404. The return address it sends (`capacitor://localhost/parent/subscription`) is also one the sign-in service would never accept.
- So this flow was never set up for the phone app. It was web-only from the start, and Google sign-in in the app is broken the same way. The React #418 message is noise from that 404 page.

## The fix (phone app only)

In the phone app, the Apple and Google buttons will stop moving the app's own screen. Instead:

1. The app creates a random one-time code and opens Apple's/Google's real sign-in page in a secure in-app browser sheet. On iOS that's the standard Safari sheet, which Apple accepts for this.
2. The sheet opens `https://totland.app/~oauth/initiate?provider=apple&redirect_uri=https://totland.app/auth/native-return?n=<code>`. It's the same sign-in service the website already uses, and `totland.app` is already on the allowed list.
3. When sign-in finishes, a small new page `/auth/native-return` on the website picks up the new session. It then hands it back to the app through the app's existing link scheme: `app.totland.kids://auth-callback?n=<code>#tokens`.
4. The app's existing deep-link handler catches that link. It checks that the code matches the one it created (so another app can't slip in a fake login), saves the session, closes the sheet, and goes back to the Subscription page. Family sync and the RevenueCat log-in then happen the way they do on the website.
5. If the grown-up closes the sheet or something fails, they see the same friendly "didn't work, try email" message. Email/password sign-in in the app keeps working as it does today.

The website won't change. The website buttons go through the exact same code path as today, and the new return page only does anything when it has the app's one-time code.

## What this needs

- **One new official Capacitor plugin: `@capacitor/browser`.** It's what opens the secure sign-in sheet. It's made by the Capacitor team and doesn't track anyone. Your rules say to name every Capacitor plugin, so I need your OK on this one.
- **No new domains or associated-domain setup.** The app already registers the `app.totland.kids://` link in its settings, and that's what brings the grown-up back.
- **No changes on your side for sign-in settings.** `totland.app` is already an allowed return address. There's nothing to set up in any dashboard.
- **Outside Lovable:** run `bun run sync:app`, then start a new Codemagic build. This build includes a new native plugin, so a clean pod install is needed.

## To confirm first while building

Before I finish the return page, I'll check exactly how the sign-in service hands the session back to `https://totland.app/auth/native-return` (in the address or as a normal saved session). The page is written to handle both, but I'll test it rather than assume.

## Note on the Apple sign-in sheet

This uses Apple's web sign-in in a Safari sheet, not the built-in iOS Face ID sheet. Apple allows this, and it meets the rule that apps offering Google sign-in must also offer Apple. The built-in sheet would need your own Apple Developer sign-in key set up in the backend, which is a bigger change. We can do it later if you want.

## Technical details

- New `src/lib/native-oauth.ts`: `nativeSignInWithOAuth(provider)` generates a nonce and stores it in sessionStorage/Preferences. It then calls `Browser.open({ url: "https://totland.app/~oauth/initiate?..." })` using `DEFAULT_API_ORIGIN` from `native.ts`, and returns a promise settled by the deep-link handler or `browserFinished`.
- `src/components/ParentAuthCard.tsx`: `if (isNativeApp()) nativeSignInWithOAuth(...) else lovable.auth.signInWithOAuth(...)` (the web branch stays exactly as it is). The file under `src/integrations/lovable` isn't touched.
- New public route `src/routes/auth.native-return.tsx` (with SSR off and a head title). It reads tokens from the URL hash, or else from `supabase.auth.getSession()`, and only when an `n` param is present. It then sets `window.location` to `app.totland.kids://auth-callback?n=..#access_token=..&refresh_token=..`, with a fallback "Return to Totland" button.
- `src/lib/native-shell.ts` `handleDeepLink`: handle host `auth-callback`. It checks the nonce, calls `supabase.auth.setSession`, runs `Browser.close()`, and navigates to `/parent/subscription`. The premium/subscription deep links stay unchanged.
- `package.json`: add `@capacitor/browser@^7`. Update `roadmap.md`.
- Verification: typecheck and build. Playwright with a fake native `window.Capacitor` to confirm the button calls Browser.open with the https URL and never navigates to `capacitor://localhost/~oauth`. A simulated `appUrlOpen` with a matching or mismatched nonce to confirm the session is set only on a match. A website check to confirm the website still goes to `/~oauth/initiate`.
- The parental gate, Paddle, RevenueCat and premium logic won't be touched.
