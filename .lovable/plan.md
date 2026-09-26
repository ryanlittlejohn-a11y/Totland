# Game completion fixes and accuracy audit

## Confirmed findings

### Choice-game success visual

- `ChoiceGame` currently keeps the correct tile visible and only enlarges it slightly with an amber highlight; there is no checkmark in this component. The green checkmark overlay is in `HuntGame` for already-found targets.
- The requested behavior applies to every `ChoiceGame` catalog entry using `findUpper` or `findNumber`: Letter Pop, Letter Bubbles, Letter Rocket, Number Pop, Number Bubbles, Number Fishing, and Number Rocket. The bespoke Letter Fishing game is separate and will not be changed.

### Hunt completion root cause

This is a genuine automatic-completion bug; there is no intended or discoverable extra tap.

Two state-lifecycle faults can prevent completion:

1. The completion effect records completion, which broadcasts a profile update. The parent recreates its `onFinish` callback on that update, so the effect cleans up and cancels its own 800 ms reward-screen timer before it fires; it can then run again.
2. The current hunt board is generated from the live skill level. A correct target can level the child up mid-board, regenerate the target set, and invalidate the completed count—especially when moving between the 2-, 3-, and 4-target tiers.

### Sync and privacy accuracy

- When signed out, child learning data remains on the device.
- When signed in, the complete child profile is synced: nickname, age, character/outfit, stars, stickers, badges, companions, completed-game totals, skill attempts/mastery, per-game history, play-time history, favorites, recent games, Word Finds, tracing progress, and the latest adventure.
- Device-wide preferences remain local: language, narration, sound effects, music and volume, reduced motion, high contrast, Premium cache/state, and onboarding state.
- The Privacy Notice, Terms, and parent dashboard body already explain the optional sync accurately.
- Three short public claims are now misleading: the subscription page says learning data is device-only and the account stores only an email; the home footer says all data stays on-device. These need concise “unless you sign in to sync” qualification. The parent dashboard’s metadata says “on-device progress tracking,” but does not claim exclusivity, so it can remain.

### Six bespoke games and other stale copy

- Letter Fishing, Feed the Letter Monster, Word Rocket, Number Maze, and their visible/spoken instructions accurately match their current interactions.
- Letter Rain’s catalog objective says “Quick letter recognition,” contradicting its deliberately slow, no-rush mechanic.
- Animal Jigsaw says “Six-piece jigsaw,” but difficulty actually ranges across 2, 4, 6, and 9 pieces.
- Per-game page descriptions hardcode “ages 2–6.” Word Rocket, Animal Jigsaw, Number Maze, and Letter Rain are only surfaced for the app’s approximately 3–6 modes, so these descriptions should derive the age range from each game’s configured modes.
- No other clearly incorrect live numeric claim was found in the requested spot-check; displayed library totals use live constants. Old aspirational numbers in the internal README are not user-facing and will not be changed.

## Implementation

### A1 — correct-answer pop and disappearance

1. Add a dedicated success state/class for the selected correct tile only when `kind` is `findUpper` or `findNumber`.
2. Animate that tile with a brief, playful scale-up followed by opacity to zero while preserving its grid space until the existing next-round transition, so surrounding choices do not jump.
3. Disable interaction after a correct answer as part of the presentation state.
4. For operating-system or in-app reduced-motion settings, remove the bounce and hide the tile immediately (or with opacity only), following the existing CSS-based reduced-motion convention.
5. Leave scoring, timing, difficulty, generated rounds, wrong-answer behavior, narration, and all other ChoiceGame kinds unchanged.

### A2 — reliable HuntGame completion

1. Freeze each generated hunt board and its level for the lifetime of that mounted game so answers cannot regenerate it mid-hunt.
2. Move final-target detection into the target-selection path using the newly computed found list, guarded so completion records exactly once.
3. Preserve current accuracy, stars, parent stats, sounds, and the short success pause, then call the existing reward-screen flow automatically.
4. Keep found-target visuals and accessibility labels; no extra button or tap will be introduced.

### B — copy corrections

1. On the subscription page, replace the device-only learning-data claim with concise conditional sync wording and correct the “email only” claim to acknowledge synced child profiles and subscription records.
2. Qualify the home footer’s device-data claim for signed-in sync.
3. Change Letter Rain’s objective to a relaxed/no-timer description and Animal Jigsaw’s objective to a level-independent animal-jigsaw description, with matching Spanish translations.
4. Generate each game page’s age description from its configured age modes instead of universally claiming ages 2–6.
5. Keep the already-accurate Privacy Notice, Terms, onboarding context, and bespoke in-game instructions unchanged.

## Verification

- Exercise every `findUpper`/`findNumber` ChoiceGame entry and confirm only the selected correct tile pops away, the layout stays stable, and the next round/reward timing and scores are unchanged.
- Repeat with both operating-system reduced motion and Totland’s reduced-motion setting; confirm no bounce animation and an immediate/simple disappearance.
- Complete Alphabet Safari, Letter Maze, Letter Detective, Number Hunt, Color Detective, Shape Hunt, and Hidden Objects across target-count tiers; confirm each reaches the reward screen automatically, exactly one completion is recorded, and no board changes mid-round.
- Include a hunt case where the final target triggers a skill-level increase to cover the original failure condition.
- Check corrected English and Spanish objectives, the subscription privacy bullets, home footer, and per-game age descriptions in the rendered app.
- Recount catalog games, Word Finds, storybooks, and flash cards from their source collections and compare them with every live displayed total touched by the spot-check.
- Run focused tests and confirm the preview build and browser console are clean.
- Mark the two completed game backlog items in `roadmap.md`; leave unrelated backlog work untouched.

## Expected changed files

- `src/components/game/ChoiceGame.tsx`
- `src/components/game/HuntGame.tsx`
- `src/styles.css`
- `src/routes/parent.subscription.tsx`
- `src/routes/index.tsx`
- `src/routes/game.$gameId.tsx`
- `src/lib/catalog.ts`
- `src/lib/i18n.ts`
- `roadmap.md`
- Focused test files, if the current test setup supports them

No changes to authentication, child-sync behavior, subscriptions or payments, RevenueCat, Paddle, pricing, or the parental gate.
