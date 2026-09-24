# Parent dashboard accuracy and accessibility plan

## What will change

### 1. Make “This week” truthful
Keep the heading **This week**, but calculate the first two values from the current calendar day plus the preceding six calendar days in `stats.days`:

- **Time:** sum of `minutes` in that seven-day window.
- **Games:** sum of `games` in that seven-day window.
- **Accuracy:** keep the existing all-time calculation, but label it explicitly **All-time accuracy**.

A weekly accuracy cannot be reconstructed honestly because each daily record stores only date, minutes, and games; skill attempts and correct answers are cumulative rather than dated. Using a clearly labeled all-time accuracy avoids changing how learning results are recorded.

### 2. Show parent-friendly mastery
For each learning area:

- Calculate the existing `masteryScore()` and pass it to `masteryLabel()`.
- Replace `L{level} · {accuracy}%` with the friendly label alone: **Beginning, Practicing, Progressing, Strong,** or **Mastered**.
- Use the mastery score for the progress-bar fill so the visual bar and label describe the same measure.

The raw level and percentage will no longer be shown in these rows; underlying skill data and scoring remain unchanged.

### 3. Add a functional high-contrast setting
- Add **High contrast** beside the existing narration, sound effects, music, and reduced-motion checkboxes, using the same shared-setting update pattern.
- The preference currently has no visual wiring: it is stored and shared, but no class, attribute, or theme rule reads it.
- Add a small app-level preference bridge, mounted after saved storage is ready, that applies/removes a high-contrast attribute on the document whenever the family setting changes.
- Add high-contrast theme-token overrides for stronger foreground/background separation, clearer borders, and reduced decorative background/shadow interference. This makes the checkbox immediately functional on web and native without changing any platform logic.

## Files expected to change

- `src/routes/parent.index.tsx` — weekly totals, mastery presentation, and checkbox.
- `src/routes/__root.tsx` — synchronize the saved high-contrast preference to the document after storage hydration.
- `src/styles.css` — high-contrast theme overrides.

No subscription pages, parental gate, purchase provider, premium logic, or learning-recording logic will change.

## Verification

- Run the TypeScript check and production build.
- Use Playwright at desktop and phone sizes to verify:
  - weekly minutes/games and the explicit all-time accuracy label;
  - mastery labels replace raw levels/percentages;
  - the high-contrast checkbox visibly changes the theme and remains applied after reload;
  - the parent dashboard layout remains readable without overlap.
