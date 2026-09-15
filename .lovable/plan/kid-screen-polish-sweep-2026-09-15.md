# Kid-Screen Polish Sweep

## What the sweep found

Walked every main kid screen (home, worlds, world detail, Today's Adventure, a game, Word Finds list, a word find puzzle, rewards, welcome) at phone size, tapping through correct and wrong answers. Screens are healthy overall: no console errors, correct/wrong answer flows, sounds, and progress all work. The empty-looking emoji squares in my test screenshots are a tooling artifact — iPhone renders them fine.

Genuine rough edges to fix:

1. **Feedback line lingers and doesn't match the question.** After a correct answer, the praise stays on screen under the *next* question, and it can show the wrong example (answered "letter U", but the line under the next question read "Nice work! C is for cat!"). Fix in `src/components/game/ChoiceGame.tsx`: clear the message when the next round starts, and confirm the praise always pairs with the round just answered.

2. **Whole answer grid wiggles on a wrong tap.** In `ChoiceGame.tsx` the `anim-wiggle` class is applied to every option while in the retry state, so all cards shake instead of just the one the child tapped. Wiggle only the tapped wrong card.

3. **Speaker button crowds the question text.** The 🔊 button is absolutely positioned and touches the end of the prompt ("...letter U?🔊"). Give the prompt right padding and the button a bigger tap target (still one tap to re-hear the question) — also in `FlashCards.tsx` if it shares the pattern.

4. **Word Find puzzle page says the theme twice.** The top header reads "Farm Animals" and the section below repeats "🐔 Farm Animals". Change the section heading to something useful like "Find 3 words" (count adapts to level).

5. **Home greeting says "Welcome back, Friend" before setup.** When no child profile exists yet, use "Welcome" (not "Welcome back") and hide the "Friend" placeholder name so the first-run screen reads naturally next to the "Set up your child" card. `src/routes/index.tsx`.

## Verification

- Typecheck (`bunx tsgo --noEmit`) and build.
- Playwright pass at phone size: answer a round correctly (feedback matches the letter and clears with the next question), tap a wrong card (only that card wiggles), open a word find puzzle (single title + "Find N words"), and check the first-run home greeting.
- No changes to sounds, curriculum, progress saving, or premium logic.
