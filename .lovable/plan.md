# Report: changes since commit f5a89c2 (read-only)

## 1. Commits after f5a89c2
None. The project is still at f5a89c2 ("Restored Paddle links to web", 10 Oct 00:05 UTC), and there are no unsaved changes. Nothing changed after your verified commit.

The outside changes (author ryanlittlejohn-a11y, timezone -0500) were all made on 9 Oct, **before** f5a89c2. Times below are in that -0500 timezone (19:38–20:39 UTC):

| Commit | Time | What it changed |
|---|---|---|
| ed04b94 | 13:38 | Added the Get the App card (App Store / Google Play links) to the parent dashboard only. Also updated the rights register. |
| 96c386b | 13:40 | Rights register document only. |
| 31b6268 | 14:05 | Rights register document only (Hannah voice terms). |
| 91e844a | 14:21 | Game screens now block pinch-zoom, scrolling and text selection while a game is open, and put zoom back afterwards. The Word Finds list still scrolls. |
| 0c2533f | 14:28 | Games went from 104 to 112 (8 new color/shape games) and storybooks from 5 to 10 (English and Spanish). |
| 2d45750 | 15:39 | Games went from 112 to 121 (Fishing, Monster and Rain games for colors, shapes and numbers), plus Spanish/English wording for them. |

The parental gate fix (00:05 UTC on 10 Oct) was made after these, so it already includes them. My audit at iPad size ran against this same code.

## 2. Parental gate fix: current state
- **Website-only footer:** unchanged. It shows only after the page loads, and only when the app isn't the phone/tablet app.
- **Grown-up check:** still asks every time. The only storage line left clears the old saved pass; nothing saves one.
- **Home screen:** Terms, Privacy, Refunds, Contact and Guide appear only through the website-only footer. The "For grown-ups" card is gone.
- Nothing has been reverted, worked around or rebuilt.

## 3. Home screen
It isn't a new home screen. "Today's Adventure" and "The five worlds" have been there since 4 Sep. "Browse all 121 games" uses a live count, which went up because of the new games. Every link on it stays inside the app: games, worlds, rewards, the welcome screen, Word Finds, the parent area, and the website-only footer. Locked areas go to /parent, which shows the check. The iPad-width test on 10 Oct used this exact screen.

## 4. Other things to flag (nothing touches the gate, sign-in, subscriptions or deletion)
- **Free/Premium balance moved:** it's now 45 free and 76 Premium, no longer the 40/64 you approved. All numbers parents see are worked out live, so the wording stays accurate. The split itself was never approved in this conversation.
- **Narration for the 17 new games and 5 new storybooks:** not checked against Hannah's recordings. Lines with no recording will use the device voice, or stay silent on phones that have no device voice.
- **Zoom and scroll blocking on game screens:** a broad change. It could affect drag and tracing games and long story pages on iPad. It hasn't been tested on a real device.
- **Get the App card:** only on the dashboard, which is behind the check (included in the earlier audit).
- No new pages, no new links out of the app, and no changes to sign-in, subscriptions, account deletion or the server's allowed-address list.

## Suggested next steps (needs your approval)
1. Approve or adjust the new 45/76 free/Premium split.
2. Check the narration lines for the new games and storybooks against Hannah's recordings, using the counts only. No recording.
3. Play-test drag, tracing and story screens at iPad width after the zoom/scroll change.
