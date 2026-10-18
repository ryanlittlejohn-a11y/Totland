# Two TestFlight progress bugs — findings (no changes yet)

Both bugs have the same likely cause: the same child's progress gets saved by two parts of the app at once, and one save quietly overwrites the other. Below is what I confirmed from the code and what I haven't confirmed yet.

## Bug 1 — "0 of X games explored"

**Where the counter comes from (confirmed):** Home counts a game as "explored" once it has at least one recorded play. A play is recorded only by the game screen itself when a round finishes, not by the game pieces inside it. The counter reads the right field, so the display logic is fine.

**What can wipe the play (confirmed in code, not yet reproduced):**
1. **Two copies of the profile on one game screen.** The game screen and the game inside it each keep their own copy of the child's progress. When a round ends, both save their whole copy, and whichever saves last wins.
   - The game's copy has stars and "games completed", but no play.
   - The game screen's copy has the play, but misses the game's last changes.
   - Each one can erase what the other just recorded.
2. **The family-account sync every 60 seconds.** It takes a snapshot of the progress and waits on the internet. Then it writes that older snapshot back over the device, erasing anything played in those few seconds. It also marks the progress as already sent, so the lost play never reaches the account either.
3. On a signed-in TestFlight phone, both of these happen during normal play.

**Not yet confirmed:** that these explain a counter stuck at exactly zero after several games. Reproducing it is step 1 of the fix.

## Bug 2 — Words tracing stays locked

**Where the check is (confirmed):** the Words stage opens when the child has traced 10 *different* big letters and 10 *different* small letters. For longer words the bar rises: 14 for 3-letter words, 18 for 4-letter, 22 for 5-letter.
- It counts distinct letters, not total tries. Tracing "A" ten times counts as 1.
- It does not need all 26 letters, and it does not need 10 tries per letter.
- The on-screen wording "Trace 10 big and 10 small letters" doesn't say *different*, which is confusing.

**Why real tracing may fall short (confirmed in code, not yet reproduced):**
- Each tracing round has 3 letters. The last letter's save hits the same two-copies overwrite as Bug 1: the game screen's older copy, saved last, drops it.
- So only about 2 of every 3 letters may stick, and the 60-second sync can erase more.
- Letters are saved as soon as they're traced, unlike plays, so this explains slower progress. It may not explain zero progress on its own.

**Related:** yes. Both bugs come from the same saving system.

## Proposed fix (for approval)
1. **Reproduce first** with automatic tests that play a round and a tracing round. They'd check that the play and every traced letter survive, including when a sync happens mid-round.
2. **Every save adds to the freshest saved progress** instead of replacing it with an older copy. That removes the two-copies overwrite everywhere, in all games.
3. **Sync merges instead of overwriting.** It re-reads the device after the internet call and only marks progress as sent if nothing changed in the meantime.
4. **Clearer locked message:** "Trace 10 different big letters and 10 different small letters", plus a live count such as "6 of 10 big · 4 of 10 small". The threshold rule stays the same unless Ryan wants it changed.
5. **Ryan checks on TestFlight** after a new build.

No sign-in, Premium, purchase, gate or free/Premium changes. The sync change only affects how a child's progress is saved and merged.

## Question for Ryan
Is "10 different letters of each" the rule he wants, or did he expect 10 total tracings (repeats counting)?
