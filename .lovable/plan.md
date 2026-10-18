# Hermes changes since 4ad0c538 — audit report (read-only, nothing fixed)

## 1. Commits (2 total)

1. **fd1e905c** — 2026-10-17 21:32:48 (UTC-5) — "Wire up Google Play download button (gated, in review like Apple)"
   - `src/lib/app-links.ts`: Play Store link changed from empty to `https://play.google.com/store/apps/details?id=app.totland.kids`. Added `PLAY_STORE_PACKAGE`. `PLAY_STORE_LIVE` is still `false`.
   - `src/components/GetTheAppCard.tsx`: the "in review" note now names Apple and Google, and shows two chips ("Apple App Store — in review", "Google Play — in review"). Spanish text is provided too.
2. **8b03628a** — 2026-10-17 21:34:33 (UTC-5) — "Patch vitest 4.0.8 -> 5.0.5"
   - `package.json` + `bun.lock` only. This updates the test tool to fix two security warnings. The test tool is not part of the app people download.

## 2. Gate / subscriptions / catalog / deletion / external links

- **Gate, subscriptions, purchases, entitlements, free/Premium split, account deletion: not touched.** Neither commit changes any of those files.
- **External link (needs your confirmation):** the Google Play address is new and points outside the app. It is still **not clickable**: the button only appears when `PLAY_STORE_LIVE` is true, and it is false. The card appears only on the grown-up dashboard, behind the gate. No child-facing screen uses it. The address matches the real app id. Once the listing goes public, this link will match how the Apple link already works.

## 3. Android config

- **Not touched.** Signing, manifest, minSdk/targetSdk, versionCode and the RevenueCat Android key are unchanged since your verified commit.

## 4. Risky or inconsistent items

- **Dashboard wording is now ahead of reality:** it says Google Play is "in review". That's only true once Ryan has actually submitted to Google for review. Internal testing doesn't count. Minor, but it's what parents see.
- **The test-tool version is no longer pinned.** It changed from the exact `4.0.8` to `^5.0.5`, so future installs can pick up newer 5.x versions. Every other build tool in the project is pinned to an exact version. This is a major-version jump; I re-ran the checks here.
- **The "Spanish needs review" rule applies:** the new Spanish sentence ("está en revisión con Apple y Google") uses the same style as the rest of the app and should go into the pending native-speaker review.
- **Leftover:** the condition `PLAY_STORE_LIVE && PLAY_STORE_URL` still checks whether the Play address exists, but now it always does. Harmless, but it no longer does anything.

## 5. Verification done

- The checks Hermes claimed pass do pass: the installed test tool is 5.0.5, and **all 58 checks pass across 9 test files**. That includes the Spanish grown-up screen check covering this card.
- Nothing has been published or changed by me.

## Proposed follow-ups (only if you approve)

1. Pin the test tool to exactly `5.0.5` so it matches the rest of the project.
2. Optionally show "Google Play — coming soon" until Ryan actually submits it for Google's review.
