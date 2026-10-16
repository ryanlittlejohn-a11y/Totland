# Opening animation and first-time language choice

## What happens today (findings)

1. **Launch sequence:** On iPhone/iPad, the native splash image shows for about 1.2 seconds. It stays up until saved progress finishes loading from the device, up to a 4.5 second cap. Then the home screen appears. On the website the home screen appears straight away. There is no animation and no loading screen of Totland's own.
2. **First-time setup:** If a child hasn't been set up yet, the home screen shows a "Set up your child" card that opens the 3-step grown-up setup (name, play buddy, outfit). The setup is optional and is never forced. It **never asks for a language**. Every new family starts in English, and the only place to change it is the switch on the parent dashboard.
3. **What actually loads at launch:**
   - Saved progress and settings from the device. This is the slow part on phones and the reason the splash is held.
   - The Premium check with the store and with the grown-up account, plus family profile sync. These run in the background and don't block anything.
   - The narration prewarm (downloading common voice clips) is turned off inside the app, because it froze real devices. On the website it starts 15 seconds after opening.
   - All games, pictures and music files are bundled with the app. Nothing has to be downloaded.

   So the only real waiting is the saved-progress load, which takes a fraction of a second up to a few seconds. The animation would cover that wait, not add a fake one.

## Proposal

### Opening animation ("entrance")
- A short, cheerful animation made from the existing play buddies, the star emoji and the Totland wordmark. The buddies bounce in, a star sparkles, and the name pops up. It uses only shapes and emoji already in the app: no video file, no new downloads.
- **Length:** about 1.5 seconds, or until saved progress has loaded, whichever is longer, with a 4.5 second cap. Tapping anywhere skips it.
- **Reduced motion:** with Reduced motion on (or the device's own reduce-motion setting), it shows a still logo and fades out as soon as loading finishes.
- **When it plays:** every time the app is opened fresh (not when returning from the background). On the website, only the first visit in a browser session.
- **What it replaces:** the native splash hands over to it immediately, so there's one continuous opening.
- **Sound:** no sound by default, because phones may still block audio before the first tap.

### Language popup (first time only)
- Shown right after the animation, before anything else, to anyone who has never chosen a language.
- **Note shown before they pick:** "You can change this anytime in the Parent Dashboard" / "Puedes cambiarlo cuando quieras en el Panel para adultos". Two large buttons: English and Español, each with its flag-free label.
- The choice is saved with the family settings and immediately switches the whole app.
- **Returning families are never asked:** anyone who already has saved progress, a set-up child, or a language other than English already counts as "chosen".
- After choosing, the home screen appears as today. The existing optional "Set up your child" card stays where it is, now in the chosen language. This means the popup sits before setup and doesn't make setup mandatory.
- The parent dashboard switch keeps working exactly as now.

### Safety and compliance
- No changes to the parental gate, subscriptions, purchases, sign-in or links. The popup has no external links and no purchase buttons, and choosing a language is not a grown-up-only action, so the gate doesn't need to come first.
- No new tracking or third-party services, and nothing leaves the device.
- No new narration. The popup text is read-only and never spoken, so no voice credits are used.
- Search engines and link previews still see the normal home page, because the animation only appears after the page has loaded in a browser.

## Technical notes
- New `src/components/AppEntrance.tsx` mounted in `__root.tsx` around/inside `StorageBoot`; it waits on the existing "storage settled" signal (`markStorageSettled` in `src/lib/storage.ts`) plus a minimum time, then fades out. Uses CSS transform/opacity only, honors `profile.reducedMotion` and `prefers-reduced-motion`, and pauses with the existing `data-away` flag.
- Native: `initNativeShell` hides the Capacitor splash as soon as the entrance is mounted rather than after storage settles; the 4.5s storage cap stays.
- New `languageChosen` flag in family settings (`src/lib/profile.ts`). Migration rule when loading: true if the family is onboarded, has any play history, or the language is already `es`.
- New `src/components/LanguagePicker.tsx` popup; calls the same `setLang` + profile update the dashboard switch uses.
- On the web, start the narration prewarm only after the language is known so it fetches the right voice; it stays off inside the app.
- Tests: a returning family (onboarded or with history) is never shown the picker; a brand-new family is; picking Español sets the language and marks it chosen.
