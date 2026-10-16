# Fix: home-screen music stays silent after leaving the Parent Dashboard

## What was reproduced (preview, same steps as Ryan)
1. Opened the Parent Dashboard, answered the grown-up check, tapped Español.
2. On the dashboard, the Spanish song started playing. This is on purpose. The dashboard plays the music while it is open so the volume slider can be heard. It started in September with the volume slider work. Other grown-up pages (subscription, children, legal) stay silent.
3. Went back to the home screen. The music started for a split second, then stopped. It stayed stopped, and tapping the screen did not bring it back.
4. The same happens in **English**. So this is not a Spanish problem, and the Spanish file is fine. The Spanish song swapped in correctly on the dashboard.

## Root cause
When you leave the dashboard, two things happen in the wrong order:
- The home screen says "music on" and starts the song.
- A moment later the dashboard closes. Its "stop the preview" step pauses the song **and** marks music as unwanted. That cancels the home screen's request.
Because music is marked as unwanted, the usual "try again on the next tap" does nothing either.

The first-time language popup worked because it never opens the dashboard preview.

## Fix
- Track two separate requests: "music on for kid screens" and "dashboard preview". The song plays if either one is on.
- Closing the preview only stops the song if kid music isn't also on. The order the screens close in no longer matters.
- Keep the dashboard preview. Ask Ryan whether he'd prefer the dashboard silent too. That is a one-line change.
- Add a test that runs the exact bad order: home says "on", then the preview closes. The test checks that the song is still playing, in both English and Spanish.

## Unchanged
On/off switch, volume slider, quieter music under Hannah/Lucy, silence on other grown-up pages, track choice by language, English file. No changes to the gate, subscriptions or purchases.

## Technical details
- `src/lib/music.ts`: split `wanted` into `kidWanted` (from `setMusic`) and `previewCount`. `startMusic`/`stopMusic` recompute `wanted = kidWanted || previewCount > 0` and pause only when that is false.
- `previewMusic(false)` decrements and pauses only if `!kidWanted`.
- New case in `src/lib/music-language.test.ts`.
- Verify by replaying the steps in the preview. A new iPhone build is needed for the phone.
