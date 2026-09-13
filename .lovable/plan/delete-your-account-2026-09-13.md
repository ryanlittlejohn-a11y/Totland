# Delete your account

Add a clear, safe way for a grown-up to permanently delete their Totland account from the parent area.

## Where it lives

In the parent area, under **Subscription → Your account** (the panel that shows "Signed in as …", Restore purchase and Sign out). A new "Delete account" area sits at the bottom of that panel, visually separated and in the warning colour, so it can't be hit by accident.

## What the user sees

1. A short explanation: deleting removes the grown-up account, every child profile saved to the account, and the subscription record. It cannot be undone.
2. A "Delete my account" button. Tapping it opens a confirmation step inside the same panel: the user must type **DELETE** to enable the final button.
3. If a subscription is currently active, a warning first: deleting the account does not cancel billing — cancel through the App Store/Google Play (in the app) or the payment provider (on the web) before deleting. A link/instruction matching the platform, same wording already used on that page.
4. On success: the user is signed out, local premium and synced child data on the device are cleared, and they're returned to the play screen with a short "Your account has been deleted" note.
5. On failure: a plain-language error and the account stays untouched.

## Technical details

- New `src/lib/account.functions.ts` with `deleteMyAccount` — `createServerFn({ method: "POST" })` with `.middleware([requireSupabaseAuth])`, so only the signed-in user can delete themselves; the input carries no user id.
- Handler order: delete `child_profiles` where `user_id = context.userId`, delete `subscriptions` where `user_id = context.userId`, then `supabaseAdmin.auth.admin.deleteUser(context.userId)`. `supabaseAdmin` is loaded inside the handler via `await import("@/integrations/supabase/client.server")`. Any error is thrown so the UI can report it.
- UI changes are confined to `src/routes/parent.subscription.tsx`: local `confirmOpen` / `confirmText` / `deleting` / `deleteError` state, `useServerFn(deleteMyAccount)`, then `supabase.auth.signOut()`, clear the local family store and `premium` flag via the existing profile update, and navigate to `/`.
- Existing `child_profiles` and `subscriptions` rows are already owner-scoped by RLS; no migration is needed.

## Verification

- `bunx tsgo --noEmit` clean and the preview build passes.
- Playwright pass: open the parent gate, confirm the delete control is present, that the final button stays disabled until DELETE is typed, and that no console errors occur. The destructive call itself is not executed against a real account.
