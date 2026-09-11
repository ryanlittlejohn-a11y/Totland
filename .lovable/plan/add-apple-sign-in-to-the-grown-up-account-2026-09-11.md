# Add Apple sign-in to the grown-up account

Parents can already sign in with email/password or Google on the Subscription page. This adds "Continue with Apple" alongside them.

## What changes

- A new "Continue with Apple" button appears in the grown-up sign-in card, below the Google button, matching the existing style.
- Signing in with Apple creates or reuses the same grown-up account and returns the parent to the Subscription page, exactly like Google does today.
- Apple sign-in is turned on for the app's login system in the same step, so it works the first time it's tapped.
- Nothing changes for children: they still never sign in.

## Notes

- Apple hides email addresses when a parent chooses "Hide My Email". Their account still works for subscribing and restoring purchases; the email shown on the account card will be Apple's private relay address.
- Apple requires Apple sign-in in the iOS app whenever other social logins are offered, so this also keeps the App Store submission compliant.

## Technical details

- `src/components/ParentAuthCard.tsx`: add an Apple button calling `lovable.auth.signInWithOAuth("apple", { redirect_uri: `${window.location.origin}/parent/subscription` })`, reusing the existing error handling pattern from the Google handler.
- Call `supabase--configure_social_auth` with `providers: ["apple"]` in the same change (Lovable-managed Apple credentials, no Apple Developer key entry needed).
- No database, entitlement, or subscription logic changes; verified-email gating and Paddle/RevenueCat flows are untouched.
