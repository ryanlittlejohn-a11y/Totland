# Account deletion failure on TestFlight — findings and fix plan

## What I found

1. **The message is not a real connection check.** The delete screen shows "please check your connection" for *any* failure — a sign-in problem, a server error, a blocked request or a real network drop all look identical. So the wording says nothing about the actual cause.
2. **The request never reached the data-deletion step.** Backend records for the last 72 hours show **no deletion attempts at all** — nothing for child profiles, subscriptions or the account itself. So the failure happened *before* the server started deleting: either the request never arrived, or it was rejected at the sign-in check at the door.
3. **Nothing was left half-deleted.** Every recent account is still fully in place (the most recent one still has all 11 child profiles and its subscription record). The failed attempt left no inconsistent data.
4. **The active subscription is not what blocked it.** That account's "active" status on the phone comes from the App Store purchase (RevenueCat), which is not stored in our account data at all, so it cannot block deletion. Linked contact-form messages are set to be kept but unlinked, and child profiles/subscription rows have nothing preventing removal. Accounts with these attachments should delete normally.
5. **Server error logs only go back one hour**, so I can't see the original failed request. The most likely causes, in order:
   - **Sign-in rejected at the door (most likely).** The app sends the saved sign-in with the request; if the backend no longer accepts it (e.g. the sign-in was ended by the old in-app-browser sign-out bug we just fixed, or it expired and wasn't refreshed), the server refuses before deleting anything — which matches "zero deletion attempts".
   - **The request didn't reach the live server in the form expected** (the app sends it cross-site from inside the phone to totland.app).
   - Diagnosis is **unconfirmed** until we capture the real error — this plan makes that the first step.

## Proposed fix (needs your approval — touches account deletion and sign-in checks)

1. **Show the real reason, in plain words.** Tell apart "you're offline", "your sign-in has expired — please sign in again", and "something went wrong on our side (code …)". Log the real error so it's visible next time.
2. **Confirm the sign-in right before deleting.** Refresh/verify it with the backend first (the same check the app already uses elsewhere); if it's no longer valid, ask the grown-up to sign in again instead of failing.
3. **Make the server side all-or-nothing in practice.** Delete the account login *last* only after child profiles and subscription records are gone, and if the final step fails, report it clearly; on retry, already-removed data is simply skipped. Also clean up the linked contact-form messages' link (already automatic).
4. **Reproduce and verify** in the preview with a real signed-in test account: a stale/expired sign-in now shows "please sign in again"; a valid one deletes profiles, subscription record and account, then shows "Your account has been deleted". I'll use a throwaway test account I create, never your real one.
5. You'll then need a new Codemagic build and a TestFlight retry to confirm on device before resubmitting (Guideline 5.1.1(v)).

## Technical details

- Client: `src/routes/parent.subscription.tsx` `doDelete` catches everything into one string. Change to classify: `navigator.onLine === false`, 401/Unauthorized Response from `requireSupabaseAuth`, other (show short code). Call `hasVerifiedSession()` / `supabase.auth.refreshSession()` before `removeAccount`.
- Server: `src/lib/account.functions.ts` — keep order (children via user client, subscriptions + `auth.admin.deleteUser` via admin), add `console.error` with step name before each rethrow, return structured `{ ok:false, step }` instead of throwing opaque errors.
- Evidence: `edge_logs` DELETE count = 0 over 72h; `auth_logs` no `admin/users` calls in 48h; FKs to auth.users are cascade or set-null (`contact_inquiries`).
- No database changes needed. RevenueCat, Paddle, the parental gate and pricing untouched.
