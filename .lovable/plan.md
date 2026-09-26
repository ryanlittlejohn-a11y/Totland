# Build a bespoke Letter Rain interaction

## Confirmed current setup

- Letter Rain is catalog game 17 (`letter-rain`), free, available in Learner and Reader modes, with skill `letters`, kind `findUpper`, and the generic `choice` engine.
- The `findUpper` generator supplies one target and 2 choices at level 1, 3 choices at levels 2–3, and 4 choices at levels 4–5. Letter Rain currently displays those as stationary tap tiles for five rounds.
- Its five `findUpper` siblings are Letter Pop, Feed the Letter Monster, Letter Bubbles, Letter Fishing, and Letter Rocket. Monster and Fishing already have bespoke engines; Pop, Bubbles, Rocket, and Rain currently share `ChoiceGame`.
- Letter Rain already has its own presentation theme: umbrella mascot, clouds/rain decoration, sky palette, drop-shaped options, bilingual “Catch the rainy letter!” cue, and rain sound motif.
- Reduced motion and high contrast are profile settings exposed as document-level attributes. Every existing bespoke scene supplies its own matching styles.

## Decision: falling without rushing

All three approaches preserve five rounds, unlimited thinking time, penalty-free wrong taps, and full reward for each correct catch.

### A. Slow, endlessly returning rain — recommended

- The 2–4 letters from the existing round drift down separate lanes over roughly 9–14 seconds, with staggered starts.
- A letter that reaches the bottom gently disappears into a puddle and returns at the top. The target keeps returning until caught; the round has no deadline, miss counter, game-over, or speed bonus.
- Tapping a wrong letter makes a small splash/wiggle and leaves it available. Nothing is recorded and stars/accuracy do not change.
- This most clearly delivers the promised “catch a falling letter” interaction and differs substantially from stationary choice games. The tradeoff is continuous motion and a child may still *feel* hurried even though there is no consequence for waiting; calm wording and slow cycles will explicitly reinforce “It will come back—take your time.”

### B. Ambient rain with fully self-paced choices

- Letters drift gently but never leave the playable area or trigger any event based on elapsed time. They loop within long vertical tracks and can be tapped whenever the child chooses.
- This is the least pressuring continuous option, but functionally it is closest to the current tap-choice mechanic and therefore the least bespoke.

### C. Fall, land, and wait

- Each round begins with the letters falling once into puddles, where they remain indefinitely until the target is caught. A child may catch during the fall or after everything settles.
- This entirely removes perceived time pressure and sharply reduces ongoing animation/battery use. The tradeoff is that “rain” becomes a short entrance event rather than the core ongoing interaction.

**Recommendation:** Option A, because it preserves the namesake action while making “too slow” mechanically impossible. The implementation will use the selected option; approving this plan without another choice will mean Option A.

## Interaction and progression

- Add a separate `rain` engine and use it only for Letter Rain. Keep the existing `findUpper` round generator, adaptive 2/3/4-letter option count, five-round session, theme, free status, age modes, copy, and catalog objective.
- Create `LetterRainGame` for round state, narration, penalty-free evaluation, rewards, and profile recording, plus `LetterRainScene` for the rain board and accessible controls.
- Speak the target instruction at the start of every round; the instruction remains replayable. Correct catch: letter lands in the umbrella, rain chime, praise plus the existing reveal, two stars, one correct answer record. After five correct catches: full reward, game-completion record, and normal reward screen.
- Wrong catch: gentle splash/refusal, short bilingual retry, no answer record, no miss, no accuracy or star impact. Rate-limit retry narration so repeated taps cannot create overlapping speech.
- Use large letter controls of at least 64px, stable non-overlapping lanes, no timer display, no countdown, no speed score, and no state change merely because a letter reaches the bottom.

## Performance design

- Use real DOM buttons and CSS `transform: translate3d(...)` plus opacity keyframes. CSS handles every animation frame; React only handles taps and infrequent end/iteration events needed to respawn or reposition a letter.
- Do not use React state, `requestAnimationFrame`, or pointer events for per-frame position updates. Do not use canvas: 2–4 letters do not justify it, and canvas would require custom hit testing, focus, keyboard, and screen-reader semantics.
- Cap the scene at the existing maximum of four moving letters, animate only transform/opacity, avoid filters and layout-changing properties, pause motion once a correct answer is caught, and stop/pause it while the page is hidden.
- Local verification will use a phone viewport and a sustained rain run under 4× CPU throttling. It will collect animation-frame intervals, long tasks, task time, and JS heap before/after, and confirm the DOM/letter count remains bounded through repeated respawns. This can expose runaway work, dropped-frame patterns, leaks, and long tasks in Chromium.
- This local benchmark is a directional proxy, not proof of iPhone battery life or WebKit performance. Final confidence on an older iPhone still requires a synced native build and an on-device 3–5 minute play check; no local result will be reported as an actual battery measurement.

## Reduced motion and accessibility

- With either the app setting or the operating-system reduced-motion preference, Letter Rain becomes a static “rain tray”: the same raindrop letter buttons appear in a stable 2-column grid beneath the cloud/umbrella. No falling, looping, splash, wiggle, or catch animation runs; all gameplay, narration, feedback, and rewards remain available.
- The moving visual layer will not be the only accessible interface. Screen readers receive a stable semantic list of letter buttons in DOM order, independent of their animated screen positions; the decorative falling copies are hidden from assistive technology.
- Each accessible button is labeled bilingually as “Letter A,” supports normal tap plus Enter/Space, and remains available regardless of where the visual copy is in its fall cycle. Therefore VoiceOver users can complete all five rounds without tracking motion or reacting within a window.
- A polite live status announces retry, correct catch, reveal, and next-round state without announcing every respawn. Focus remains stable during a round and moves predictably when the next round appears.
- High contrast uses thick ink outlines, solid surfaces, and a non-color-only target/caught state. Touch controls remain at least 44×44px, with the visual letters larger.

## Technical scope

- Add `rain` to the catalog engine type and map it to tap interaction and five rounds; change only the Letter Rain row from `choice` to `rain`.
- Add `LetterRainGame.tsx` and `LetterRainScene.tsx`, route only the new engine through the game host, and add scoped rain/reduced-motion/high-contrast styles.
- Keep this interaction self-contained. Do not add a shared hook: CSS owns motion and native buttons own activation. Do not touch `useDragToTarget`, `usePathTrace`, `DragTarget`, `TracingCanvas`, `ChoiceGame`, the `findUpper` generator, or any sibling row.
- Record the new architectural rule that autonomous moving-target games use CSS-composited animation with a static assistive/reduced-motion path, rather than either drag hook.
- Do not touch authentication, subscriptions, payments, Premium checks, or the parental gate.

## Verification

- Test all five adaptive levels: 2 options at level 1, 3 at levels 2–3, and 4 at levels 4–5; complete five rounds and confirm full reward.
- Verify the selected rain behavior over repeated cycles, target respawn, no deadline, no loss by waiting, and no unbounded DOM growth.
- Verify wrong taps are fully penalty-free; correct catches alone update answer data; waiting through multiple cycles changes no score or progress.
- Complete a full session through the stable VoiceOver/keyboard controls; verify labels, focus order, and live announcements. Verify reduced-motion static mode and high-contrast mode visually.
- Test narrow phone and tablet layouts, no overlap or clipping, background/hidden-page pause, and the throttled performance checks described above.
- Regression-test Letter Fishing, Feed the Letter Monster, Word Rocket, Animal Jigsaw, and Number Maze. Spot-check Letter Pop, Letter Bubbles, and Letter Rocket remain ordinary tap-choice games.
- Run the project checks and confirm the preview build is clean. List every changed file and clearly separate local performance evidence from the remaining real-device check.