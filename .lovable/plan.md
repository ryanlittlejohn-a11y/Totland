# Polish Terms, Privacy, Refund, Contact and the Parent Dashboard

The legal pages were written before several features shipped (Word Finds, family profiles that sync to your account, the ElevenLabs voice, the contact form and its emails, the iOS app with Apple purchases, the App Clip, account deletion). This updates them to match what the app actually does today, and tidies the grown-up pages.

## Terms & Conditions

- Add Apple App Store purchases: on iPhone/iPad, Premium can be bought through Apple, Apple is the seller for those purchases, and refunds/cancellations go through Apple. Website purchases stay with Paddle.
- Describe what Premium unlocks in plain terms: all 100 Word Find puzzles beyond the first 30 free ones, premium worlds, and offline play. State that the free version needs an internet connection.
- Add an account deletion clause: grown-ups can delete their account at any time from Parents → Subscription, which permanently removes the account, child profiles and subscription record.
- Add a short clause on the App Clip (a free sample mini-game with no sign-in) and on user-submitted content in Content Studio.
- Replace "contact options in the app's parent section" with the real contact route and support address.
- Refresh the "last updated" date.

## Privacy Notice

- Correct the current overstatement. Play data is stored on the device by default, but a signed-in grown-up can sync child profiles (nickname, age, progress) to their account. Say this clearly, and that syncing is optional and tied to the parent account.
- Add the voice section: spoken lines are sent as text to our speech provider to generate audio, the audio is saved and reused so the same line is never sent twice, and no child voice is ever recorded or transmitted.
- Add contact form data: name, email and message are stored and emailed to support from notify.totland.app; replies go to the address given.
- Add anonymous crash and performance reports (error text, timing) with no personal or child data.
- Add sign-in options: email, Google and Apple; email verification is required.
- Add Apple/RevenueCat as processors for in-app purchases alongside Paddle.
- Add an explicit "Delete your account" section describing the in-app deletion path and what is removed.
- Point rights requests at the contact page and support email instead of "the parent section".
- Refresh the "last updated" date.

## Refund Policy

- Add an Apple purchase path: refunds for App Store purchases are requested from Apple (reportaproblem.apple.com), and cancellation is done in the device's subscription settings.
- Keep the 30-day guarantee for website purchases through Paddle and say clearly which path applies to which purchase.
- Point "anything else" questions at the contact page and support email.

## Contact page

- Add a short "before you write" block: billing and refunds (with links to the right place), subscription help, and a typical reply time.
- Show the support email prominently and keep the form as the primary path.
- Add links to Terms, Privacy and Refund below the form.

## Parent dashboard

- Add a Word Finds progress line (puzzles completed out of 100, and how many are free) next to the existing per-area progress.
- Add a small "Help & legal" card at the bottom linking to Contact, Terms, Privacy and Refund, plus the support email.
- Keep the wording honest about data: change the closing note so it matches the corrected privacy stance (progress stays on the device unless you sign in to sync).

## Technical notes

- Files: `src/routes/terms.tsx`, `privacy.tsx`, `refund.tsx`, `contact.tsx`, `parent.index.tsx`, and `src/components/LegalPage.tsx` (footer unchanged, already has all four links).
- Word Finds count comes from `profile.wordFinds` and `WORD_FIND_THEMES` / `FREE_WORD_FINDS` in `src/lib/wordfinds.ts`.
- Content only; no schema, payment or auth logic changes. Head metadata on each page stays and gets refreshed descriptions where the content changed.
- Not legal advice — these are plain-language updates to reflect current behaviour; you should read them over before publishing.
