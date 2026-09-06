# Make the music volume slider actually audible

## What's happening

The slider does save and apply your setting, but you can't hear it: the soundtrack is deliberately silenced on every parent-dashboard page, so while you're dragging the slider nothing is playing. On top of that, the music ceiling was recently lowered a lot — even at 100% the track only plays at about 7% loudness, so the difference between settings is hard to notice on the kid screens too.

## The fix

1. Play a live preview of the soundtrack while you're on the settings screen and the music switch is on, so dragging the slider changes what you hear immediately. The preview stops when you leave the parent area or turn the switch off.
2. Widen the slider's range so it is genuinely useful: the middle of the slider matches today's soft level, and the top end is clearly louder (still under the narrator).
3. Keep the narration dip working: whenever Hannah speaks, the music drops well below the voice regardless of where the slider sits.

## Technical notes

- `src/lib/music.ts`: replace the fixed `BASE_VOLUME = 0.07` / `DUCK_VOLUME = 0.02` with a level-scaled range (slider 0-1 maps to roughly 0-0.25 playback volume, default 0.5 -> ~0.07 so existing families hear no change), and duck to a fixed fraction of the current level so the voice always wins.
- `src/components/MusicPlayer.tsx`: allow playback on parent routes when a `preview` flag is set, keeping other routes' silence rules unchanged.
- `src/routes/parent.index.tsx`: start the preview on mount of the settings section (when music is on), stop it on unmount; slider keeps writing `musicVolume` to the profile.
- Default `musicVolume` for new profiles becomes 0.5 to match the new mapping; existing saved values above that are clamped once on load so nobody suddenly gets blasted.
