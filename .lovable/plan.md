# Systematic letter and word tracing

## Product decisions proposed

### What counts as covered
A letter form becomes covered immediately after one successful trace at the existing 55% threshold. It will not depend on the general tracing streak, because a successful `A` should not accidentally unlock `B`, and uppercase and lowercase must count separately.

Store two per-child sets:
- uppercase: `A`–`Z`
- lowercase: `a`–`z`

This remains inside the existing family profile, so web and native persistence continue through the current local storage layer without a new storage key or backend change. The addition will be optional and normalized on read so existing profiles migrate without data loss.

### Word progression and age modes

Word tiers unlock only after enough letter forms have been covered, while the selected age mode caps what is offered:

| Tier | Coverage threshold | Explorer (2–3) | Learner (3–4) | Reader (4–6) |
|---|---:|---|---|---|
| Single letters | none | yes | yes | yes |
| 2-letter words | 10 uppercase + 10 lowercase | not shown | yes | yes |
| 3-letter words | 14 uppercase + 14 lowercase | not shown | yes | yes |
| 4-letter words | 18 uppercase + 18 lowercase | not shown | not shown | yes |
| 5-letter words | 22 uppercase + 22 lowercase | not shown | not shown | yes |

This keeps Explorer focused on letter shapes, gives Learner short sight/CVC words, and reserves longer words for Reader. Unlocks are encouraging milestones, not a visible checklist or test on the child screen.

### Free/Premium recommendation — approval required

Recommended access:
- Keep Letter Tracing free.
- Make 2-letter Word Tracing free as a meaningful preview and bridge from letters.
- Make 3-, 4-, and 5-letter Word Tracing Premium because they form the deeper progression.

Alternative: keep 2- and 3-letter tiers free, with only 4- and 5-letter tiers Premium. This is more generous and better supports early literacy before purchase, but gives Premium less differentiation.

**No catalog or access rule will be changed until the user selects one of these options.**

## Word banks

Use separate, natural English and Spanish lists by displayed length; do not translate an English item at runtime when its Spanish translation belongs in another length tier.

### 2 letters
- English: `am, an, at, go, he, hi, in, it, me, my, no, on, to, up, we`
- Spanish: `yo, tú, sí, no, mi, un`

These are new curated sight-word banks because the existing content has no 2-letter words.

### 3 letters
- English: reuse the existing CVC bank: `cat, dog, sun, hat, bus, pig, cow, bee, fox, cup, net, van, bed, key, egg`
- Spanish: reuse known translations where available and add only familiar words: `sol, oso, ojo, pez, pie, red, pan, luz, mar`

### 4 letters
- English, filtered from the existing picture-word bank: `ball, bear, boat, cake, duck, drum, fish, frog, fire, goat, gift, kite, lion, leaf, moon, milk, nest, nose, pear, star, tree, yarn`
- Spanish, drawn mainly from existing translations: `gato, vaca, nube, pato, rana, flor, uvas, casa, miel, tren, luna, mono, nido, búho, pera, cama, taza, mano, pelo, rojo, azul, rosa`

### 5 letters
- English, filtered from the existing picture-word bank: `apple, cloud, donut, horse, house, honey, igloo, juice, koala, lemon, mouse, night, panda, pizza, queen, quilt, robot, snake, socks, tiger, train, whale, wagon, zebra`
- Spanish, drawn from existing translations: `avión, abeja, barco, coche, perro, huevo, zorro, fuego, cabra, llave, koala, limón, ratón, leche, nariz, noche, pulpo, cerdo, panda, pizza, reina, robot, fresa, árbol, tigre, cebra`

Before implementation, validate each list programmatically by grapheme count, lowercase it consistently, remove duplicates, and confirm every accented Spanish word renders correctly in the tracing font.

## Implementation plan

### 1. Add safe per-child coverage data
- Add optional tracing progress to each profile, with separate uppercase, lowercase, and word-tier completion sets.
- Add normalization/helper functions rather than changing the meaning of the shared `SkillStat.mastered` array.
- Preserve existing `skills.tracing` attempts, accuracy, level, and mastery data; do not rewrite or delete it.
- Keep number tracing behavior and stored history intact.

Why: tracing currently records uppercase IDs in one general tracing bucket, even when lowercase is displayed. Explicit namespaced sets are the safest way to distinguish 52 letter forms and future word tiers without colliding with number tracing.

### 2. Replace random-with-replacement letter choice
- Build a session queue from the selected child’s coverage.
- Prioritize uncovered forms, shuffle within that priority, and prevent duplicate forms during a three-item session.
- Mix uppercase and lowercase naturally rather than rigidly alternating when one set needs more practice.
- After all 52 forms are covered, cycle through a shuffled review queue and persist a small recent-history list so recently traced forms are deprioritized across sessions.
- Mark coverage only after the existing 55% success check; a retry keeps the same form.

### 3. Add parent-facing tracing coverage
- Keep the existing “Letters mastered” recognition panel unchanged.
- Add a separate “Letters traced” block using the same compact A–Z grid pattern.
- Each letter cell shows two clear states, `A` and `a`, with totals such as `18 / 26 uppercase` and `14 / 26 lowercase`.
- This avoids presenting letter recognition and handwriting coverage as the same achievement.

### 4. Build word tracing as a focused extension
Create a `WordTracingGame` component that reuses extracted canvas drawing helpers from Letter Tracing but presents **one letter at a time within the word**:

- Show the whole word and picture cue above the canvas.
- Highlight the current letter in a simple progress row, such as `c  a  t`.
- Trace one large letter using the same canvas size, brush, 55% threshold, Clear, Done, spoken instruction, and gentle retry.
- A successful letter advances to the next character; completing the final character covers the word and completes that round.
- Use three words per session, matching the current three-success tracing rhythm.
- Never reset already completed letters because of a later retry.

This approach is preferable to squeezing five letters onto one canvas: each target stays large enough for ages 2–6, the existing forgiving coverage calculation remains meaningful, and accented Spanish glyphs remain legible.

### 5. Keep responsibilities separated
- `TracingGame.tsx`: retain the drawing mechanic, but use systematic letter-form selection and explicit coverage recording.
- Shared tracing canvas/helper: extract the existing pointer painting, reset, and coverage behavior without changing its calculation.
- New `WordTracingGame.tsx`: manage word selection, per-letter progression, picture cue, narration, and word completion.
- Game host: route the four new word-tracing kinds to the new component.
- Content/i18n: add typed bilingual banks and new display strings.
- Catalog: after access approval, add four rows for 2-, 3-, 4-, and 5-letter Word Tracing with the agreed modes and Premium flags.
- Parent dashboard: add the traced uppercase/lowercase coverage block.

### 6. Catalog impact requiring explicit approval
The implementation needs four new catalog rows, so `catalog.ts` must change after approval despite being protected during this planning task:
- Word Tracing: 2 Letters — Learner, Reader
- Word Tracing: 3 Letters — Learner, Reader
- Word Tracing: 4 Letters — Reader
- Word Tracing: 5 Letters — Reader

Adding rows increases the catalog beyond 100. In the same implementation, derive any visible numeric catalog count from `GAMES.length` where it is not already dynamic. Do not alter pricing, checkout, the parental gate, or entitlement logic.

## Narration impact

Add approximately **six bilingual prompt templates**, covering:
1. Trace uppercase letter `{}`.
2. Trace lowercase letter `{}`.
3. Trace the word `{}`.
4. Trace the next letter, `{}`.
5. You traced `{}`.
6. The word `{}` is complete.

Dynamic audio impact depends on the final banks:
- 52 distinct single-letter form prompts per language.
- Up to 76 proposed word prompts per language (15 + 15 + 22 + 24 English; 6 + 9 + 22 + 26 Spanish), plus per-letter-in-word prompts if those exact lines are pre-bundled.
- Roughly **130–250 new distinct Spanish spoken lines**, depending on whether prompts are composed from reusable short clips or generated as full sentences.

No audio should be generated as part of the feature without a separate exact inventory and credit approval. Runtime narration retains the existing bundled → cached → live → device-voice fallback.

## Verification

- Pure tests for profile migration, uppercase/lowercase separation, coverage thresholds, unlock thresholds, no duplicate session items, recent-history fallback, and bilingual word lengths.
- Interaction tests for successful coverage, retry retaining the same target, one-letter-at-a-time word progression, and session completion.
- Parent dashboard checks for empty, partial, and complete A–Z coverage.
- English and Spanish checks for every tier, including accented glyphs.
- Phone and tablet checks for canvas sizing, landscape/portrait rotation, touch interruption, reduced motion, and high contrast.
- Confirm web local storage and packaged-app Preferences both preserve progress across restart and child-profile switching.
- Confirm no timer, penalty, negative feedback, Premium logic change, or parental-gate change.

## Expected changed files after approval

- `src/components/game/TracingGame.tsx`
- New shared tracing-canvas/helper file
- New `src/components/game/WordTracingGame.tsx`
- `src/lib/profile.ts`
- `src/lib/content.ts`
- `src/lib/i18n.ts`
- `src/lib/catalog.ts` — only after access decision
- `src/routes/game.$gameId.tsx`
- `src/routes/parent.index.tsx`
- Targeted new test files
- `roadmap.md`

No code, catalog data, Premium logic, or audio has been changed during this planning task.
