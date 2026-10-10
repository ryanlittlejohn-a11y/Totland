# Report: Hermes changes and the game-screen zoom/scroll block (read-only)

## Part A — Changes since commit f5a89c2
- **No commits after f5a89c2.** The project is still on it, with no unsaved changes.
- **Outside changes:** six commits by ryanlittlejohn-a11y on 9 Oct, all made before f5a89c2:
  - ed04b94 — Get the App card on the parent dashboard (behind the check)
  - 96c386b, 31b6268 — rights register document only
  - 91e844a — game-screen zoom/scroll/text-select block
  - 0c2533f — games 104 to 112, stories 5 to 10
  - 2d45750 — games 112 to 121
- **Parental gate fix:**
  - The footer still shows on the website only.
  - The check still asks every time and nothing saves it.
  - The home screen in the app still has no legal links.
  - Nothing was reverted.
- **Home screen:** not new. "Today's Adventure" and "The five worlds" date from 4 Sep, and "121 games" is a live count. No links leave the app.
- **Other things to flag:**
  - The free/Premium split moved from the 40/64 you approved to 45 free / 76 Premium. Nobody approved that.
  - Narration for the 17 new games and 5 new stories hasn't been checked against Hannah's recordings.
  - No changes to sign-in, subscriptions, deletion or the allowed-address list.

## Part B — Testing commit 91e844a (simulated iPhone 390x844 and iPad 820x1180)

What the change does: every game, story, Word Find puzzle, quick-play and adventure screen gets `touch-action: none` and no text selection. Pinch-zoom is also switched off while the screen is open. The Word Finds list is the only screen exempted.

### Confirmed by test
- **Zoom block switches off properly.** It's on for every game. It's off again after leaving by the home button, and off on the home screen, the Word Finds list, the grown-up check and the subscription page.
- **All 10 storybooks, including the 5 new ones, fit the screen** on both widths. Every page's Next button is on screen, so no scrolling is needed inside a story.
- **Grown-up check and subscription screens are untouched.** They don't use the game frame, so the block never applies there.
- **Word Finds list is exempt:** zoom is allowed, and normal scrolling is allowed in principle (it's the only screen marked as scrollable).
- **No game screen has a typing box,** so blocking text selection can't break any input.

### Problem found (iPhone width)
`touch-action: none` on the whole screen also stops a finger from scrolling the page. Any game taller than the phone screen becomes stuck. I subtracted the preview-only "test mode" banner (49px) from the figures below:
- **Read With Me story picker:** the last row of stories is off the bottom of the screen. That row is "Dot the Dino's Starry Camp-Out" and "Ollie Owl's Forest Friends", both new stories. A child on iPhone may not be able to reach them.
- **Letter Rain and Color Rain:** answer buttons sit up to ~47px below the bottom edge.
- **Feed the Letter Monster and Color Monster:** the screen runs ~45px past the bottom.
- **Animal Jigsaw:** ~128px past the bottom.
- **Word Rocket:** ~17px past the bottom.
- **Number Maze and Letter Tracing:** they fit.
- **iPad width:** nothing goes past the bottom except the preview-only banner.

### Drag and tracing games
- **Drag pieces:** in Letter Fishing, Feed the Letter Monster, Word Rocket, Animal Jigsaw and the new Fishing/Monster/Rain games, the pieces already blocked touch scrolling on themselves before this change. The shared drag handling also blocks it. So the new screen-wide block adds nothing they didn't already have, and finger presses still reach the game.
- **Tracing:** Number Maze and the tracing canvas likewise already blocked touch scrolling on themselves.
- **Not playable here:** most new games are Premium, so in testing I only reached the lock screen. They use the same game types as the free ones I checked.

### Can't be verified here — needs a real iPhone and iPad
- **The simulated touch swipe is unreliable.** It didn't scroll even the normal home screen, so I can't prove the stuck scrolling with a simulated finger. My finding comes from how Apple's web engine handles `touch-action: none`, plus the measured heights. A real device must confirm it.
- **Drag and tracing feel:** whether they're unchanged needs real fingers. I can't simulate multi-touch or Apple's web engine.
- **Whether iOS honours the "no zoom" setting:** Safari ignores it, and the app's web view may as well. In that case pinch-zoom is only blocked by the touch setting.
- **Mid-game double-tap zoom on iPad.**

## Proposed fix (needs approval — small, one file)
In `src/components/PlayFrame.tsx`, change the game-screen class from `touch-none` to `touch-pan-y`. That still blocks pinch-zoom and double-tap zoom but lets a finger scroll up and down, so the stuck screens above become reachable again. Drag pieces, the maze and the tracing canvas keep blocking scrolling on themselves, so dragging and tracing are unaffected. Keep the zoom-off-then-back-on behaviour and the Word Finds exemption as they are. Then repeat the height check above. The change goes out with the next Codemagic build and needs a publish for the website, followed by the real-device checks listed above.

## Other follow-ups (separate approvals)
1. Confirm or change the 45/76 free/Premium split.
2. Check narration for the new games and stories against Hannah's recordings (counts only, no recording).
