# Two soundtracks + a volume slider you can actually hear

## What you'll get

1. **"Little Steps, Big Dreams"** (the current track) plays on the main screens: home, worlds, adventure, rewards.
2. **"Curious Steps"** (the new upload) plays inside activities: play sessions, games, flash cards, storybooks, tracing.
3. Music switches tracks automatically when you move between the two kinds of screen, and still goes silent on parent and legal pages.
4. The parent dashboard slider becomes audible in two ways:
   - While you're on the settings screen with music switched on, the soundtrack plays a live preview so dragging the slider changes what you hear immediately. The preview stops when you leave the parent area.
   - The slider gets a wider range: the middle matches today's soft level, the top end is clearly louder (still under the narrator).
5. Hannah's voice still dips the music under her words on both tracks, both tracks work offline once cached, and the single on/off switch and volume slider control everything.

## Technical notes

- Upload the new MP3 via `lovable-assets` -> `src/assets/curious-steps.mp3.asset.json` (CDN pointer, no binary in repo).
- `src/lib/music-track.ts`: export both URLs (`MENU_TRACK_URL`, `ACTIVITY_TRACK_URL`).
- `src/lib/music.ts`: pick the track by route (`isActivityRoute` on pathname — play/game/story/trace/flashcards/adventure-session vs home/worlds/rewards), crossfade by pausing and swapping `audio.src` on route change; slider 0-1 maps to 0-0.25 playback volume with default 0.5 -> ~0.07 (existing families hear no change); duck to ~30% of the current level while narrating.
- `src/components/MusicPlayer.tsx`: compute menu vs activity per route, allow a preview flag on parent routes.
- `src/routes/parent.index.tsx`: start the preview when the settings section mounts (music on), stop on unmount; slider unchanged otherwise.
- Default `musicVolume` for new profiles becomes 0.5; existing saved values are interpreted on the new scale (clamped once on load so nobody gets blasted).
- Workbox audio cache rule already covers both CDN URLs.
- Verify with `bunx tsgo --noEmit` + a dev build, and a quick browser check that both tracks switch correctly.
