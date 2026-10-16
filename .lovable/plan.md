# Spanish for the grown-up screens

## What I found (read-only)

1. **One app-wide language switch.** There is a single setting, saved on the device with the family profile and changed from Parents → Settings. Games, stories, onboarding and the offline screen all follow it. There is no separate "child language". The grown-up screens just never had their text wrapped for translation. The language switch on the dashboard is the only thing there that uses the setting.
2. **Screens that stay in English:**
   - Parents gate/layout and tabs
   - Dashboard: stats, mastery, settings labels, narration diagnostics, help card
   - Subscription page: plans, purchase/restore, sign-in, account deletion and its confirmations
   - Family/children page
   - Grown-up sign-in card, App Store purchase panel, Get the app card, install prompt
   - Contact page and its form messages; sign-in return screen; error page
   - Terms, Privacy and Refund pages (long legal text)
   - Messages shown when something goes wrong (sign-in, purchase, contact form)
   Already in Spanish: first-time setup (welcome), offline screen, all child screens.
3. **No unused Spanish text exists** for any of these. Everything except the legal pages is new translation work.
4. **Size:**
   - App screens: about 120 to 150 short lines across about 12 screens. These lines are mostly buttons, labels and short sentences.
   - Legal pages: about 3 long documents, roughly 700 lines of text.
   - The tool for doing this already exists (the same one onboarding uses), so wiring the text up is easy. Most of the work is writing Spanish and reviewing it.

## Proposal

- **Phase A (do now):** translate every grown-up app screen listed above, including error and confirmation messages, into Spanish that uses "tú" to match the onboarding. Store prices and Apple/Paddle checkout screens stay in the store's own language. No changes to how purchases, the gate, sign-in or deletion work: only the wording shown on screen changes. A test will check that each grown-up screen shows Spanish when Spanish is selected.
- **Phase B (separate, needs a decision):** Spanish versions of Terms, Privacy and Refund. Machine-quality legal Spanish is risky. Options: (1) I draft them and a Spanish-speaking reviewer or lawyer checks them, or (2) keep the legal pages in English with a Spanish note at the top saying the English version applies.
- Search pages and guides stay in English (they are aimed at English searches).
- No narration is involved, so no voice credits are used.

## Flags

- The subscription, sign-in and parental gate screens are sensitive areas. Phase A changes only their wording, never their behavior. Approving this plan approves that wording change.
- Ryan should have a native Spanish speaker read the Phase A wording before publishing.

## Technical notes

- Wrap strings with the existing `L(en, es)` helper in `src/lib/i18n.ts` (already used by welcome/OfflineGate); `getLang()` is set from the profile at boot (`profile.ts`) and on toggle.
- The dashboard needs a re-render when the language is switched (the screens should read `profile.language` so they update immediately).
- Files: parent.tsx, parent.index.tsx, parent.subscription.tsx, parent.children.tsx, ParentAuthCard, StorePurchasePanel, GetTheAppCard, InstallPrompt, contact.tsx, auth.native-return.tsx, error-page.ts, WebLegalFooter.
