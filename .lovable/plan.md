# Multiple children per family account

Today Totland keeps one child's settings and progress on the device. This adds a proper family setup: a grown-up creates a profile for each child, each child's stars, stickers, badges and skill progress are kept apart, and the parent dashboard shows each child's progress separately.

## What a grown-up gets

- **Children list** in the parent area: add a child (name, age, avatar look), rename, change age, remove.
- **Switch active child**: only reachable from inside the parent area (behind the existing math gate). The kid screens always play as whichever child is currently active.
- **Per-child dashboard**: the existing progress view (time today, games, accuracy, letters mastered, numbers, strengths, recommended next, per-area progress) becomes per-child, with a child selector at the top.
- **Unlimited children** per account.

## Saved to the family account

Each child's progress is stored under the signed-in parent's account, so it follows them to a new phone or tablet. Play keeps working offline: progress is written on the device first and pushed up when the app is online and the parent is signed in. If a grown-up isn't signed in yet, everything still works on the device and uploads once they sign in.

Sound, music, language, narration and motion settings stay app-wide (one setting for the family), while stars, stickers, badges, companions, skill stats, day history and favourites are per child.

## Technical outline

**Database** — new `child_profiles` table: `id`, `user_id` (owning parent), `name`, `age`, `avatar` fields, `data` (jsonb holding the existing `Profile` progress shape), `created_at`, `updated_at` with the standard update trigger. Grants for `authenticated` + `service_role`; RLS so a parent can read/insert/update/delete only rows where `user_id = auth.uid()`.

**Local layer** — `src/lib/profile.ts` gains a family store: `totland.family.v1` holding `{ activeChildId, children: Record<id, Profile>, appSettings }`, plus a one-time migration that turns the current `totland.profile.v1` blob into the first child. `useProfile()` keeps its current signature and returns the active child, so the ~dozen game components and routes need no changes. New helpers: `useFamily()`, `addChild`, `removeChild`, `setActiveChild`, `updateChild`.

**Sync** — `src/lib/children.functions.ts` with `requireSupabaseAuth` server fns: `listChildren`, `upsertChild`, `deleteChild`. A `useChildSync` hook (mounted alongside the existing entitlement sync in `__root.tsx`) pulls on sign-in/reconnect and pushes dirty children on a debounce, resolving conflicts by newest `updated_at`.

**UI** — new `src/routes/parent.children.tsx` (children list, add/edit/remove, "Play as" switch) added to the parent nav; `parent.index.tsx` gets a child selector and reads the selected child's stats.

## Out of scope

- No child logins or child-visible switcher — switching is grown-up only.
- Subscription/entitlement stays at the account level and covers all children.
