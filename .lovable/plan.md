# Fix: no music, and the app freezing when moving to a new section

## What I confirmed

**The music has no chance of playing in the packaged app.** The three soundtracks
are stored as hosted files and referenced by a site-relative address
(`/__l5e/assets-v1/...`). Inside the App Store build the app is served from its
own local bundle, so that address points at a file that simply isn't there — the
player asks for a track that doesn't exist and stays silent. This is not a
permission or tap-unlock problem; the track never loads. On the website the same
address works, which is why music plays in the browser but not on TestFlight.

**The freezing is not yet confirmed.** The screenshots show the tell-tale sign of
an iPhone rendering problem rather than a code crash: whole bands of the page
paint as empty background while the cards that belong there are missing. The
crash/freeze reporting added in the previous build has produced no reports on
the server, so either the build being tested predates it or the reports are not
getting through. The plan therefore fixes the two rendering habits iPhones are
known to choke on, and makes the device reporting verifiable before we guess
further.

## The fix

1. **Make the soundtracks load in the packaged app.** Point the three music files
   at their full web address when running inside the iPhone/iPad app, so the
   player can actually fetch them. Keep the website behaviour unchanged.
2. **Let the app say when a track fails.** If a soundtrack can't load, record it
   quietly in the diagnostics instead of failing silently, so a future silence is
   visible to us rather than invisible.
3. **Remove the full-screen backdrop layer.** The soft gradient currently sits on
   a separate pinned layer behind everything. On iPhone that layer is re-tiled
   during scrolling and is the most likely reason parts of the screen come back
   blank. Move the gradient onto the page itself so there is one layer, not two.
4. **Drop the frosted-glass blur everywhere, including desktop.** Live blur is
   the single most expensive thing on the screen and is what pushes an iPhone
   into shedding painted content. Panels become solid; the look barely changes.
5. **Cap the drifting animations.** Keep them on the home screen only and pause
   them while the screen is not visible, so nothing keeps the graphics layer busy
   during a screen change.
6. **Prove the reporting works.** Confirm a report from the packaged app reaches
   the server logs, so the next TestFlight run tells us what the device actually
   did instead of us inferring it. If the freeze survives these fixes, those
   reports become the next step.
7. **Verify** the build, then a fresh Codemagic build for TestFlight: home-screen
   music, a game (second tune), a storybook (third tune), and moving between
   sections several times in a row.

## Technical details

- `src/lib/music-track.ts`: resolve each asset `url` through `apiOrigin()` from
  `src/lib/native.ts` when `isNativeApp()` is true (the pointer URLs are
  root-relative and resolve against `capacitor://localhost` today). Export a
  helper so any future asset pointer goes through the same resolution.
- `src/lib/music.ts`: add an `error` listener on the audio element that posts a
  diagnostic (`kind: "error"`, message includes the failed track URL) via the
  existing reporter, and retry once against the hosted origin.
- `src/lib/crash-report.ts`: export a small `reportIssue(message)` so non-fatal
  problems such as a failed track can be logged without a thrown error.
- `src/styles.css`: delete the `body::before` fixed gradient layer; apply
  `background-image: var(--playmat)` (non-fixed) to `body` with
  `background-repeat: no-repeat; background-size: cover`. Remove the
  `@media (hover: hover)` `backdrop-filter` branch from `felt-panel` entirely and
  keep the opaque background. Add
  `@media (prefers-reduced-motion: reduce) { .anim-floaty { animation: none } }`.
- Verify with `bunx tsgo --noEmit`, `bun run build:app`, and a Playwright pass on
  `/`, `/play/letters` and a storybook asserting `audio.paused === false` and no
  console errors during three consecutive route changes.
