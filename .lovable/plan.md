# Catalog Accuracy and New-Content Polish

## Verified current state

- The catalog contains **121 games: 46 free and 75 Premium**. The previously stated 45/76 split is not what the current catalog produces.
- Totland also contains **100 Word Finds (30 free / 70 Premium), 10 storybooks, and 93 flash cards**.
- Home, world, skill-area, parent-dashboard, Word Find, and Subscription totals are generally calculated from the live catalog.
- The Subscription sentence currently resolves accurately to “Free includes 46 games drawn from every world, plus 30 Word Finds.” Its benefit list is also live-derived.
- All 17 new games use valid existing engines and age modes. Lock presentation follows each game’s current Premium flag.
- All five new storybooks have complete five-page English and Spanish versions and use the existing story reader consistently.

## Safe fixes

1. **Remove the remaining stale or hand-typed totals**
   - Change the home social description from “Hundreds of … games” to the live game count.
   - Change the home Adventure label from “5 little games” to “5 games + flash cards,” matching its six real steps.
   - Derive the Terms page’s “first 30 Word Finds” from the same free-count source used by the app.
   - Derive the parent child-profile denominator from the actual alphabet list instead of typing `26`.

2. **Polish the 17 new catalog entries**
   - Replace contributor-style objectives such as “Color recognition, fishing theme” with concise learning outcomes.
   - Add Spanish titles and objectives for every new game; most currently fall back to English.
   - Give each new game a title-matched visual theme instead of the generic fox “Let’s play” presentation.
   - Keep all current age modes and free/Premium flags unchanged.

3. **Preserve the five new stories**
   - No text changes are needed: their English and Spanish copy is complete, age-appropriate, and consistent with the original stories.

## Verification

- Recalculate all four library totals directly from source and confirm every displayed count resolves correctly.
- Check English and Spanish skill lists and game footers for all 17 new titles/objectives.
- Render representative free and locked new games at phone and iPad widths to verify icons, themes, spacing, and lock states.
- Recheck the Subscription screen and confirm it displays 46 free games and 30 free Word Finds without changing purchases, pricing, or the parental gate.
- Check the current preview build and relevant existing tests.

## Flagged for separate decisions

- **Free/Premium split:** leave it at the current 46/75. Moving one game to Premium to create 45/76 changes Premium access and needs explicit approval.
- **Nine new Fishing/Monster/Rain games:** their shared scenes currently render every option as text and announce it as a “letter,” so color and shape variants do not show real swatches/shapes and have incorrect accessibility wording. At beginner level, Color Monster and Shape Monster also insert an unrelated alphabet letter as a third choice. These are gameplay/presentation repairs larger than copy polish; leave them unchanged pending approval.
- **Narration:** the 17 games and five stories have not been checked against the recorded Hannah library. Do not generate audio; retain this as a separate count-only audit.
- **Payments and prices:** do not change the hardcoded website price displays or payment catalog in this pass.
- Do not change the parental gate, scroll fix, sign-in, scoring, purchases, subscriptions, or on-device Premium behavior.

## Technical details

- Count sources remain centralized in `library-counts.ts` and the underlying catalog/content arrays.
- New visual entries use the existing semantic game-theme system; no new engine, SDK, service, or asset dependency is introduced.
- No server or database work is included.