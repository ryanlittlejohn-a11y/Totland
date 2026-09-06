# Fix: only the main-screen music plays on the live app

## What I checked

- All three music files load fine from the live site (menu, activity and story tracks all return audio).
- Hannah's voice service on the live site answers normally — the audio is being produced, so this is not a missing key or a broken server.
- In a scripted browser run against the live site, the activity track file was requested when moving into a game, and voice audio was fetched — yet nothing was guaranteed to actually sound.

That points at the phone/tablet's sound permission rules, not at the files or the server: a browser (especially on iPhone/iPad) only lets sound start if it is triggered directly by a tap. The first tap on the home screen starts the main soundtrack, but everything created afterwards — the second and third soundtracks and Hannah's voice, which both start after a short pause while audio is fetched — is treated as "not from a tap" and stays silent.

## The fix

1. Unlock all sound on the very first tap. When a child first touches the screen, quietly prime both the music player and the voice player at once so the device marks them as allowed. Everything that plays later then works without a new tap.
2. Reuse one voice player for the whole session instead of starting fresh audio each time, so Hannah is never blocked mid-activity.
3. Make the soundtrack swap seamless: when the screen changes, keep the same player and just change the tune, so switching to a game or a storybook can't be blocked.
4. If sound is still refused (rare, e.g. the child hasn't tapped yet), retry automatically on the next tap rather than dropping the line.
5. Make sure the phone gets the latest version: the installed app can hold onto an old copy, so refresh the saved copy as soon as a new one is published and reload quietly.
6. Test on the live site after publishing: home screen music, a game (second tune), a storybook (third tune), and Hannah speaking in each place.

## Technical notes

- New `src/lib/audio-unlock.ts`: one-time `pointerdown`/`touchend` handler that calls `play()` then `pause()` on the shared music element and a shared narration element (muted, zero-length), resolving a promise other modules await.
- `src/lib/music.ts`: create the `HTMLAudioElement` eagerly, register the gesture hook unconditionally (not only after a failed play), and keep `tryPlay()` re-firing on the unlock promise; keep track switching on the same element.
- `src/lib/speech.ts`: hoist the `player` element creation to module load and prime it in the unlock step; on a rejected `play()`, queue a retry on the next gesture before falling back to the device voice.
- `vite.config.ts` / `src/lib/pwa-register.ts`: confirm `skipWaiting`/`clientsClaim` behaviour with `registerType: "autoUpdate"` so a published fix reaches already-installed devices.
- Verify with `bunx tsgo --noEmit`, a dev build, and a Playwright pass over `/`, `/play/letters` and a storybook checking `audio.paused === false` for each track.
