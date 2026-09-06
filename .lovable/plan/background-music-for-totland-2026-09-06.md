# Background music for Totland

Add your ElevenLabs track as a soft, looping soundtrack behind the whole kid experience, controlled by the existing "Background music" switch in the parent dashboard.

## What you'll get

- The track loops quietly under everything kids see: home, worlds, games, flash cards, stories, tracing and rewards.
- Volume sits low (about 12%) so Hannah's narration always stays clearly on top; the music dips even softer while she's speaking and comes back up after.
- Music starts on for new families. Because phones and tablets block sound until someone taps, it begins on the child's first tap and then keeps playing across screens without restarting.
- The parent dashboard switch turns it off and on instantly, and the choice is remembered on the device.
- Music is off on the parent pages and the legal pages.
- It keeps playing offline once the file has been downloaded, and pauses when the app is sent to the background.

## What I need from you

Upload the audio file (MP3 preferred) in your next message and I'll drop it in. A 1–3 minute gentle loop works best.

## Technical details

- Upload the track through `lovable-assets` and commit the `.asset.json` pointer; reference the CDN URL so the repo stays light.
- New `src/lib/music.ts`: single module-level `HTMLAudioElement` with `loop`, base volume 0.12, `start()` / `stop()` / `setMusic(on)` / `duck(ms)`; guards for SSR and autoplay rejection, retrying on the first user gesture (`pointerdown`).
- New `src/components/MusicPlayer.tsx` mounted once in `src/routes/__root.tsx`: reads `profile.music`, starts/stops accordingly, skips `/parent/*`, `/terms`, `/privacy`, `/refund` via `useLocation`, and pauses on `visibilitychange`.
- Ducking: `say()` in `src/lib/speech.ts` calls `duck()` when it begins playback and restores when the clip ends or the fallback utterance finishes — implemented as a small volume ramp, no API change at call sites.
- `src/lib/profile.ts`: flip the `music` default from `false` to `true`; existing saved profiles keep their stored value.
- The parent dashboard toggle in `src/routes/parent.index.tsx` gains a `setMusic(on)` call alongside the profile update, matching how narration is handled.
- Service worker: add a CacheFirst runtime rule for the asset URL so the loop works offline for premium families.
