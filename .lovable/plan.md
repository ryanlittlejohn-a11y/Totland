# Make area progress reflect real game exploration

## Confirmed current behavior

- The green bar on each Home “Skills to practice” card is exactly `skillOf(profile, area.id).level / 5`.
- That value is adaptive difficulty, not completion. Every skill starts at level 1, so an untouched area already appears 20% complete. Three correct recorded answers in a row raise one level; two recorded misses lower one level. It can therefore reach level 5 after as few as 12 consecutive correct answers, while substantial mixed practice can leave it low.
- Named game sessions write `profile.games[gameId] = { plays, stars, bestAccuracy, lastPlayed }` only when a `/game/$gameId` session finishes. This is the reliable source for game-library exploration.
- The named skill page already derives its library with `GAMES.filter(game => game.skill === area.id)`. Flash Cards is the exception: it has no named catalog rows and still uses its single quick-play activity, so no honest per-game completion percentage exists for that area yet.

## Completion definitions considered

1. **Games explored at least once — recommended**
   - Formula: catalog games in the area with `plays > 0` divided by all catalog games in that area.
   - Strengths: simple, stable, child-friendly, and directly answers “how much of this library have we tried?” Replays cannot inflate it.
   - Tradeoff: it measures breadth, not proficiency. A game counts after one finished session regardless of accuracy.

2. **Games completed to an accuracy threshold**
   - Formula example: games whose `bestAccuracy` is at least 80%, divided by all games in the area.
   - Strengths: signals demonstrated success rather than sampling.
   - Tradeoffs: accuracy is not equally meaningful across every game type, some gentle/bespoke games intentionally do not record wrong exploratory actions, and the bar could pressure children or remain low despite valuable play.

3. **Weighted completion using plays, stars, or accuracy**
   - Strength: can represent both breadth and repeat practice.
   - Tradeoff: harder for families to understand and easy to overstate progress through repeated play of only a few games.

## Proposed fix

- Replace the Home level bar with **library exploration**: `(games with plays > 0) / (all catalog games whose skill matches the area)`.
- Show an explicit bilingual count beside it, such as “3 of 17 games explored” / “3 de 17 juegos explorados,” and give the bar matching accessible progress values. The percentage will be rounded only for bar width; the count remains authoritative.
- Count the full named area library, not only the current age-mode subset. This keeps the value stable when age mode changes and matches the existing “Show all ages” access on the named list.
- Do not show a made-up percentage for Flash Cards. Keep its card and route unchanged, but replace the bar with a neutral bilingual “Ready to play” label until it has named per-game records.
- Remove the adaptive difficulty indicator from the child-facing Home cards. Difficulty remains active internally; showing it alongside completion would add clutter and could still be mistaken for achievement.
- Preserve historical exploration on locked cards. This changes only what the bar reports and does not alter access or Premium behavior.

## Related displays checked

- `/worlds` already reports real breadth as `played / total games`; it is truthful and needs no behavioral change.
- Individual world and skill pages show per-game plays and stars, not level-based completion bars; no change needed.
- The parent dashboard’s per-area bars use a separate mastery score based on accuracy, attempt volume, response speed, and a small level contribution—not `level / 5`. Keep that calculation, but rename the section from “Per-area progress” to “Per-area mastery” so it cannot be read as library completion.
- Letter/number mastery coverage, Word Find completion, tracing coverage, and in-session progress indicators use their own real completion data and remain unchanged.
- No other `level / 5` progress bar exists.

## Scope and verification

- Change only the Home area-card display logic and the parent dashboard section label; add a small shared pure calculation helper only if needed for clarity/testing.
- Do not change adaptive difficulty, answer recording, scoring, game sessions, game logic, Premium gating, subscriptions, payments, authentication, or the parental gate.
- Verify untouched, partially explored, and fully explored areas; replaying one game; Flash Cards; locked areas; English/Spanish copy; and confirm world/parent displays still show their intended metrics.
